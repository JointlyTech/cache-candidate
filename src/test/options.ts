import { CacheCandidateOptions } from '../models';
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export const TTL = 100;
export const EXECUTION_MARGIN = 50; // A margin of error for the execution time. This is because the execution time is not 100% accurate and can vary based on the machine.
export const ENOUGH_TIME = 250;

export function step() {
  let internalStep = 0;
  return () => {
    return ++internalStep;
  };
}

export const eventHits = new Map([
  ['onCacheHit', 0],
  ['onCacheSet', 0],
  ['onCacheDelete', 0],
  ['onBeforeFunctionExecution', 0],
  ['onAfterFunctionExecution', 0],
  ['onLog', 0]
]);

export const options: Partial<CacheCandidateOptions> = {
  requestsThreshold: 1,
  ttl: TTL,
  events: {
    onCacheHit: (_) => {
      eventHits.set('onCacheHit', (eventHits.get('onCacheHit') || 0) + 1);
      return _;
    },
    onCacheSet: (_) => {
      eventHits.set('onCacheSet', (eventHits.get('onCacheSet') || 0) + 1);
      return _;
    },
    onCacheDelete: (_) => {
      eventHits.set('onCacheDelete', (eventHits.get('onCacheDelete') || 0) + 1);
      return _;
    },
    onBeforeFunctionExecution: (_) => {
      eventHits.set(
        'onBeforeFunctionExecution',
        (eventHits.get('onBeforeFunctionExecution') || 0) + 1
      );
      return _;
    },
    onAfterFunctionExecution: (_) => {
      eventHits.set(
        'onAfterFunctionExecution',
        (eventHits.get('onAfterFunctionExecution') || 0) + 1
      );
      return _;
    },
    onLog: (_) => {
      eventHits.set('onLog', (eventHits.get('onLog') || 0) + 1);
      return _;
    }
  }
};

export function flushMaps() {
  for (const [key] of eventHits) {
    eventHits.set(key, 0);
  }
}
