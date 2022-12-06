```js
import { CacheCandidate, makeRedisCache } from '@jointly/cache-candidate';
import { createClient } from 'redis';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const client = createClient({
  url: 'redis://localhost:10003'
});

class MockClass {
  constructor(public a, public b) {}
  @CacheCandidate({
    cache: makeRedisCache(client),
    requestsThreshold: 1,
    millisecondThreshold: 0,
    events: {
      onCacheHit: (key) => {
        console.log('onCacheHit', key);
      },
      onCacheSet: (key) => {
        console.log('onCacheSet', key);
      },
      onCacheDelete: (key) => {
        console.log('onCacheDelete', key);
      },
      onBeforeFunctionExecution: (key) => {
        return;
      },
      onAfterFunctionExecution: (key) => {
        return;
      },
      onLog: (log) => {
        return;
      }
    }
  })
  mockFunction() {
    return this.a + this.b;
  }
}

export default async () => {
  await client.connect();
  const mockObj1 = new MockClass(1, 1);
  const mockObj2 = new MockClass(2, 2);
  const mockObj3 = new MockClass(3, 3);
  const mockObj4 = new MockClass(1, 1);
  mockObj1.mockFunction();
  await sleep(100);
  mockObj2.mockFunction();
  await sleep(100);
  mockObj3.mockFunction();
  await sleep(100);
  mockObj4.mockFunction();
  await sleep(100);
  mockObj1.mockFunction();
  await sleep(100);
  mockObj2.mockFunction();
  await sleep(100);
  mockObj3.mockFunction();
  await sleep(100);
  mockObj4.mockFunction();
  await sleep(100);
  mockObj4.mockFunction();
  mockObj4.a = 2;
  mockObj4.mockFunction();
  await sleep(100);
  mockObj4.mockFunction();
  await sleep(100);
  mockObj4.b = 2;
  mockObj4.mockFunction();
  await sleep(100);
  mockObj4.mockFunction();
};
```