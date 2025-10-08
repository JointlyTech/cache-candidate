### 3.1.0 (2025-10-08)

##### Chores

*  setting the correct package version ([e660c231](https://github.com/JointlyTech/cache-candidate/commit/e660c2314bbe0bd31ea10a90463887b62c5304ad))

##### Documentation Changes

*  updated changelog ([5afe2891](https://github.com/JointlyTech/cache-candidate/commit/5afe2891da82bcbf0acead86be0f1c655589edb2))
*  updated changelog ([ccd51034](https://github.com/JointlyTech/cache-candidate/commit/ccd5103462ef358981bdfa3fabe1d6a377cb6859))

##### New Features

*  adding forceDeleteFn to deleteDataCacheRecord ([66977904](https://github.com/JointlyTech/cache-candidate/commit/66977904322002168ff85d108418aecae9ea3454))

### 2.2.0 (2025-10-08)

##### Documentation Changes

*  updated changelog ([ccd51034](https://github.com/JointlyTech/cache-candidate/commit/ccd5103462ef358981bdfa3fabe1d6a377cb6859))

##### New Features

*  adding forceDeleteFn to deleteDataCacheRecord ([66977904](https://github.com/JointlyTech/cache-candidate/commit/66977904322002168ff85d108418aecae9ea3454))

## 4.0.0 (2025-02-24)

#### 2.1.3 (2025-02-24)

##### New Features

*  v3.0 ([#54](https://github.com/JointlyTech/cache-candidate/pull/54)) ([0f042b8d](https://github.com/JointlyTech/cache-candidate/commit/0f042b8de2ebac417c2796cf01545abe3044b14c))

#### 2.1.2 (2024-12-09)

##### Bug Fixes

*  removing throw from execution catch ([614c22a7](https://github.com/JointlyTech/cache-candidate/commit/614c22a747edc6d56d4c379a58701b9128cb2f3f))

#### 2.1.1 (2024-12-09)

##### Chores

*  linting ([cf551885](https://github.com/JointlyTech/cache-candidate/commit/cf55188518d61bea06a9b08ca6a9b048f04885d5))
*  linting ([a808d771](https://github.com/JointlyTech/cache-candidate/commit/a808d7718db44264a1f14fc8b87a3ac80f64ddd9))

##### Bug Fixes

*  promise errors are now thrown correctly ([7a9b62c1](https://github.com/JointlyTech/cache-candidate/commit/7a9b62c1144a44509d69e4bed9ed77b4cb9aa5d0))

### 2.1.0 (2024-09-26)

##### Chores

*  removing test ts from eslint ([f1c59282](https://github.com/JointlyTech/cache-candidate/commit/f1c592825e611c5248a31435254f08e55f834905))

##### New Features

*  allowing for customKeyFunction in higher-order function ([5aea03ec](https://github.com/JointlyTech/cache-candidate/commit/5aea03ec1b4e4e28055a5f6a8c88b2be3fd48698))

#### 2.0.1 (2024-05-07)

##### Chores

*  updating packages ([bebdab31](https://github.com/JointlyTech/cache-candidate/commit/bebdab31eefde95726dcc7692f56aee8661caea4))

## 2.0.0 (2023-06-06)

##### Documentation Changes

*  updating docs with new default requestsThreshold value ([3ee4a1ad](https://github.com/JointlyTech/cache-candidate/commit/3ee4a1adb322a3514acb3eef3f9840a35467ec5a))

##### New Features

*  adding github automatic release action ([#53](https://github.com/JointlyTech/cache-candidate/pull/53)) ([96addc11](https://github.com/JointlyTech/cache-candidate/commit/96addc113e06dc19fea47d64f5dc83277290a80b))
*  changed requestsThreshold default value to 1 ([#19](https://github.com/JointlyTech/cache-candidate/pull/19)) ([a3688804](https://github.com/JointlyTech/cache-candidate/commit/a3688804207548efe194dd3a291ff63e4b49d64b))
*  expiration mode ([#41](https://github.com/JointlyTech/cache-candidate/pull/41)) ([d64c29da](https://github.com/JointlyTech/cache-candidate/commit/d64c29da0f87ee46f83c5a1e966244007313f85d))
*  stale-while-revalidate ([#49](https://github.com/JointlyTech/cache-candidate/pull/49)) ([31f8d26d](https://github.com/JointlyTech/cache-candidate/commit/31f8d26db8cffedf743773aec238b304b40a8912))

##### Bug Fixes

*  emitting onCacheHit for runningQuery match ([#50](https://github.com/JointlyTech/cache-candidate/pull/50)) ([9c2fd6cf](https://github.com/JointlyTech/cache-candidate/commit/9c2fd6cfb45957a37ce0a3ae8c08c2f5672c9578))

##### Other Changes

*  refactoring tests ([#52](https://github.com/JointlyTech/cache-candidate/pull/52)) ([ef40e52c](https://github.com/JointlyTech/cache-candidate/commit/ef40e52cc297daf3f7758d99a61f838d62609367))

##### Refactors

*  moving from partial candidate options to specific input options ([#51](https://github.com/JointlyTech/cache-candidate/pull/51)) ([94687c7e](https://github.com/JointlyTech/cache-candidate/commit/94687c7eb591afdf6d61598f4f52fcb7f853dbde))

#### 1.5.10 (2023-04-23)

##### Chores

*  linting ([94899acd](https://github.com/JointlyTech/cache-candidate/commit/94899acdf33e2e29b1337eaa37e82d32ddb9721a))

#### 1.5.9 (2023-04-23)

##### Continuous Integration

*  Added Node 20 in ci test matrix ([#46](https://github.com/JointlyTech/cache-candidate/pull/46)) ([8373a451](https://github.com/JointlyTech/cache-candidate/commit/8373a451fc696d4880f2a24515fd37dd89de1558))

#### 1.5.8 (2023-04-04)

##### Bug Fixes

*  partially freezes internal functions ([#33](https://github.com/JointlyTech/cache-candidate/pull/33)) ([#45](https://github.com/JointlyTech/cache-candidate/pull/45)) ([05fbb978](https://github.com/JointlyTech/cache-candidate/commit/05fbb9789d4309e535d840feaa72d830d82956f6))

#### 1.5.7 (2023-03-06)

##### Refactors

*  removed unnecessary internal parameters passed ([d82addd1](https://github.com/JointlyTech/cache-candidate/commit/d82addd100c489dac04faa97892ea5fe6efc9970))

#### 1.5.6 (2023-03-06)

##### Chores

*  explicit export ([4fb168cd](https://github.com/JointlyTech/cache-candidate/commit/4fb168cd64c57379a4ca9fd06d8efa2167bb7365))

#### 1.5.5 (2023-02-18)

##### Chores

*  adding benchmark for worst case ([#40](https://github.com/JointlyTech/cache-candidate/pull/40)) ([b511df0a](https://github.com/JointlyTech/cache-candidate/commit/b511df0add25c1a17ffe947b2d4986d0744310f0))
*  use timeout.refresh ([#42](https://github.com/JointlyTech/cache-candidate/pull/42)) ([1e8d3fc0](https://github.com/JointlyTech/cache-candidate/commit/1e8d3fc0fb91fc5cc5710484c5af38b7864c7ef5))

##### Bug Fixes

*  events had to be passed entirely as options when present ([#44](https://github.com/JointlyTech/cache-candidate/pull/44)) ([8617c08d](https://github.com/JointlyTech/cache-candidate/commit/8617c08d62342266386fae2f4489c0c94bd5497f))

#### 1.5.4 (2023-02-11)

##### Chores

*  naming returned functions for better logging and discoverability ([#38](https://github.com/JointlyTech/cache-candidate/pull/38)) ([e53a0a75](https://github.com/JointlyTech/cache-candidate/commit/e53a0a75eac40a01776500d77c6445c8c2bf0972))

##### Documentation Changes

*  added @jointly/cache-candidate-plugin-invalidate-function ([#37](https://github.com/JointlyTech/cache-candidate/pull/37)) ([ff5a093b](https://github.com/JointlyTech/cache-candidate/commit/ff5a093bc3b97453c2ae038c5c564c2f8f6f3d7b))

#### 1.5.3 (2023-02-02)

##### Continuous Integration

*  added github actions ([#35](https://github.com/JointlyTech/cache-candidate/pull/35)) ([7809180b](https://github.com/JointlyTech/cache-candidate/commit/7809180bd21890cc1e93ce63d520e2aebf4ecb04))

##### New Features

*  returning correct function types from input function ([#36](https://github.com/JointlyTech/cache-candidate/pull/36)) ([4d013387](https://github.com/JointlyTech/cache-candidate/commit/4d013387a80d8adb0131cade933a44ff15f4572f))

#### 1.5.2 (2023-02-02)

#### 1.5.1 (2023-02-02)

##### New Features

*  candidate function now can be either sync or async ([#34](https://github.com/JointlyTech/cache-candidate/pull/34)) ([c2f605c2](https://github.com/JointlyTech/cache-candidate/commit/c2f605c22098fd080be7d3f92d1af5f90282e49b))

### 1.5.0 (2023-01-31)

##### Chores

*  updating plugin-base ([1cc099b6](https://github.com/JointlyTech/cache-candidate/commit/1cc099b6bba43414dce33fc63254f650b0cf7473))

##### New Features

*  bringing internals back again ([3bfcd234](https://github.com/JointlyTech/cache-candidate/commit/3bfcd234c3fad9e70267328a05140603698411c5))

#### 1.4.1 (2023-01-30)

##### New Features

*  reverting internals ([b9816e08](https://github.com/JointlyTech/cache-candidate/commit/b9816e080df67206ecda09342dc43e15f049c69d))

### 1.4.0 (2023-01-30)

##### Chores

*  updating package lock ([077d8f3d](https://github.com/JointlyTech/cache-candidate/commit/077d8f3d27b1f0298d8dc42264c7bd14dbf47cd8))

##### New Features

*  exposing internals ([#32](https://github.com/JointlyTech/cache-candidate/pull/32)) ([0bbeb7dc](https://github.com/JointlyTech/cache-candidate/commit/0bbeb7dcb432bd1b3e1a8030fae5ddea38c3b6c3))

### 1.3.0 (2023-01-30)

##### New Features

*  allowing other cache adapters ([#31](https://github.com/JointlyTech/cache-candidate/pull/31)) ([a8750321](https://github.com/JointlyTech/cache-candidate/commit/a8750321c226a98a53c583237f0be95de2a14e29))
*  added setup hook ([#30](https://github.com/JointlyTech/cache-candidate/pull/30)) ([66a2206e](https://github.com/JointlyTech/cache-candidate/commit/66a2206e9e9d56ac6653f573cf6c0a7b56a219fa))

### 1.2.0 (2023-01-27)

##### Chores

*  terminated refactoring ([15e0733b](https://github.com/JointlyTech/cache-candidate/commit/15e0733baae1cb8cc1e443bd4ecbd671f5813849))
*  updated plugin base ([4feac575](https://github.com/JointlyTech/cache-candidate/commit/4feac575ac551449fa49d86e3f96c4639f881d3d))
*  internal refactor + fixed missing timeoutCache deletion + changed cache delete to correct candidate func ([cfc39360](https://github.com/JointlyTech/cache-candidate/commit/cfc39360a62c1647f05b6783f8833adc1ae73da3))

##### Documentation Changes

*  added install section ([#18](https://github.com/JointlyTech/cache-candidate/pull/18)) ([1fabe80c](https://github.com/JointlyTech/cache-candidate/commit/1fabe80c2e16a04b41dc1592656cb960bb77ca6b))

#### 1.1.6 (2023-01-18)

##### Documentation Changes

*  last edits for first release os ([7dc02816](https://github.com/JointlyTech/cache-candidate/commit/7dc0281638ab8f48de5ef3775cfead77d90b93f7))

#### 1.1.5 (2023-01-18)

##### Chores

*  internal plugin parameter changes to satisfy TS ([c67812f2](https://github.com/JointlyTech/cache-candidate/commit/c67812f28b6d018b1955fe079ad10943dd9edfab))

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

