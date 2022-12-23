# What is it?

This is a library providing a decorator to cache the result of a method if given conditions are met.

# How does it work?

The decorator expects to receive an object with a partial of the properties contained in the `CacheCandidateOptions` interface.  
Every non-passed property will be set to its default value using the `CacheCandidateOptionsDefault` object.  
The decorator will return a method that will return a Promise fulfilled with the cached value if the method has already been called with the same arguments and the conditions are met.  
The conditions are, within the given `timeFrame`:

- If a `candidateFunction` is provided, it returns `true` for at least `requestThreshold` times.
- If a `millisecondsThreshold` is provided, it passed such threshold (Execution time) at least `requestThreshold` times.
- If only a `requestThreshold` is provided (default), it is called at least `requestThreshold` times.

You can pass an additional `dependencyKeys` property to the decorator options which provides an invalidation mechanism to be called manually in your codebase.  
This property can be either an array of string, a function that returns an array of string or a function that returns a Promise fulfilled with an array of string.  
Both the function and the Promise will receive the result of the method on which the CacheCandidate operates.  
In case of an async method, the promise will be fulfilled before passing the result to the `dependencyKeys` function.  
The `dependencyKeys` function will be called only if the cache adapter correctly sets the value in the cache (i.e. the `.set` method is fulfilled). 

## Key composition

The cache key is composed based on the following criteria:

- The class constructor name.
- The method name.
- The arguments passed to the method. (JSON.stringify)
- `instanceIdentifier`: A uniqid generated for each instance of the class. It uses the instance properties to generate the id. (JSON.stringify)
- `uniqueIdentifier`: A uniqid generated to allow multiple files to contain the same class with the same method.

## Cache invalidation

The cache invalidation is done using the exported `cacheCandidateDependencyManager` object.  
The object exposes the `invalidate` method which accepts a string.  
The string is one of the dependency keys returned by the `dependencyKeys` function/array defined in the decorator options.  

### Example

```typescript
import { cacheCandidate, cacheCandidateDependencyManager } from 'cache-candidate';

class MyClass {
  @CacheCandidate({
    dependencyKeys: (users) => {
      return users.map((user) => `users-${user.id}`);
      },
  })
  public async getUsers() {
    // Do something
    return users;
  }

  public async updateUser(user) {
    // Do something
    cacheCandidateDependencyManager.invalidate(`users-${user.id}`);
  }
}

const myClass = new MyClass();
const users = await myClass.getUsers();
users[0].name = 'New name';
await myClass.updateUser(users[0]); // This will invalidate the cache
```


# Other Info

## Constraints

- The decorator can only be applied to methods that return a `Promise`.
- The `candidateFunction` must be synchronous to maintain good performances. If passed an async function bypassing type checking, the candidateFunction will return a Promise thus not working properly.

## Cache Stampede

The decorator prevents the cache stampede problem by using a `Map` called `runningQueries` which saves the promise of the method call.  
If multiple calls are made to the same method with the same arguments, the method will be called only once and the other calls will wait for the Promise to finish.  
The `runningQueries` Map will be cleaned after the method execution is finished.

## Considerations on cache operations

The decorator doesn't consider the correct execution of the given cache methods.  
It isn't the decorator's responsibility to check if the cache methods are working properly.  
The only consideration done is based on the fact that the `set` method will eventually fulfill or reject the Promise as it uses the `.finally` method to delete the key from the `runningQueries` Map and set the timeout to clean the cache record.

## Problems with synchronous methods

If the given method is synchronous, the decorator could not work as expected.  
The reason is that the decorator internally transforms the method to an asynchronous one, so executing the same method multiple times during the same Event Loop tick will prevent the cache from setting the value in time, thus not working as expected.  
The expected result will still be achieved, but please consider the multiple cache set operations during development.

## Considerations on identification

The decorator uses the `instanceIdentifier` and `uniqueIdentifier` to identify the class instance and the method.  
The `instanceIdentifier` is generated using the instance properties, so if the instance properties change, the `instanceIdentifier` will change as well, thus changing the data cache key.  
The `uniqueIdentifier` is generated using the class name and the method name.

## Dictionary

### DataCache

The effective cache instance.

### TimeFrameCache

The Map containing the method executions in a given timeframe.

### RunningQueryCache

The Map containing the running queries (Promises fulfilled or yet to be fulfilled).

### Comparation Value

The value calculated based on candidate conditions which is then compared to the requestThreshold.

# ToDo

- [ ] Rifattorizzare per permettere l'utilizzo in funzioni senza classe.