const { cacheCandidate } = require('./dist/index.js');
let counter = 0;
const mockFn = (step) =>
  new Promise((resolve) => {
    counter += step;
    resolve(counter);
  });
const wrappedMockFn = cacheCandidate(mockFn, {
  requestsThreshold: 1,
  ttl: 800,
  keepAlive: false,
});
(async () => {
  let result = await wrappedMockFn(1);
  console.log(result); // 1
  result = await wrappedMockFn(1);
  console.log(result); // 1
  result = await wrappedMockFn(1);
  console.log(result); // 1
})();