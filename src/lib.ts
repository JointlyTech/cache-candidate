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
        target.constructor.name,
        propertyKey,
        uniqueIdentifier,
        instanceIdentifier,
        JSON.stringify(args)
      ]);

      return letsCandidate({
        options,
        key: dataCacheKey,
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
  fn: (...args: any[]) => any,
  _options: Partial<CacheCandidateOptions> = {}
) {
  const {
    timeframeCache,
    runningQueryCache,
    uniqueIdentifier,
    keepAliveTimeoutCache,
    options
  } = getInitialState(_options);

  return async (...args: any[]) =>
    letsCandidate({
      options,
      key: getDataCacheKey([uniqueIdentifier, JSON.stringify(args)]),
      keepAliveTimeoutCache,
      runningQueryCache,
      timeframeCache,
      args,
      originalMethod: fn
    });
}
