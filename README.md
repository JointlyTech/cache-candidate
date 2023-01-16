# What is it?

This is a library providing both a decorator and a higher-order function to cache the result of a method if given conditions are met.

# Examples

## Use-case #1: Generic example

```ts
import { cacheCandidate } from '@jointly/cache-candidate';

let counter = 0;
// The function to be cached. In the example, it's a simple function that returns a Promise fulfilled with the sum of the current counter and the passed step.
const mockFn = (step: number) =>
  new Promise((resolve) => {
    counter += step;
    resolve(counter);
  });

// The wrapped function. The options are the default ones.
const wrappedMockFn = cacheCandidate(mockFn, {
  requestsThreshold: 1,
  ttl: 800,
});

let result: unknown;
result = await wrappedMockFn(1);
await sleep(EXECUTION_MARGIN); // Simulating a delay to allow the event loop to run
expect(result).toBe(1);
result = await wrappedMockFn(1);
await sleep(EXECUTION_MARGIN);
expect(result).toBe(1);
```

## Use-case #2: DB query

```js
import { cacheCandidate } from '@jointly/cache-candidate';

function getUsers(filters = {}) {
  return db.query('SELECT * FROM users WHERE ?', filters);
}

const cachedGetUsers = cacheCandidate(getUsers, {
  requestsThreshold: 3,
  ttl: 30000,
});

await cachedGetUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3
await cachedGetUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3
await cachedGetUsers({ name: 'John' }); // <-- This will be cached, because the requestsThreshold is 3!
await cachedGetUsers({ name: 'Jack' }); // <-- This won't be cached, because parameters are different
await sleep(30000); // <-- This will invalidate the cache because of the ttl
await cachedGetUsers({ name: 'John' }); // <-- This won't be cached, because the requestsThreshold is 3
```

# How does it work?

## Higher-order function

The library exposes the `cacheCandidate` function which accepts the function to be cached as the first argument and the options as the second argument.  
The returned function is an async function which returns a Promise fulfilled with the cached value if the method has already been called with the same arguments and the conditions are met.  
The options available are:

- `ttl` (_optional_): The time to live of the cache record in milliseconds. Default: `600000` (10 minutes).
- `timeFrame` (_optional_): The timeframe considered for the condition checks. Default: `30000` (30 seconds).
- `candidateFunction` (_optional_): The function to be called to check if the conditions are met. If not passed, this criteria will be ignored.
- `millisecondThreshold` (_optional_): The threshold in milliseconds to be considered for the condition checks. If not passed, this criteria will be ignored.
- `requestsThreshold` (_optional_): The number of requests to be considered for the condition checks. Default: `3`.
- `keepAlive` (_optional_): If `true`, the cache record will be kept alive at every request. Default: `false`.
- `cache` (_optional_): The cache adapter to be used. Default: `A memory cache based on Maps, but with Promises`.  
  Available adapters are:
  - `makeRedisCache`: A cache adapter based on Redis. Pass a Redis client as the first argument.
- `events` (_optional_): Listener functions to be called at specific bits of the process.  
  Available events are:
  - `onCacheHit`: Called when the cache entry is hit.
  - `onCacheSet`: Called when the cache entry is set.
  - `onCacheDelete`: Called when the cache entry is deleted.
  - `onBeforeFunctionExecution`: Called before the function execution.
  - `onAfterFunctionExecution`: Called after the function execution.
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
await myInstance.getUsers({ name: 'John' }); // <-- This will be cached, because the requestsThreshold is 3!
```

## Conditions / Criterias
The conditions are, within the given `timeFrame`:

- If a `candidateFunction` is provided, it returns `true` at least once.  
  The candidateFunction ignores all the other conditions.  
- If a `millisecondsThreshold` is provided, it passed such threshold (Execution time) at least `requestThreshold` times.
- If only a `requestThreshold` is provided (default), it is called at least `requestThreshold` times.

# Other Info

## Plugins

The library supports plugins to extend its functionality.  
Please, refer to the [@jointly/cache-candidate-plugin-base](https://github.com/JointlyTech/cache-candidate-plugin-base) package for the documentation on how to create a plugin.  

### Available plugins

- [@jointly/cache-candidate-plugin-dependency-keys](https://github.com/JointlyTech/cache-candidate-plugin-dependency-keys): Allows to define dependency keys when setting the cache record.  
  This allows to invalidate the cache record when a dependency changes.

## Constraints

- The decorator should only be applied to methods that return a `Promise`.  
  Please, refer to the [Considerations on synchronous methods](#considerations-on-synchronous-methods) section for more information.
- The `candidateFunction` must be synchronous to maintain good performances. If passed an async function bypassing type checking, the candidateFunction will return a Promise thus not working properly.

## Cache Stampede

The decorator prevents the cache stampede problem by using a `Map` called `runningQueries` which saves the promise of the method call.  
If multiple calls are made to the same method with the same arguments, the method will be called only once and the other calls will wait for the Promise to finish.  
The `runningQueries` Map will be cleaned after the method execution is finished.

## Considerations on cache operations

The decorator doesn't consider the correct execution of the given cache methods.  
It isn't the decorator's responsibility to check if the cache methods are working properly.  
The only consideration done is based on the fact that the `set` method will eventually fulfill or reject the Promise as it uses the `.finally` Promise method to delete the key from the `runningQueries` Map and set the timeout to clean the cache record.

## Problems with synchronous methods

If the given method is synchronous, the decorator could not work as expected.  
The reason is that the decorator internally transforms the method to an asynchronous one, so executing the same method multiple times during the same Event Loop tick will prevent the cache from setting the value in time, thus not working as expected.  
The expected result will still be achieved, but please consider the multiple cache set operations during development.

## Considerations on identification

The decorator uses the `instanceIdentifier` and `uniqueIdentifier` to identify the class instance and the method.  
The `instanceIdentifier` is generated using the instance properties, so if the instance properties change, the `instanceIdentifier` will change as well, thus changing the data cache key.  
The `uniqueIdentifier` is generated using the class name and the method name.

## Key composition

The cache key is composed based on the following criteria, allowing multiple files to export the same class name with the same method name / the same function names without conflicts:

### Higher-order function

- The arguments passed to the method. (JSON.stringify)
- `uniqueIdentifier`: A uniqid generated to allow multiple files to contain the same class with the same method.

### Decorator

- The method name.
- `uniqueIdentifier`: A uniqid generated to allow multiple files to contain the same class with the same method.
- `instanceIdentifier`: A uniqid generated for each instance of the class. It uses the instance properties to generate the id. (JSON.stringify)
- The arguments passed to the method. (JSON.stringify)


## Dictionary

### DataCache

The effective cache instance.

### TimeFrameCache

The Map containing the method executions in a given timeframe.

### RunningQueryCache

The Map containing the running queries (Promises fulfilled or yet to be fulfilled).

### Comparation Value

The value calculated based on candidate conditions which is then compared to the requestThreshold.