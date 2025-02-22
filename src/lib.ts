import { Hooks } from '@jointly/cache-candidate-plugin-base';
import {
  getDataCacheKey,
  letsCandidate,
  getInitialState,
  getDataCacheRecord,
  addDataCacheRecord,
  deleteDataCacheRecord,
  isDataCacheRecordExpired,
  getExceedingAmount,
  checkExpirationMode
} from './internal';

import { CacheCandidateInputOptions } from './models';
import { checkHooks, ExecuteHook } from './plugins';

export function cacheCandidate<T extends (...args: any[]) => any>(
  fn: T,
  _options: CacheCandidateInputOptions = {}
): (
  ...args: Parameters<T>
) => ReturnType<T> extends Promise<any>
  ? ReturnType<T>
  : Promise<ReturnType<T>> {
  const {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    timeoutCache,
    options,
    staleMap
  } = getInitialState(_options);

  checkHooks({ options });
  checkExpirationMode(options);

  ExecuteHook(Hooks.SETUP, options.plugins, {
    options: { ...options, plugins: undefined },
    key: '',
    timeoutCache,
    runningQueryCache,
    timeframeCache,
    fnArgs: [],
    internals: {
      getDataCacheKey,
      getDataCacheRecord,
      addDataCacheRecord,
      deleteDataCacheRecord,
      isDataCacheRecordExpired,
      getExceedingAmount
    }
  });

  return function cacheCandidateWrapper(
    ...args: Parameters<T>
  ): ReturnType<T> extends Promise<any>
    ? ReturnType<T>
    : Promise<ReturnType<T>> {
    return letsCandidate({
      options,
      key: _options.customKeyFunction
        ? _options.customKeyFunction(args)
        : getDataCacheKey([uniqueIdentifier, JSON.stringify(args)]),
      timeoutCache,
      runningQueryCache,
      timeframeCache,
      args,
      staleMap,
      originalMethod: fn
    }) as ReturnType<T> extends Promise<any>
      ? ReturnType<T>
      : Promise<ReturnType<T>>;
  };
}
