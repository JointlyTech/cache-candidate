import { createHash } from 'crypto';
import { CacheCandidateOptionsDefault } from './default';
import {
  CacheCandidateOptions,
  DataCacheRecordNotFound,
  Events,
  KeepAliveCache,
  RunningQueryCache,
  RunningQueryRecordNotFound,
  TimeFrameCache
} from './models';
import { ExecuteHook } from './plugins';
import { Hooks, PluginPayload } from '@jointly/cache-candidate-plugin-base';

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
  runningQueryCache
}): unknown | undefined {
  if (runningQueryCache.has(key)) {
    options.events.onLog({ key, event: Events.RUNNING_QUERY });
    return runningQueryCache.get(key);
  }
  return RunningQueryRecordNotFound;
}

export function getDataCacheKey(...args: any[]) {
  // Return an obfuscated key
  return createHash('sha256').update(args.join('|')).digest('hex');
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
  key,
  HookPayload
}): Promise<unknown | undefined> {
  if (await options.cache.has(key)) {
    const { result, birthTime } = await options.cache.get(key);
    // Remove the dataCache record if the time frame has passed.
    if (isDataCacheRecordExpired({ birthTime, options })) {
      await deleteDataCacheRecord({ options, key, HookPayload });
      return DataCacheRecordNotFound;
    } else {
      // Return the cached data
      return result;
    }
  }
  return DataCacheRecordNotFound;
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

async function deleteDataCacheRecord({ options, key, HookPayload }) {
  await ExecuteHook(
    Hooks.DATACACHE_RECORD_DELETE_PRE,
    options.plugins,
    HookPayload
  );
  await options.cache.delete(key);
  await ExecuteHook(
    Hooks.DATACACHE_RECORD_DELETE_POST,
    options.plugins,
    HookPayload
  );
  options.events.onCacheDelete({ key });
}

async function handleResult({
  result,
  runningQueryCache,
  key,
  executionStart,
  options,
  timeframeCache,
  keepAliveTimeoutCache,
  args,
  HookPayload
}: {
  result: unknown;
  runningQueryCache: RunningQueryCache;
  key: string;
  executionStart: number;
  options: CacheCandidateOptions;
  timeframeCache: TimeFrameCache;
  keepAliveTimeoutCache: KeepAliveCache;
  args: any[];
  HookPayload: PluginPayload;
}): Promise<void> {
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
    await ExecuteHook(
      Hooks.DATACACHE_RECORD_ADD_PRE,
      options.plugins,
      HookPayload
    );
    addDataCacheRecord({ options, key, result })
      .then(async () => {
        await ExecuteHook(Hooks.DATACACHE_RECORD_ADD_POST, options.plugins, {
          ...HookPayload,
          result
        });
        options.events.onCacheSet({ key });
      })
      .finally(() => {
        runningQueryCache.delete(key);
        keepAliveTimeoutCache.set(
          key,
          setTimeout(() => {
            deleteDataCacheRecord({ options, key, HookPayload });
          }, options.ttl).unref()
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
  if (options.candidateFunction({ timeFrameCacheRecords, options, args }))
    exceedingAmount = options.requestsThreshold;
  return exceedingAmount;
}
function refreshKeepAliveRecord({
  keepAliveTimeoutCache,
  key,
  options
}: {
  keepAliveTimeoutCache: KeepAliveCache;
  key: string;
  options: CacheCandidateOptions;
}) {
  clearTimeout(keepAliveTimeoutCache.get(key));
  keepAliveTimeoutCache.set(
    key,
    setTimeout(() => {
      options.cache.delete(key);
    }, options.ttl).unref()
  );
}

export function uniqid(length = 10) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

export async function letsCandidate({
  options,
  key,
  keepAliveTimeoutCache,
  runningQueryCache,
  timeframeCache,
  args,
  originalMethod
}: {
  options: CacheCandidateOptions;
  key: string;
  keepAliveTimeoutCache: KeepAliveCache;
  runningQueryCache: RunningQueryCache;
  timeframeCache: TimeFrameCache;
  args: any[];
  originalMethod: (...args: any[]) => Promise<unknown>;
}) {
  const HookPayload = {
    options: { ...options, plugins: undefined },
    key,
    keepAliveTimeoutCache,
    runningQueryCache,
    timeframeCache,
    fnArgs: args
  };
  await ExecuteHook(Hooks.INIT, options.plugins, HookPayload);
  // Check if result exists in dataCache
  const cachedData = await getDataCacheRecord({ options, key, HookPayload });
  if (cachedData !== DataCacheRecordNotFound) {
    if (options.keepAlive) {
      refreshKeepAliveRecord({
        keepAliveTimeoutCache,
        key,
        options
      });
    }

    await ExecuteHook(Hooks.CACHE_HIT, options.plugins, {
      ...HookPayload,
      result: cachedData
    });
    options.events.onCacheHit({ key });
    return Promise.resolve(cachedData);
  }

  // Check if Promise exists in runningQueryCache
  const runningQuery = getRunningQueryRecord({
    options,
    key,
    runningQueryCache
  });

  if (runningQuery !== RunningQueryRecordNotFound) {
    await ExecuteHook(Hooks.CACHE_HIT, options.plugins, {
      ...HookPayload,
      result: runningQuery
    });
    options.events.onCacheHit({ key });
    return runningQuery;
  }

  // Check the timeframeCache and delete every element that has passed the time frame.
  expireTimeFrameCacheRecords({ options, key, timeframeCache });

  // Execute the function
  await ExecuteHook(Hooks.EXECUTION_PRE, options.plugins, HookPayload);
  options.events.onBeforeFunctionExecution({ key });
  const executionStart = Date.now();
  const execution = originalMethod(...args);
  await ExecuteHook(Hooks.EXECUTION_POST, options.plugins, {
    ...HookPayload,
    result: execution
  });
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
      args,
      HookPayload
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
      args,
      HookPayload
    })
  );

  return execution;
}

export function getInitialState(_options: Partial<CacheCandidateOptions>) {
  // Create an in-function cache
  const timeframeCache: TimeFrameCache = new Map();

  // Create an in-function running queries index
  const runningQueryCache: RunningQueryCache = new Map();

  // Generate a uniqid
  const uniqueIdentifier = uniqid();

  const keepAliveTimeoutCache: KeepAliveCache = new Map();

  const options: CacheCandidateOptions = {
    ...CacheCandidateOptionsDefault,
    ..._options
  };

  return {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    keepAliveTimeoutCache,
    options
  };
}
