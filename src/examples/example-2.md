```js
import { CacheCandidate } from '@jointly/cache-candidate';
import { createClient } from 'redis';

const client = createClient({
  url: 'redis://localhost:10003'
});

class MockClass {
  @CacheCandidate({
    cache: makeRedisCache(client),
  })
  mockFunction(output: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(output);
      }, Math.random() * 5000);
    });
  }

  @CacheCandidate({
    cache: redisCache,
    candidateFunction: ({ timeFrameCacheRecords, options, args }) => {
      // console.log('candidateFunction Called!', output, output === 'hello');
      return args.output === 'hello';
    }
  })
  mockFunction7(output: string) {
    return new Promise((resolve) => {
      resolve(output);
    });
  }
}

export default async () => {
  await client.connect();
  const mockObj1 = new MockClass();
  const mockObj2 = new MockClass();
  const mockObj3 = new MockClass();
  mockObj1.mockFunction('hello');
  mockObj1.mockFunction7('hello');
  mockObj2.mockFunction('hello');
  mockObj2.mockFunction7('hello');
  mockObj3.mockFunction('hello');
  mockObj3.mockFunction7('hello');
};
```