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

beforeEach(async () => {
  await sleep(ENOUGH_TIME);
  flushMaps();
});

describe('Basic Test Environment', () => {
  it('should verify cache is empty', async () => {
    expect(eventHits.get('onCacheSet')).toBe(0);
    expect(eventHits.get('onCacheHit')).toBe(0);
    expect(eventHits.get('onCacheDelete')).toBe(0);
  });
});

describe('Higher-Order Function', () => {
  it('should separate the cache entries for different functions with same parameters', async () => {
    const step = stepper();
    const mockFn1 = (x: number) => x;
    const mockFn2 = (x: number) => x;
    const wrappedMockFn1 = cacheCandidate(mockFn1, options);
    const wrappedMockFn2 = cacheCandidate(mockFn2, options);
    
    await wrappedMockFn1(step);
    await sleep(TTL + EXECUTION_MARGIN);
    await wrappedMockFn2(step);
    await sleep(TTL + EXECUTION_MARGIN);
    expect(eventHits.get('onCacheSet')).toBe(2);
    expect(eventHits.get('onCacheHit')).toBe(0);
  });

  it('should call onCacheDelete for sync method', async () => {
    const mockFn = jest.fn();
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
    expect(eventHits.get('onCacheDelete')).toBe(1);
  });

  it('should call onCacheDelete for async method', async () => {
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
    expect(eventHits.get('onCacheDelete')).toBe(1);
  });

  it('should call onCacheSet for sync method', async () => {
    const mockFn = jest.fn();
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
    expect(eventHits.get('onCacheSet')).toBe(1);
  });

  it('should call onCacheSet for async method', async () => {
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
    expect(eventHits.get('onCacheSet')).toBe(1);
  });

  it('should call onCacheHit for sync method', async () => {
    const mockFn = jest.fn();
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
    expect(eventHits.get('onCacheHit')).toBe(1);
  });

  it('should call onCacheHit for async method', async () => {
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
    expect(eventHits.get('onCacheHit')).toBe(1);
  });

  it('should allow for custom getDataCacheKey functions', async () => {
    const mockFn = jest.fn();
    const wrappedMockFn = cacheCandidate(mockFn, {
      customKeyFunction: (args) => {
        return 'custom-key';
      },
      events: {
        onCacheSet: ({ key }) => {
          expect(key).toBe('custom-key');
        }
      }
    });
    wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
  });
});

describe('Library-wide Conditions', () => {
  it("should throw if expirationMode is 'eject' and 'keepAlive' is true", async () => {
    expect(() => {
      cacheCandidate(
        () => {
          return Promise.resolve(true);
        },
        {
          expirationMode: 'eject',
          keepAlive: true
        }
      );
    }).toThrow();
  });

  it("should not call onCacheDelete when expirationMode is 'eject' and ttl has passed", async () => {
    const mockFn = jest.fn();
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
    expect(eventHits.get('onCacheDelete')).toBe(0);
  });

  it("should call onCacheDelete when expirationMode is 'timeout-only' and ttl has passed", async () => {
    const mockFn = jest.fn();
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
    expect(eventHits.get('onCacheDelete')).toBe(1);
  });

  it('should empty the timeframe cache after timeframe has passed', async () => {
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
    expect(counter).toBe(1);
    await sleep(EXECUTION_MARGIN);
    await wrappedMockFn(1);
    expect(counter).toBe(1);
    await sleep(EXECUTION_MARGIN);
    await wrappedMockFn(1);
    expect(counter).toBe(2);
  });

  it('should delete the data cache after ttl has passed even if timeframe is not', async () => {
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
    expect(counter).toBe(1);
    await sleep(EXECUTION_MARGIN);
    await wrappedMockFn(1);
    expect(counter).toBe(2);
    await sleep(EXECUTION_MARGIN);
    await wrappedMockFn(1);
    expect(counter).toBe(3);
  });

  it('should make an item expire after TTL', async () => {
    const mockFn = jest.fn();
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      timeFrame: TTL * 2,
      ttl: TTL,
      events: {
        onCacheSet: () => {
          eventHits.set('onCacheSet', eventHits.get('onCacheSet')! + 1);
        },
        onCacheHit: () => {
          eventHits.set('onCacheHit', eventHits.get('onCacheHit')! + 1);
        },
        onCacheDelete: () => {
          eventHits.set('onCacheDelete', eventHits.get('onCacheDelete')! + 1);
        }
      }
    });
    wrappedMockFn();
    await sleep(EXECUTION_MARGIN);
    wrappedMockFn();
    await sleep(EXECUTION_MARGIN);
    expect(eventHits.get('onCacheSet')).toBe(1);
    expect(eventHits.get('onCacheHit')).toBe(1);
    await sleep(TTL + EXECUTION_MARGIN);
    expect(eventHits.get('onCacheDelete')).toBe(1);
    wrappedMockFn();
    await sleep(EXECUTION_MARGIN);
    expect(eventHits.get('onCacheSet')).toBe(2);
    expect(eventHits.get('onCacheHit')).toBe(1);
  });

  it('should keep alive an item after TTL if it is used', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        counter += step;
        resolve(counter);
      });
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      ttl: EXECUTION_MARGIN * 2,
      keepAlive: true
    });

    await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
    await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
    await sleep(EXECUTION_MARGIN * 2);
    await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(2);
  });

  it('should return the running query if it is called again before the first one is resolved', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        setTimeout(() => {
          counter += step;
          resolve(counter);
        }, EXECUTION_MARGIN);
      });
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1
    });

    wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN / 2);
    wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
  });

  it('should cache when requestsThreshold is reached', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        counter += step;
        resolve(counter);
      });
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      ttl: 800
    });
    await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
    await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
  });

  it('should behave correctly when a millisecondThreshold is passed', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        setTimeout(() => {
          counter += step;
          resolve(counter);
        }, EXECUTION_MARGIN);
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      millisecondThreshold: EXECUTION_MARGIN / 2,
      requestsThreshold: 1
    });

    await wrappedMockFn(1); // should be cached
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
    await wrappedMockFn(1); // should be cached
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
    await wrappedMockFn(2); // should not be cached
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(3);
    await wrappedMockFn(2); // should be cached
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(3);
  });

  it('should behave correctly when a candidateFunction is passed', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        counter += step;
        resolve(counter);
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      candidateFunction: ({ args }) => {
        return args[0] === 1;
      }
    });

    await wrappedMockFn(1); // should be cached
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
    await wrappedMockFn(1); // should be cached
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
    await wrappedMockFn(2); // should not be cached
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(3);
    await wrappedMockFn(2); // should not be cached
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(5);
  });

  it('should return stale value when ttl has passed and fetchingMode is stale-while-revalidate', async () => {
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
    expect(result).toBe(1);
    expect(counter).toBe(1);
    result = await wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
    expect(result).toBe(1);
    expect(counter).toBe(2);
    result = await wrappedMockFn(1);
    await sleep(TTL + EXECUTION_MARGIN);
    expect(result).toBe(2);
    expect(counter).toBe(3);
  });

  it('should remove failed queries from running query cache', async () => {
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

    // First call should fail
    await expect(wrappedMockFn()).rejects.toThrow('test error');
    
    // Second call should succeed and not return cached error
    const result = await wrappedMockFn();
    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });
});

