const {cacheCandidate} = require('./dist');
const Benchmark = require('benchmark');

let suite = new Benchmark.Suite();

const normalFunction = function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
      resolve(true);
      }, 20);
    });
};

const wrappedNFWithReqThreshold = cacheCandidate(normalFunction, {requestsThreshold: 1_000_000_000});
const wrappedNFWithCandidateFn = cacheCandidate(normalFunction, {candidateFunction: () => false});

suite.add('cacheCandidate OFF - normalFunction', {
  defer: true,
  fn: function (deferred) {
    normalFunction().then(function() {
      deferred.resolve();
    });
  }
}).add('cacheCandidate ON - Request Threshold unreachable', {
  defer: true,
  fn: function (deferred) {
      wrappedNFWithReqThreshold().then(function() {
      deferred.resolve();
    });
  }
}).add('cacheCandidate ON - Candidate Function set to false', {
  defer: true,
  fn: function (deferred) {
      wrappedNFWithCandidateFn().then(function() {
      deferred.resolve();
    });
  }
}).on('cycle', function(event) {
    console.log(String(event.target));
})
.run({ 'async': true });