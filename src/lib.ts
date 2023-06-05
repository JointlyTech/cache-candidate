import { Hooks } from '@jointly/cache-candidate-plugin-base';
import {
  getDataCacheKey,
  letsCandidate,
  getInitialState,
  getDataCacheRecord,
  addDataCacheRecord,
  deleteDataCacheRecord,
  isDataCacheRecordExpired,
  getExceedingAmount
} from './internal';

import { CacheCandidateInputOptions } from './models';
import { checkHooks, ExecuteHook } from './plugins';

export function CacheCandidate(_options: CacheCandidateInputOptions = {}) {
  const {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    timeoutCache,
    options,
    staleData
  } = getInitialState(_options);

  checkHooks({ options });

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
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // A uniqid generated for each instance of the class. It uses the instance properties to generate the id. (JSON.stringify)
      const instanceIdentifier = target.constructor.name + JSON.stringify(this);
      const dataCacheKey = getDataCacheKey([
        propertyKey,
        uniqueIdentifier,
        instanceIdentifier,
        JSON.stringify(args)
      ]);

      return letsCandidate({
        options,
        key: dataCacheKey,
        timeoutCache,
        runningQueryCache,
        timeframeCache,
        args,
        staleData,
        originalMethod
      });
    };
  };
}

export function cacheCandidate<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  _options: CacheCandidateInputOptions = {}
) {
  const {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    timeoutCache,
    options,
    staleData
  } = getInitialState(_options);

  checkHooks({ options });

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

  return function cacheCandidateWrapper(...args: Parameters<T>): ReturnType<T> {
    return letsCandidate({
      options,
      key: getDataCacheKey([uniqueIdentifier, JSON.stringify(args)]),
      timeoutCache,
      runningQueryCache,
      timeframeCache,
      args,
      staleData,
      originalMethod: fn
    }) as ReturnType<T>;
  };
}