describe('Plugins', () => {
  it('should throw if hook is doubled', async () => {
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

    const mockFn = (step: number) =>
      new Promise((resolve) => {
        resolve(step);
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      plugins: [myPlugin]
    });

    await expect(wrappedMockFn(1)).rejects.toThrow();
  });

  it('should throw if hook action is not valid', async () => {
    const myPlugin: CacheCandidatePlugin = {
      name: 'myPlugin',
      hooks: [
        {
          hook: Hooks.INIT,
          action: 'invalidAction' as any
        }
      ]
    };

    const mockFn = (step: number) =>
      new Promise((resolve) => {
        resolve(step);
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      plugins: [myPlugin]
    });

    await expect(wrappedMockFn(1)).rejects.toThrow();
  });

  it('should throw if hook name is not valid', async () => {
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

    const mockFn = (step: number) =>
      new Promise((resolve) => {
        resolve(step);
      });

    try {
      cacheCandidate(mockFn, {
        plugins: [myPlugin]
      });
      expect(true).toBe(false);
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should throw if plugin has no hooks', async () => {
    const myPlugin: CacheCandidatePlugin = {
      name: 'myPlugin',
      hooks: []
    };

    const mockFn = (step: number) =>
      new Promise((resolve) => {
        resolve(step);
      });

    try {
      cacheCandidate(mockFn, {
        plugins: [myPlugin]
      });
      expect(true).toBe(false);
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should create a stub plugin and use it', async () => {
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

    const mockFn = (step: number) =>
      new Promise((resolve) => {
        resolve(counter);
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      plugins: [myPlugin]
    });

    await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(counter).toBe(1);
  });

  it('should throw if internal functions getDataCacheRecord is overridden', async () => {
    const myPlugin = {
      name: 'myPlugin',
      hooks: [
        {
          hook: Hooks.INIT,
          action: async (payload) => {
            payload.internals.getDataCacheRecord = function () {
              console.log('should not be possible');
            };
          }
        }
      ]
    };

    const mockFn = (step: number) =>
      new Promise((resolve) => {
        resolve(step);
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      plugins: [myPlugin]
    });

    await expect(wrappedMockFn(1)).rejects.toThrow();
  });

  it('should not throw if internal functions getDataCacheKey is overridden', async () => {
    const myPlugin = {
      name: 'myPlugin',
      hooks: [
        {
          hook: Hooks.INIT,
          action: async (payload) => {
            payload.internals.getDataCacheKey = function () {
              console.log('should be possible');
            };
          }
        }
      ]
    };

    const mockFn = (step: number) =>
      new Promise((resolve) => {
        resolve(step);
      });

    const wrappedMockFn = cacheCandidate(mockFn, {
      plugins: [myPlugin]
    });

    await expect(wrappedMockFn(1)).resolves.not.toThrowError();
  });
});
