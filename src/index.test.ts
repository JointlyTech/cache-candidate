import { cacheCandidate } from './lib';
import { cacheCandidateDependencyManager } from './plugins/poc/manager';
import { MockClass } from './test/MockClass';
import { MockClass as MockClass2 } from './test/MockClass2';
import { MockClass as MockClass3 } from './test/MockClass3';
import { MockClass as MockClass4 } from './test/MockClass4';

import {
  step,
  eventHits,
  sleep,
  ENOUGH_TIME,
  TTL,
  EXECUTION_MARGIN,
  flushMaps,
  pluginsOptions
} from './test/options';

const stepper = step();

beforeEach(async () => {
  await sleep(ENOUGH_TIME);
  flushMaps();
});

describe('CacheCandidate - Simple', () => {
  it('should verify cache is empty', async () => {
    expect(eventHits.get('onCacheSet')).toBe(0);
    expect(eventHits.get('onCacheHit')).toBe(0);
    expect(eventHits.get('onCacheDelete')).toBe(0);
  });

  it('should separate the cache entries for MockClass and MockClass2 even if original names are equal', async () => {
    const step = stepper();
    const mock = new MockClass(step, step, step, step);
    const mock2 = new MockClass2(step, step, step, step);
    mock.mockFunction(step);
    await sleep(TTL + EXECUTION_MARGIN);
    mock2.mockFunction(step);
    await sleep(TTL + EXECUTION_MARGIN);
    expect(eventHits.get('onCacheSet')).toBe(2);
    expect(eventHits.get('onCacheHit')).toBe(0);
  });

  it('should call onCacheDelete for sync method', async () => {
    const step = stepper();
    const mock = new MockClass(step, step, step, step);
    mock.mockFunction(step);
    await sleep(TTL + EXECUTION_MARGIN);
    expect(eventHits.get('onCacheDelete')).toBe(1);
  });

  it('should call onCacheDelete for async method', async () => {
    const step = stepper();
    const mock = new MockClass(step, step, step, step);
    await mock.mockAsyncFunction(step);
    await sleep(TTL + EXECUTION_MARGIN);
    expect(eventHits.get('onCacheDelete')).toBe(1);
  });

  it('should call onCacheSet for sync method', async () => {
    const step = stepper();
    const mock = new MockClass(step, step, step, step);
    mock.mockFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(eventHits.get('onCacheSet')).toBe(1);
  });

  it('should call onCacheHit for sync method', async () => {
    const step = stepper();
    const mock = new MockClass(step, step, step, step);
    mock.mockFunction(step);
    await sleep(EXECUTION_MARGIN);
    mock.mockFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(eventHits.get('onCacheHit')).toBe(1);
  });

  it('should call onCacheSet for async method', async () => {
    const step = stepper();
    const mock = new MockClass(step, step, step, step);
    await mock.mockAsyncFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(eventHits.get('onCacheSet')).toBe(1);
  });

  it('should call onCacheHit for async method', async () => {
    const step = stepper();
    const mock = new MockClass(step, step, step, step);
    await mock.mockAsyncFunction(step);
    await sleep(EXECUTION_MARGIN);
    await mock.mockAsyncFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(eventHits.get('onCacheHit')).toBe(1);
  });

  it('should make an item expire after TTL', async () => {
    const step = stepper();
    const mock = new MockClass(step, step, step, step);
    mock.mockFunction(step);
    await sleep(EXECUTION_MARGIN);
    mock.mockFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(eventHits.get('onCacheSet')).toBe(1);
    expect(eventHits.get('onCacheHit')).toBe(1);
    await sleep(TTL + EXECUTION_MARGIN);
    expect(eventHits.get('onCacheDelete')).toBe(1);
    mock.mockFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(eventHits.get('onCacheSet')).toBe(2);
    expect(eventHits.get('onCacheHit')).toBe(1);
  });
});

describe('CacheCandidatePlugin - CacheCandidate', () => {
  it('should expose manager', async () => {
    const step = stepper();
    new MockClass(step, step, step, step);
    expect(cacheCandidateDependencyManager).toBeDefined();
  });

  it('should fill manager map if dependencyKeys is defined as array', async () => {
    const step = stepper();
    const mock = new MockClass3(step, step, step, step);
    mock.mockFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(cacheCandidateDependencyManager.instances.size).toBe(2);
    mock.mockAsyncFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(cacheCandidateDependencyManager.instances.size).toBe(2);
  });

  it('should fill manager map if dependencyKeys is defined as function', async () => {
    const step = stepper();
    const mock = new MockClass4(step, step, step, step);
    await mock.mockAsyncFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(cacheCandidateDependencyManager.instances.size).toBe(3);
  });

  it('should delete a record if invalidated', async () => {
    const step = stepper();
    const mock = new MockClass3(step, step, step, step);
    mock.mockFunction(step);
    await sleep(EXECUTION_MARGIN);
    expect(cacheCandidateDependencyManager.instances.size).toBe(2);
    cacheCandidateDependencyManager.invalidate('a');
    expect(cacheCandidateDependencyManager.instances.size).toBe(2);
  });

  it('should behave in the same way as a decorator if the higher-order function is used', async () => {
    let counter = 0;
    const mockFn = (step: number) =>
      new Promise((resolve) => {
        counter += step;
        resolve(counter);
      });
    const wrappedMockFn = cacheCandidate(mockFn, {
      requestsThreshold: 1,
      ...pluginsOptions()
    });
    let result: unknown;
    result = await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(result).toBe(1);
    result = await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(result).toBe(1);
    result = await wrappedMockFn(1);
    await sleep(EXECUTION_MARGIN);
    expect(cacheCandidateDependencyManager.instances.size).toBe(1);
    await sleep(EXECUTION_MARGIN);
    expect(result).toBe(1);
    cacheCandidateDependencyManager.invalidate(0);
    await sleep(EXECUTION_MARGIN);
    expect(cacheCandidateDependencyManager.instances.size).toBe(1);
    cacheCandidateDependencyManager.invalidate(1);
    await sleep(EXECUTION_MARGIN);
    expect(cacheCandidateDependencyManager.instances.size).toBe(1);
    await sleep(EXECUTION_MARGIN);
  });
});
