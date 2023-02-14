# What is it?

This is a library providing both a higher-order function and a decorator to cache the result of a function/method if given conditions are met.

# How do I install it?

You can install it by using the following command:

```bash
npm install @jointly/cache-candidate
```

# Examples

## Use-case #1: DB query

In this scenario, we want to cache the result of the function if the same parameters are passed 3 times in the last 30 seconds, but we want to keep the cache record for 60 seconds.

```js
import { cacheCandidate } from '@jointly/cache-candidate';

function getUsers(filters = {}) {
  return db.query('SELECT * FROM users WHERE ?', filters);
}

const cachedGetUsers = cacheCandidate(getUsers, {
  requestsThreshold: 3,
  ttl: 60000,
  timeFrame: 30000
});

await cachedGetUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3 in the last 30 seconds
await cachedGetUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3 in the last 30 seconds
await cachedGetUsers({ name: 'John' }); // <-- This WILL be cached, because the requestsThreshold is 3 in the last 30 seconds!
await cachedGetUsers({ name: 'Jack' }); // <-- This won't be cached, because parameters are different
await sleep(61000); // <-- This will wait enough time (ttl) for the cache record to expire
await cachedGetUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3 in the last 30 seconds
```
## Use-case #2: DB query - Different timeFrame

In this scenario, we want to cache the result of the function if the same parameters are passed 3 times in the last 45 seconds, but we want to keep the cache record for 30 seconds. This example could reflect a scenario in which you are paying for the cache storage, yet you want to cache the same result again if the same parameters are passed 3 times in a short period of time.
```js
import { cacheCandidate } from '@jointly/cache-candidate';

function getUsers(filters = {}) {
  return db.query('SELECT * FROM users WHERE ?', filters);
}

const cachedGetUsers = cacheCandidate(getUsers, {
  requestsThreshold: 3,
  ttl: 30000,
  timeFrame: 45000 // <-- Notice the different timeFrame, higher than cache ttl
});

await cachedGetUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3 in the last 45 seconds
await cachedGetUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3 in the last 45 seconds
await cachedGetUsers({ name: 'John' }); // <-- This WILL be cached, because the requestsThreshold is 3 in the last 45 seconds!
await cachedGetUsers({ name: 'Jack' }); // <-- This won't be cached, because parameters are different
await sleep(31000); // <-- This will wait enough time (ttl) for the cache record to expire
await cachedGetUsers({ name: 'John' }); // <-- This WILL be cached, because the requestsThreshold is 3 in the last 45 seconds!
```

## Use-case #3: Advanced Usage - Candidate Function

You can also pass a candidate function to check if the conditions are met.

```js
import { cacheCandidate } from '@jointly/cache-candidate';

function getUsers(filters = {}) {
  return db.query('SELECT * FROM users WHERE ?', filters);
}

const cachedGetUsers = cacheCandidate(getUsers, {
  ttl: 30000,
  candidateFunction: ({ timeFrameCacheRecords, options, args }) => args[0].name === 'John',
});

await cachedGetUsers({ name: 'John' }); // <-- This will be cached, because the candidateFunction returns true
await cachedGetUsers({ name: 'John' }); // <-- This will return the cached value
await cachedGetUsers({ name: 'Jack' }); // <-- This won't be cached, because the candidateFunction returns false
await sleep(31000); // <-- This will invalidate the cache because of the ttl
```

# How does it work?

## Higher-order function

The library exposes the `cacheCandidate` function which accepts the function to be cached as the first argument and the options as the second argument.  
The returned function is an async function which returns a Promise fulfilled with the cached value if the method has already been called with the same arguments and/or the conditions are met.  

The options available are:
- `ttl` (_optional_): The time to live of the cache record in milliseconds. Default: `600000` (10 minutes).
- `timeFrame` (_optional_): The timeframe considered for the condition checks. Default: `30000` (30 seconds).  
  Consider the timeFrame as `the execution history of the last X milliseconds`. This timeframe collects information about the function's execution time. 
  For example, if you set the timeFrame to 30000 (30 seconds), the library will check the execution history of the last 30 seconds.  
  This means that if you set the `requestsThreshold` (explained below) to 3, the function will be cached only if the same parameters are passed 3 times in the last 30 seconds.
- `candidateFunction` (_optional_): The function to be called to check if the conditions are met. If not passed, this criteria will be ignored.  
  The candidateFunction receives an object with the following properties:
  - `options`: The options passed to the `cacheCandidate` function.
  - `executionTime`: The execution time of the current function execution in milliseconds.
  - `args`: The arguments passed to the current function.
  - `timeFrameCacheRecords`: The cache records of the last `timeFrame` milliseconds.
- `millisecondThreshold` (_optional_): The threshold in milliseconds to be considered for the condition checks. If not passed, this criteria will be ignored.
- `requestsThreshold` (_optional_): The number of requests to be considered for the condition checks. Default: `3`.
- `keepAlive` (_optional_): If `true`, the cache record will be kept alive at every request. Default: `false`.
- `cache` (_optional_): The cache adapter to be used. Defaults to `an in-memory cache based on Maps, but with Promises`.  
  Available adapters are:
  - `makeRedisCache`: A cache adapter based on Redis. Receives a Redis client as the first and only argument.
