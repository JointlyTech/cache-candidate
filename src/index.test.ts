import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CacheCandidatePlugin,
  Hooks
} from '@jointly/cache-candidate-plugin-base';
import { cacheCandidate } from './lib';
import {
  step,
  eventHits,
  sleep,
  ENOUGH_TIME,
  TTL,
  EXECUTION_MARGIN,
  flushMaps,
  options
} from './test/options';

const stepper = step();

test.beforeEach(async () => {
  await sleep(ENOUGH_TIME);
  flushMaps();
});

test.describe('Basic Test Environment', async () => {
  await test('should verify cache is empty', async () => {
    assert.equal(eventHits.get('onCacheSet'), 0);
    assert.equal(eventHits.get('onCacheHit'), 0);
    assert.equal(eventHits.get('onCacheDelete'), 0);
  });
});

test.describe('Higher-Order Function', async () => {
  await test('should separate the cache entries for different functions with same parameters', async () => {
    const step = stepper();
    const mockFn1 = (x: number) => x;
    const mockFn2 = (x: number) => x;
    const wrappedMockFn1 = cacheCandidate(mockFn1, options);
    const wrappedMockFn2 = cacheCandidate(mockFn2, options);

    await wrappedMockFn1(step);
    await sleep(TTL + EXECUTION_MARGIN);
    await wrappedMockFn2(step);
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheSet'), 2);
    assert.equal(eventHits.get('onCacheHit'), 0);
  });

  await test('should call onCacheDelete for sync method', async () => {
    const mockFn = () => {};
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheDelete: () => {
          eventHits.set('onCacheDelete', eventHits.get('onCacheDelete')! + 1);
        }
      }
    });
    wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheDelete'), 1);
  });

  await test('should call onCacheDelete for async method', async () => {
    const mockFn = () => Promise.resolve();
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheDelete: () => {
          eventHits.set('onCacheDelete', eventHits.get('onCacheDelete')! + 1);
        }
      }
    });
    await wrappedMockFn();
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheDelete'), 1);
  });

  await test('should call onCacheSet for sync method', async () => {
    const mockFn = () => {};
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheSet: () => {
          eventHits.set('onCacheSet', eventHits.get('onCacheSet')! + 1);
        }
      }
    });
    wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheSet'), 1);
  });

  await test('should call onCacheSet for async method', async () => {
    const mockFn = () => Promise.resolve();
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheSet: () => {
          eventHits.set('onCacheSet', eventHits.get('onCacheSet')! + 1);
        }
      }
    });
    await wrappedMockFn();
    await wrappedMockFn();
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheSet'), 1);
  });

  await test('should call onCacheHit for sync method', async () => {
    const mockFn = () => {};
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheHit: () => {
          eventHits.set('onCacheHit', eventHits.get('onCacheHit')! + 1);
        }
      }
    });
    wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheHit'), 1);
  });

  await test('should call onCacheHit for async method', async () => {
    const mockFn = () => Promise.resolve();
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheHit: () => {
          eventHits.set('onCacheHit', eventHits.get('onCacheHit')! + 1);
        }
      }
    });
    await wrappedMockFn();
    await wrappedMockFn();
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheHit'), 1);
  });

  await test('should allow for custom getDataCacheKey functions', async () => {
    const mockFn = () => {};
    const wrappedMockFn = cacheCandidate(mockFn, {
      customKeyFunction: () => 'custom-key',
      events: {
        onCacheSet: ({ key }) => {
          assert.equal(key, 'custom-key');
        }
      }
    });
    wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
  });
});

