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

import { CacheCandidateOptions } from './models';
import { checkHooks, ExecuteHook } from './plugins';

export function CacheCandidate(_options: Partial<CacheCandidateOptions> = {}) {
  const {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    timeoutCache,
    options
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
      getDataCacheRecord,
      addDataCacheRecord,
      deleteDataCacheRecord,
      isDataCacheRecordExpired,
      getDataCacheKey,
      getExceedingAmount
    }
  });

  return function (
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
        originalMethod
      });
    };
  };
}

export function cacheCandidate(
  fn: (...args: any[]) => any,
  _options: Partial<CacheCandidateOptions> = {}
) {
  const {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    timeoutCache,
    options
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
      getDataCacheRecord,
      addDataCacheRecord,
      deleteDataCacheRecord,
      isDataCacheRecordExpired,
      getDataCacheKey,
      getExceedingAmount
    }
  });

  return async (...args: any[]) =>
    letsCandidate({
      options,
      key: getDataCacheKey([uniqueIdentifier, JSON.stringify(args)]),
      timeoutCache,
      runningQueryCache,
      timeframeCache,
      args,
      originalMethod: fn
    });
}
