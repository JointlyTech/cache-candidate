import { createHash } from 'crypto';
import { CacheCandidateOptionsDefault } from './default';
import {
  CacheCandidateOptions,
  DataCacheRecordNotFound,
  TimeoutCache,
  RunningQueryCache,
  RunningQueryRecordNotFound,
  TimeFrameCache
} from './models';
import { ExecuteHook, pluginHookWrap } from './plugins';
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
  key,
  runningQueryCache
}): unknown | undefined {
  if (runningQueryCache.has(key)) {
    return runningQueryCache.get(key);
  }
  return RunningQueryRecordNotFound;
}

export function getDataCacheKey(...args: any[]) {
  // Return an obfuscated key
  return createHash('sha256').update(args.join('|')).digest('hex');
}

export function isDataCacheRecordExpired({
  birthTime,
  options
}: {
  birthTime: any;
  options: any;
}) {
  return Date.now() - birthTime >= options.ttl;
}

export async function getDataCacheRecord({
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

export async function addDataCacheRecord({
  options,
  key,
  result,
  HookPayload
}: {
  options: CacheCandidateOptions;
  key: string;
  result: unknown;
  HookPayload: PluginPayload;
}) {
  await ExecuteHook(
    Hooks.DATACACHE_RECORD_ADD_PRE,
    options.plugins,
    HookPayload
  );

  return options.cache
    .set(
      key,
      {
        result,
        birthTime: Date.now()
      },
      options.ttl
    )
    .then(async () => {
      await ExecuteHook(Hooks.DATACACHE_RECORD_ADD_POST, options.plugins, {
        ...HookPayload,
        result
      });
      options.events.onCacheSet({ key });
    });
}

export async function deleteDataCacheRecord({
  options,
  key,
  HookPayload
}: {
  options: CacheCandidateOptions;
  key: string;
  HookPayload: PluginPayload;
}) {
  (
    pluginHookWrap(
      Hooks.DATACACHE_RECORD_DELETE_PRE,
      Hooks.DATACACHE_RECORD_DELETE_POST,
      options,
      HookPayload
    )(options.cache.delete)(key) as Promise<void>
  ).then(() => {
    options.events.onCacheDelete({ key });
  });
}

async function handleResult({
  result,
  runningQueryCache,
  key,
  executionStart,
  options,
  timeframeCache,
  timeoutCache,
  args,
  HookPayload
}: {
  result: unknown;
  runningQueryCache: RunningQueryCache;
  key: string;
  executionStart: number;
  options: CacheCandidateOptions;
  timeframeCache: TimeFrameCache;
  timeoutCache: TimeoutCache;
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
    addDataCacheRecord({ options, key, result, HookPayload }).finally(() => {
      runningQueryCache.delete(key);
      timeoutCache.set(
        key,
        setTimeout(() => {
          deleteDataCacheRecord({ options, key, HookPayload });
          timeoutCache.delete(key);
        }, options.ttl).unref()
      );
    });
  } else {
    runningQueryCache.delete(key);
  }
}

export function getExceedingAmount({
  options,
  key,
  timeframeCache,
  executionTime,
  args
}) {
  let exceedingAmount = 0;
  const timeFrameCacheRecords = timeframeCache.get(key);

  if (options.candidateFunction) {
    // If there's a candidateFunction, execute it once and return the result. It will be forced to the requestsThreshold if true to make the candidate pass.
    exceedingAmount = getExceedingAmountFromCandidateFunction(
      options,
      executionTime,
      args,
      timeFrameCacheRecords
    );
  } else if (options.millisecondThreshold) {
    // If there's an millisecondThreshold, check if the execution time is above the threshold.
    exceedingAmount = getExceedingAmountFromMillisecondThreshold(
      executionTime,
      options,
      timeFrameCacheRecords
    );
  } else {
    // If there's no candidateFunction nor millisecondThreshold, check if the number of times in the timeframeCache is above the threshold.
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
function refreshTimeoutCacheRecord({
  timeoutCache,
  key,
  options,
  HookPayload
}: {
  timeoutCache: TimeoutCache;
  key: string;
  options: CacheCandidateOptions;
  HookPayload: PluginPayload;
}) {
  clearTimeout(timeoutCache.get(key));
  timeoutCache.set(
    key,
    setTimeout(() => {
      deleteDataCacheRecord({ options, key, HookPayload });
      timeoutCache.delete(key);
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
  timeoutCache,
  runningQueryCache,
  timeframeCache,
  args,
  originalMethod
}: {
  options: CacheCandidateOptions;
  key: string;
  timeoutCache: TimeoutCache;
  runningQueryCache: RunningQueryCache;
  timeframeCache: TimeFrameCache;
  args: any[];
  originalMethod: (...args: any[]) => Promise<unknown>;
}) {
  const HookPayload = {
    options: { ...options, plugins: undefined },
    key,
    timeoutCache,
    runningQueryCache,
    timeframeCache,
    fnArgs: args
  };
  await ExecuteHook(Hooks.INIT, options.plugins, HookPayload);
  // Check if result exists in dataCache
  const cachedData = await getDataCacheRecord({ options, key, HookPayload });
  if (cachedData !== DataCacheRecordNotFound) {
    if (options.keepAlive) {
      refreshTimeoutCacheRecord({
        timeoutCache,
        key,
        options,
        HookPayload
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
    key,
    runningQueryCache
  });

  if (runningQuery !== RunningQueryRecordNotFound) {
    await ExecuteHook(Hooks.CACHE_HIT, options.plugins, {
      ...HookPayload,
      result: runningQuery
    });
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
      timeoutCache,
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
      timeoutCache,
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

  const timeoutCache: TimeoutCache = new Map();

  const options: CacheCandidateOptions = {
    ...CacheCandidateOptionsDefault,
    ..._options
  };

  return {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    timeoutCache,
    options
  };
}