test.describe('Library-wide Conditions', async () => {
  await test("should throw if expirationMode is 'eject' and 'keepAlive' is true", async () => {
    assert.throws(() => {
      cacheCandidate(() => Promise.resolve(true), {
        expirationMode: 'eject',
        keepAlive: true
      });
    });
  });

  await test("should not call onCacheDelete when expirationMode is 'eject' and ttl has passed", async () => {
    const mockFn = () => {};
    const wrappedMockFn = cacheCandidate(mockFn, {
      expirationMode: 'eject',
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheDelete: () => {
          eventHits.set('onCacheDelete', eventHits.get('onCacheDelete')! + 1);
        }
      }
    });
    wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheDelete'), 0);
  });

  await test("should call onCacheDelete when expirationMode is 'timeout-only' and ttl has passed", async () => {
    const mockFn = () => {};
    const wrappedMockFn = cacheCandidate(mockFn, {
      expirationMode: 'timeout-only',
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheDelete: () => {
          eventHits.set('onCacheDelete', eventHits.get('onCacheDelete')! + 1);
        }
      }
    });
    wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(eventHits.get('onCacheDelete'), 1);
  });

  await test('should empty the timeframe cache after timeframe has passed', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        setTimeout(() => {
          counter += step;
          resolve(counter);
        }, EXECUTION_MARGIN);
      });
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: EXECUTION_MARGIN * 2,
      ttl: EXECUTION_MARGIN * 2
    });

    await wrappedMockFn(1);
    assert.equal(counter, 1);
    await sleep(EXECUTION_MARGIN);
    await wrappedMockFn(1);
    assert.equal(counter, 1);
    await sleep(EXECUTION_MARGIN);
    await wrappedMockFn(1);
    assert.equal(counter, 2);
  });

  await test('should delete the data cache after ttl has passed even if timeframe is not', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        setTimeout(() => {
          counter += step;
          resolve(counter);
        }, EXECUTION_MARGIN);
      });
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: EXECUTION_MARGIN * 2,
      ttl: EXECUTION_MARGIN
    });

    await wrappedMockFn(1);
    assert.equal(counter, 1);
    await sleep(EXECUTION_MARGIN);
    await wrappedMockFn(1);
    assert.equal(counter, 2);
    await sleep(EXECUTION_MARGIN);
    await wrappedMockFn(1);
    assert.equal(counter, 3);
  });

  await test('should return stale value when ttl has passed and fetchingMode is stale-while-revalidate', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        setTimeout(() => {
          counter += step;
          resolve(counter);
        }, 0);
      });
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      ttl: TTL,
      fetchingMode: 'stale-while-revalidate'
    });

    let result;
    result = await wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(result, 1);
    assert.equal(counter, 1);
    result = await wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(result, 1);
    assert.equal(counter, 2);
    result = await wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
    assert.equal(result, 2);
    assert.equal(counter, 3);
  });

  await test('should remove failed queries from running query cache', async () => {
    let attempts = 0;
    const mockFn = () => {
      attempts++;
      if (attempts === 1) {
        return Promise.reject(new Error('test error'));
      }
      return Promise.resolve('success');
    };

    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1
    });

    await assert.rejects(wrappedMockFn(), {
      message: 'test error'
    });

    const result = await wrappedMockFn();
    assert.equal(result, 'success');
    assert.equal(attempts, 2);
  });

  await test('should cache based on millisecondThreshold', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        setTimeout(() => {
          counter += step;
          resolve(counter);
        }, 50); // Simulate slow operation
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      millisecondThreshold: 25, // Cache if execution takes longer than 25ms
      requestsThreshold: 1,
      ttl: TTL
    });

    const result1 = await wrappedMockFn(1);
    assert.equal(result1, 1);
    const result2 = await wrappedMockFn(1);
    assert.equal(result2, 1); // Should return cached result
    assert.equal(counter, 1); // Function should only execute once
  });

  await test('should cache based on candidateFunction result', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        setTimeout(() => {
          counter += step;
          resolve(counter);
        }, EXECUTION_MARGIN);
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      candidateFunction: async ({ timeFrameCacheRecords, args }) => {
        // Cache if first argument is 1 and there's at least one previous execution
        return args[0] === 1 && timeFrameCacheRecords.length >= 1;
      },
      requestsThreshold: 1,
      ttl: TTL
    });

    await wrappedMockFn(1);
    assert.equal(counter, 1);
    await wrappedMockFn(1);
    assert.equal(counter, 1); // Should use cached result
    await wrappedMockFn(2);
    assert.equal(counter, 3); // Should execute because arg is not 1
  });
});

test.describe('Plugins', async () => {
  await test('should throw if hook is doubled', async () => {
    const myPlugin: CacheCandidatePlugin = {
      name: 'myPlugin',
      hooks: [
        {
          hook: Hooks.INIT,
          action: async ({ key }) => {
            // do nothing
          }
        },
        {
          hook: Hooks.INIT,
          action: async ({ key }) => {
            // do nothing
          }
        }
      ]
    };

    const mockFn = (step: number) => Promise.resolve(step);
    const wrappedMockFn = cacheCandidate(mockFn, {
      plugins: [myPlugin]
    });

    await assert.rejects(wrappedMockFn(1));
  });

  await test('should throw if hook action is not valid', async () => {
    const myPlugin: CacheCandidatePlugin = {
      name: 'myPlugin',
      hooks: [
        {
          hook: Hooks.INIT,
          action: 'invalidAction' as any
        }
      ]
    };

    const mockFn = (step: number) => Promise.resolve(step);
    const wrappedMockFn = cacheCandidate(mockFn, {
      plugins: [myPlugin]
    });

    await assert.rejects(wrappedMockFn(1));
  });

  await test('should throw if hook name is not valid', async () => {
    const myPlugin: CacheCandidatePlugin = {
      name: 'myPlugin',
      hooks: [
        {
          hook: 'invalidHook' as any,
          action: async ({ key }) => {
            // do nothing
          }
        }
      ]
    };

    const mockFn = (step: number) => Promise.resolve(step);

    assert.throws(() => {
      cacheCandidate(mockFn, {
        plugins: [myPlugin]
      });
    });
  });

  await test('should throw if plugin has no hooks', async () => {
    const myPlugin: CacheCandidatePlugin = {
      name: 'myPlugin',
      hooks: []
    };

    const mockFn = (step: number) => Promise.resolve(step);

    assert.throws(() => {
      cacheCandidate(mockFn, {
        plugins: [myPlugin]
      });
    });
  });

  await test('should create a stub plugin and use it', async () => {
    let counter = 0;
    const myPlugin: CacheCandidatePlugin = {
      name: 'myPlugin',
      hooks: [
        {
          hook: Hooks.INIT,
          action: async ({ key }) => {
            counter = 1;
          }
        }
      ]
    };

    const mockFn = (step: number) => Promise.resolve(counter);
    const wrappedMockFn = cacheCandidate(mockFn, {
      plugins: [myPlugin]
    });

    await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    assert.equal(counter, 1);
  });
});
