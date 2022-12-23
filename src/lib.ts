import { createHash } from 'crypto';
import { CacheCandidateOptionsDefault } from './default';
import { manager } from './manager';

import {
  CacheCandidateOptions,
  Events,
  KeepAliveCache,
  RunningQueryCache,
  TimeFrameCache
} from './models';

export function CacheCandidate(_options: Partial<CacheCandidateOptions> = {}) {
  const options: CacheCandidateOptions = {
    ...CacheCandidateOptionsDefault,
    ..._options
  };
  // Create an in-function cache
  const timeframeCache: TimeFrameCache = new Map();

  // Create an in-function running queries index
  const runningQueryCache: RunningQueryCache = new Map();

  // Generate a uniqid
  const uniqueIdentifier = uniqid();

  const keepAliveTimeoutCache: KeepAliveCache = new Map();

  // Execute the function and get the execution times.
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // A uniqid generated for each instance of the class. It uses the instance properties to generate the id. (JSON.stringify)
      const instanceIdentifier = target.constructor.name + JSON.stringify(this);
      const key = getDataCacheKey({
        target,
        propertyKey,
        uniqueIdentifier,
        instanceIdentifier,
        args
      });

      // Check if result exists in dataCache
      const cachedData = await getDataCacheRecord({ options, key });
      if (typeof cachedData !== 'undefined') {
        if (options.keepAlive) {
          clearTimeout(keepAliveTimeoutCache.get(key));
          keepAliveTimeoutCache.set(
            key,
            setTimeout(() => {
              options.cache.delete(key);
            }, options.ttl)
          );
        }
        return new Promise((resolve) => resolve(cachedData));
      }

      // Check if Promise exists in runningQueries
      const runningQuery = getRunningQueryRecord({
        options,
        key,
        runningQueries: runningQueryCache
      });
      if (typeof runningQuery !== 'undefined') return runningQuery;

      // Check the timeframeCache and delete every element that has passed the time frame.
      expireTimeFrameCacheRecords({ options, key, timeframeCache });

      // Execute the function
      options.events.onBeforeFunctionExecution({ key });
      const executionStart = Date.now();
      const execution = originalMethod.apply(this, args);
      // If execution is not a promise, handle the result and return it.
      if (!(execution instanceof Promise)) {
        handleResult({
          result: execution,
          runningQueryCache,
          key,
          executionStart,
          options,
          timeframeCache,
          keepAliveTimeoutCache,
          args
        });
        return execution;
      }

      runningQueryCache.set(key, execution);
      execution.then((result: unknown) =>
        handleResult({
          result,
          runningQueryCache,
          key,
          executionStart,
          options,
          timeframeCache,
          keepAliveTimeoutCache,
          args
        })
      );

      return execution;
    };
  };
}

function isTimeFrameCacheRecordExpired(executionEnd: any, options: any) {
  return Date.now() < executionEnd + options.timeFrame;
}

function addTimeFrameCacheRecord({
  key,
  timeframeCache,
  executionTime,
  executionEnd
}) {
  if (timeframeCache.has(key)) {
    timeframeCache.get(key).push({
      executionTime,
      executionEnd
    });
  } else {
    timeframeCache.set(key, [{ executionEnd, executionTime }]);
  }
}

function expireTimeFrameCacheRecords({ options, key, timeframeCache }) {
  if (timeframeCache.has(key)) {
    const executionTimes = timeframeCache.get(key);
    const filteredExecutionTimes = executionTimes.filter(({ executionEnd }) =>
      isTimeFrameCacheRecordExpired(executionEnd, options)
    );
    if (executionTimes.length !== filteredExecutionTimes.length) {
      timeframeCache.set(key, filteredExecutionTimes);
    }
  }
}

function getRunningQueryRecord({
  options,
  key,
  runningQueries
}): unknown | undefined {
  if (runningQueries.has(key)) {
    options.events.onLog({ key, event: Events.RUNNING_QUERY });
    return runningQueries.get(key);
  }
  return undefined;
}

function getDataCacheKey({
  target,
  propertyKey,
  uniqueIdentifier,
  instanceIdentifier,
  args
}: {
  target: any;
  propertyKey: string;
  uniqueIdentifier: string;
  instanceIdentifier: string;
  args: any[];
}) {
  const consideredKeys = [
    uniqueIdentifier,
    instanceIdentifier,
    target.constructor.name,
    propertyKey,
    JSON.stringify(args)
  ];
  // Return an obfuscated key
  return createHash('sha256').update(consideredKeys.join('')).digest('hex');
}

function isDataCacheRecordExpired({
  birthTime,
  options
}: {
  birthTime: any;
  options: any;
}) {
  return Date.now() - birthTime >= options.timeFrame;
}

