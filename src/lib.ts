import { getDataCacheKey, letsCandidate, getInitialState } from './internal';

import { CacheCandidateOptions } from './models';

export function CacheCandidate(_options: Partial<CacheCandidateOptions> = {}) {
  const {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    keepAliveTimeoutCache,
    options
  } = getInitialState(_options);

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
      const key = getDataCacheKey([
        target.constructor.name,
        propertyKey,
        uniqueIdentifier,
        instanceIdentifier,
        JSON.stringify(args)
      ]);

      return letsCandidate({
        options,
        key,
        keepAliveTimeoutCache,
        runningQueryCache,
        timeframeCache,
        args,
        originalMethod
      });
    };
  };
}

export function cacheCandidate(
  fn: Function,
  _options: Partial<CacheCandidateOptions> = {}
) {
  const {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    keepAliveTimeoutCache,
    options
  } = getInitialState(_options);

  // Execute the function and get the execution times.
  return async function (...args: any[]) {
    const key = getDataCacheKey([uniqueIdentifier, JSON.stringify(args)]);

    return letsCandidate({
      options,
      key,
      keepAliveTimeoutCache,
      runningQueryCache,
      timeframeCache,
      args,
      originalMethod: fn
    });
  };
}
