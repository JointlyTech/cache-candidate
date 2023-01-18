# Contributing

Every contribution is welcome. Please use the information below to get started.  
Please, feel free to open an issue or a pull request if you have any questions or suggestions.

## Dictionary

This dictionary contains the terms used in the library and their meaning.

### DataCache

The effective cache instance.

### TimeFrameCache

The Map containing the method executions in a given timeframe.

### RunningQueryCache

The Map containing the running queries (Promises yet to be fulfilled).  
Please, refer to the [Cache Stampede](https://github.com/JointlyTech/cache-candidate#cache-stampede) section for more information.

### Exceeding Amount

The value calculated based on [candidate conditions](https://github.com/JointlyTech/cache-candidate#conditions--criterias) which is then compared to the requestsThreshold.  
If the value is greater than the requestsThreshold, the execution is considered to be in exceeding amount and the result will be cached.  
When a `requestsThreshold` is provided, the exceeding amount is calculated as the number of requests in the timeframe.  
When a `millisecondThreshold` is provided, the exceeding amount is calculated as the number of requests exceeding the `millisecondThreshold` in the timeframe.  
When a `candidateFunction` is provided instead, the exceeding amount is virtually ignored, and the result will be cached if the `candidateFunction` returns true.  
In the codebase, the exceeding amount is forced to the `requestsThreshold` value when the `candidateFunction` returns true.