async function getDataCacheRecord({
  options,
  key
}): Promise<unknown | undefined> {
  if (await options.cache.has(key)) {
    const { result, birthTime } = await options.cache.get(key);
    // Remove the dataCache record if the time frame has passed.
    if (isDataCacheRecordExpired({ birthTime, options })) {
      await deleteDataCacheRecord({ options, key });
      return undefined;
    } else {
      // Return the cached data
      options.events.onCacheHit({ key });
      return result;
    }
  }
  return undefined;
}

async function addDataCacheRecord({ options, key, result }) {
  return options.cache.set(
    key,
    {
      result,
      birthTime: Date.now()
    },
    options.ttl
  );
}

async function deleteDataCacheRecord({ options, key }) {
  await options.cache.delete(key);
  options.events.onCacheDelete({ key });
  manager.deleteKey(key);
}

function handleResult({
  result,
  runningQueryCache,
  key,
  executionStart,
  options,
  timeframeCache,
  keepAliveTimeoutCache,
  args
}: {
  result: unknown;
  runningQueryCache: RunningQueryCache;
  key: string;
  executionStart: number;
  options: CacheCandidateOptions;
  timeframeCache: TimeFrameCache;
  keepAliveTimeoutCache: KeepAliveCache;
  args: any[];
}): any {
  const executionEnd = Date.now();
  const executionTime = executionEnd - executionStart;
  options.events.onAfterFunctionExecution({ key, executionTime });

  // Save in the timeframeCache for requests threshold checks
  addTimeFrameCacheRecord({
    key,
    timeframeCache,
    executionTime,
    executionEnd
  });

  const exceedingAmount = getExceedingAmount({
    options,
    key,
    timeframeCache,
    executionTime,
    args
  });

  if (exceedingAmount >= options.requestsThreshold) {
    addDataCacheRecord({ options, key, result })
      .then(() => {
        options.events.onCacheSet({ key });
        if(options.dependencyKeys) {
          manager.register({ key, dependencyKeys: options.dependencyKeys, cacheAdapter: options.cache });
        }
      })
      .finally(() => {
        runningQueryCache.delete(key);
        keepAliveTimeoutCache.set(
          key,
          setTimeout(() => {
            deleteDataCacheRecord({ options, key });
          }, options.ttl)
        );
      });
  }
}

function getExceedingAmount({
  options,
  key,
  timeframeCache,
  executionTime,
  args
}) {
  let exceedingAmount = 0;
  const timeFrameCacheRecords = timeframeCache.get(key);

  if (options.candidateFunction) {
    // If there's a candidateFunction, execute it for every element in the timeframeCache and return the amount of true values.
    options.events.onLog({ key, event: Events.CHECKING_CANDIDATE_FUNCTION });
    exceedingAmount = getExceedingAmountFromCandidateFunction(
      options,
      executionTime,
      args,
      timeFrameCacheRecords
    );
  } else if (options.millisecondThreshold) {
    // If there's an millisecondThreshold, check if the execution time is above the threshold.
    options.events.onLog({ key, event: Events.CHECKING_MILLISECOND_THRESHOLD });
    exceedingAmount = getExceedingAmountFromMillisecondThreshold(
      executionTime,
      options,
      timeFrameCacheRecords
    );
  } else {
    // If there's no candidateFunction nor millisecondThreshold, check if the number of times in the timeframeCache is above the threshold.
    options.events.onLog({ key, event: Events.CHECKING_REQUESTS_THRESHOLD });
    exceedingAmount = timeFrameCacheRecords.length;
  }
  return exceedingAmount;
}

function getExceedingAmountFromMillisecondThreshold(
  executionTime: any,
  options: any,
  timeFrameCacheRecords: any
) {
  let exceedingAmount = 0;
  if (executionTime > options.millisecondThreshold) {
    // If it is, check how many times in the timeframeCache the execution time is above the threshold.
    exceedingAmount = timeFrameCacheRecords.filter(
      (timeFrameCacheRecord) =>
        timeFrameCacheRecord.executionTime > options.millisecondThreshold
    ).length;
  }
  return exceedingAmount;
}

function getExceedingAmountFromCandidateFunction(
  options: any,
  executionTime: any,
  args: any,
  timeFrameCacheRecords: any
) {
  let exceedingAmount = 0;
  /*if (options.candidateFunction(executionTime, ...args)) {
    for (const timeFrameCacheRecord of timeFrameCacheRecords) {
      if (
        options.candidateFunction(timeFrameCacheRecord.executionTime, ...args)
      )
        exceedingAmount++;
    }
  }*/
  if (options.candidateFunction({ timeFrameCacheRecords, options, args }))
    exceedingAmount = options.requestsThreshold;
  return exceedingAmount;
}
function uniqid(length = 10) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}
