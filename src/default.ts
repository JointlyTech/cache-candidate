import { makeAsyncMap } from './cache-adapters/memory';
import { CacheCandidateOptions } from './models';

export const CacheCandidateOptionsDefault: CacheCandidateOptions = {
  ttl: 600000,
  timeFrame: 30000,
  requestsThreshold: 3,
  cache: makeAsyncMap(),
  keepAlive: false,
  plugins: [],
  events: {
    onCacheHit: (_) => {
      return _;
    },
    onCacheSet: (_) => {
      return _;
    },
    onCacheDelete: (_) => {
      return _;
    },
    onBeforeFunctionExecution: (_) => {
      return _;
    },
    onAfterFunctionExecution: (_) => {
      return _;
    },
    onLog: (_) => {
      return _;
    }
  }
};