- `events` (_optional_): Listener functions to be called at specific steps of the process.  
  Available events are:
  - `onCacheHit`: Called when the cache entry is hit.
  - `onCacheSet`: Called when the cache entry is set.
  - `onCacheDelete`: Called when the cache entry is deleted.
  - `onBeforeFunctionExecution`: Called before the function execution.
  - `onAfterFunctionExecution`: Called after the function execution.
  Every event receives an object containing the `key` property, which is the key used for the cache.  
  The `onAfterFunctionExecution` event also receives the `executionTime` property, which is the execution time of the current function in milliseconds.
- `plugins` (_optional_): An array of plugins to be used. Default: `[]`.  
  Please, refer to the [@jointly/cache-candidate-plugin-base](https://github.com/JointlyTech/cache-candidate-plugin-base) package for more information.

## Decorator

The decorator expects to receive the options as the first argument and works exactly as the higher-order function.

### Example

```ts
import { CacheCandidate } from '@jointly/cache-candidate';

class MyClass {
  @CacheCandidate({
    requestsThreshold: 3,
    ttl: 30000,
  })
  async getUsers(filters = {}) {
    return db.query('SELECT * FROM users WHERE ?', filters);
  }
}

const myInstance = new MyClass();
await myInstance.getUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3
await myInstance.getUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3
await myInstance.getUsers({ name: 'John' }); // <-- This WILL be cached, because the requestsThreshold is 3!
```

## Conditions / Criterias
The conditions are, within the given `timeFrame`:

- If a `candidateFunction` is provided, it returns `true` at least once.  
  The candidateFunction ignores all the other conditions.  
- If a `millisecondThreshold` is provided, the function execution time passed such threshold at least `requestsThreshold` times.
- If only a `requestsThreshold` is provided (default), the function is called at least `requestsThreshold` times.

# Other Info

## Plugins

The library supports plugins to extend its functionality.  
Please, refer to the [@jointly/cache-candidate-plugin-base](https://github.com/JointlyTech/cache-candidate-plugin-base) package for the documentation on how to create a plugin.  

### First-party plugins

- [@jointly/cache-candidate-plugin-dependency-keys](https://github.com/JointlyTech/cache-candidate-plugin-dependency-keys): A plugin allowing to define dependency keys when setting the cache record.  
  This provides a mechanism to delete one or more cache records when a dependency key is invalidated.
- [@jointly/cache-candidate-plugin-invalidate-function](https://github.com/JointlyTech/cache-candidate-plugin-invalidate-function): A plugin providing an invalidation mechanism under specific conditions.

## Constraints

- The higher-order function and the decorator only work with async functions.  
  Please, refer to the [Considerations on synchronous functions](#considerations-on-synchronous-functions) section for more information.

## Cache Stampede

The library prevents the cache stampede problem by using a `Map` called `runningQueries` which saves the promise of the function call.  
If multiple calls are made to the same function with the same arguments, the function will be called only once and the other calls will wait for the Promise to finish.  
The `runningQueries` Map will be cleaned after the function execution is finished.  
The `onCacheHit` event will be called also when the running query is returned.

## Considerations on cache operations

The library doesn't consider the correct execution of the given cache functions.  
It isn't the library's responsibility to check if the cache functions are working properly.  
The only consideration done is based on the fact that the `set` method will eventually fulfill or reject the Promise as it uses the `.finally` Promise method to delete the key from the `runningQueries` Map and set the timeout to clean the cache record.

## Problems with synchronous functions

If the given function is synchronous, the library could not work as expected.  
The reason is that the library internally transforms the function to an asynchronous one, so executing the same function multiple times during the same Event Loop tick will prevent the cache from setting the value in time, thus not working as expected.  
The expected result will still be achieved, but please consider the multiple cache set operations during development.

## Key composition

The cache key is composed based on the following criteria, allowing multiple files to export the same class name with the same method name / the same function names without conflicts.

### Higher-order function

- The arguments passed to the method. (JSON.stringify)
- `uniqueIdentifier`: A uniqid generated to allow multiple files to contain the same function name.

### Decorator

- The method name.
- `uniqueIdentifier`: A uniqid generated to allow multiple files to contain the same class with the same method.
- `instanceIdentifier`: A uniqid generated for each instance of the class. It uses the instance properties to generate the id. (JSON.stringify)
- The arguments passed to the method. (JSON.stringify)

## Benchmarks

An overhead benchmark is available launching the `npm run benchmark` command.  
The benchmark will run:
- A simple function without cache-candidate.
- A cache-candidate wrap of the same function of the first test with an unreachable requestsThreshold.
- A cache-candidate wrap of the same function of the first test with a candidateFunction that always returns false.

The results on a MacBook Pro M1 2021 with 16GB of RAM are:

```
cacheCandidate OFF - normalFunction x 47.48 ops/sec ±0.48% (74 runs sampled)
cacheCandidate ON - Request Threshold unreachable x 46.86 ops/sec ±0.76% (73 runs sampled)
cacheCandidate ON - Candidate Function set to false x 46.75 ops/sec ±0.47% (72 runs sampled)
```

The results show that the library has a very low overhead, even when the cache is not used.  
Our suggestion therefore is to use the library on every function that could benefit from an hypothetical caching.

# Contributing

Please, refer to the [CONTRIBUTING.md](https://github.com/JointlyTech/cache-candidate/blob/main/CONTRIBUTING.md) file for more information.
