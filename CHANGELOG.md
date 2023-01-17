#### 1.1.4 (2023-01-17)

##### Chores

*  triggering npm new version - registry has fallen ([6433af78](https://github.com/JointlyTech/cache-candidate/commit/6433af780b2fb6cfb9d1e6506ff38feec7f54485))

#### 1.1.3 (2023-01-17)

##### Chores

*  triggering npm new version - registry has fallen ([501f1f0e](https://github.com/JointlyTech/cache-candidate/commit/501f1f0e0149747eae3d1b513cd8eaa187fa2e67))

#### 1.1.2 (2023-01-17)

##### Bug Fixes

*  fixed pluginHookWrap missing options ([00f913f5](https://github.com/JointlyTech/cache-candidate/commit/00f913f576869dabd0b4eca6eb568a1fcb34bd24))

#### 1.1.1 (2023-01-17)

##### Bug Fixes

*  fixed delete data cache record missing promise await ([abe7d7a3](https://github.com/JointlyTech/cache-candidate/commit/abe7d7a392919e9bd51e3d383bbcb18d9dfb014f))

### 1.1.0 (2023-01-17)

##### Chores

*  used pluginHookWrap instead of two execute hooks for better readability ([8eb60025](https://github.com/JointlyTech/cache-candidate/commit/8eb600255c5596d17a55f656470ec5d1549d6628))
*  updating dependencies ([07991f53](https://github.com/JointlyTech/cache-candidate/commit/07991f53a41c615eb88846f18bb721e3d91ab472))

##### Documentation Changes

*  better documentation - in line with new updates ([6989ba66](https://github.com/JointlyTech/cache-candidate/commit/6989ba66f5a3ba3fcadba70b6da3def9c33107e9))

##### New Features

*  added plugin hooks check ([2fe65458](https://github.com/JointlyTech/cache-candidate/commit/2fe654580c161faf19ae51d1c3b3182f441ef023))

##### Bug Fixes

*  checking ttl instead of timeframe for datacacherecord expiration + running query delete if not cached ([f5d79279](https://github.com/JointlyTech/cache-candidate/commit/f5d79279092111a8b2f6076425f9daa4b4780250))

##### Tests

*  reached 100% coverage ([0edca232](https://github.com/JointlyTech/cache-candidate/commit/0edca232d81cc6c20a51b47bdeba53f031f301a2))

#### 1.0.2 (2023-01-16)

##### Chores

*  linting ([c1f132b8](https://github.com/JointlyTech/cache-candidate/commit/c1f132b8a5da8e502bc4ed95e2dec1ad3ca2d989))

#### 1.0.1 (2023-01-16)

##### Chores

*  removed onLog because useless as it is, removed duplicated target constructor name ([08060bd2](https://github.com/JointlyTech/cache-candidate/commit/08060bd221d4d60c13e894ecba7e826ed3e0b576))

##### Documentation Changes

*  better documentation ([0b74f13c](https://github.com/JointlyTech/cache-candidate/commit/0b74f13c0a70c4a14905b952311191cbfba7de64))

## 1.0.0 (2023-01-16)

##### Chores

*  removed unused test class method ([7c4d8144](https://github.com/JointlyTech/cache-candidate/commit/7c4d81444b94df4dcd669c16042131f38d5843a6))
*  removed unused command ([6e6723c3](https://github.com/JointlyTech/cache-candidate/commit/6e6723c3b1a10d9cce8f8e1d1441e840bba8b89a))
*  removed plugin missing files export ([204a8794](https://github.com/JointlyTech/cache-candidate/commit/204a8794874ef1b76de30598f60225c3196c9d44))
*  keepAliveTimeoutCache changed to timeFrameTimeoutCache ([#14](https://github.com/JointlyTech/cache-candidate/pull/14)) ([821ffe83](https://github.com/JointlyTech/cache-candidate/commit/821ffe8340c306f94e9c54c2b7de74c05c42143b))
*  internal refactor + better typings ([74fdf262](https://github.com/JointlyTech/cache-candidate/commit/74fdf2627a8105329ceaf02cb662c1b692cca34d))

##### New Features

*  better timeouts (unref) ([#13](https://github.com/JointlyTech/cache-candidate/pull/13)) ([9a57d94a](https://github.com/JointlyTech/cache-candidate/commit/9a57d94a7739ee2202de508a908dd603be18b962))
*  plugins system ([#12](https://github.com/JointlyTech/cache-candidate/pull/12)) ([3c5be8af](https://github.com/JointlyTech/cache-candidate/commit/3c5be8aff97b5404f3769dad178db68a2ab92878))
*  added doctor + test script ([#2](https://github.com/JointlyTech/cache-candidate/pull/2)) ([190ca89e](https://github.com/JointlyTech/cache-candidate/commit/190ca89ec0bdc6a57c019d08a0738f26da84a789))

### 0.2.0 (2022-12-27)

##### Chores

*  spring cleaning ([4f1c5ea6](https://github.com/JointlyTech/cache-candidate/commit/4f1c5ea63729a206443a311a220c4db3b5e18dd7))
*  added coverage shortcut ([d5f71a06](https://github.com/JointlyTech/cache-candidate/commit/d5f71a06dd620cb51e19951a8c26cc06bf647e56))

##### Documentation Changes

*  updated documentation ([ae659731](https://github.com/JointlyTech/cache-candidate/commit/ae659731271eb9170b808e34ad30e06ef4649901))
*  cache invalidation example ([8aa2cd58](https://github.com/JointlyTech/cache-candidate/commit/8aa2cd58eb82b04b04c29fb982e5a58d7400047e))

##### New Features

*  higher-order function implementation + internal refactor ([811e7d8e](https://github.com/JointlyTech/cache-candidate/commit/811e7d8ef8a1bc4afe30d4e137164ebc81fe6485))
*  higher-order function implementation + internal refactor ([2b4dec8f](https://github.com/JointlyTech/cache-candidate/commit/2b4dec8f8a7bc956e70bc9de9c3ad52a36f87f71))

##### Bug Fixes

*  exported manager ([65ed3d7f](https://github.com/JointlyTech/cache-candidate/commit/65ed3d7fbc90324a49601861aac50bd41aa7efcc))

##### Tests

*  added tests to cover new features ([a68e3d7c](https://github.com/JointlyTech/cache-candidate/commit/a68e3d7cb9c390a1b7063c27bf67fb0c12a17a84))

### 0.1.0 (2022-12-23)

##### Documentation Changes

*  removed done tab ([938f86f3](https://github.com/JointlyTech/cache-candidate/commit/938f86f3a9d6f19add228b7d5f3d7090cacd9a93))

##### New Features

*  added dependency keys ([032015a6](https://github.com/JointlyTech/cache-candidate/commit/032015a6f28e4677b22c37a5da64df0cf9086294))
*  added dependency keys mechanism ([85e32cfa](https://github.com/JointlyTech/cache-candidate/commit/85e32cfa7cbb12c36322f55887d9f83db03e337b))

#### 0.0.3 (2022-12-12)

##### Chores

*  added redis types ([0254b4c5](https://github.com/JointlyTech/cache-candidate/commit/0254b4c5d0cf85a58c71a39a616429d68d46876c))

#### 0.0.2 (2022-12-12)

##### Chores

*  new scaffolding ([f9ab404c](https://github.com/JointlyTech/cache-candidate/commit/f9ab404c81cd49f1bfa5f99220035806788925ce))

##### New Features

*  Removed esbuild-wasm ([ac681807](https://github.com/JointlyTech/cache-candidate/commit/ac681807f4c32f9dae8711fd2350e7525ab5d1fc))

