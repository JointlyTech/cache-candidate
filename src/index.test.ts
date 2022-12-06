/**
 * Considerations:
 *  - The cache provides same keys because we are working on the same class coming from the same file. For testing purposes, we will instantiate a different class every time providing a step to the constructor and called methods.
 */

import { MockClass } from './test/MockClass';
import { MockClass as MockClass2 } from './test/MockClass2';
import {
  step,
  eventHits,
  sleep,
  ENOUGH_TIME,
  TTL,
  EXECUTION_MARGIN,
  flushMap
} from './test/options';

const stepper = step();

beforeEach(async () => {
  await sleep(ENOUGH_TIME);
  flushMap();
});

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
