import { CacheCandidate } from '../lib';
import { options } from './options';

export class MockClass {
  constructor(
    public a: number,
    public b: number,
    public aAsync: number,
    public bAsync: number
  ) {}

  @CacheCandidate({
    ...options,
    ...{
      dependencyKeys: function (result) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(result);
          }, 10);
        });
      }
    }
  })
  async mockAsyncFunction(step: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([step, step + 1, step + 2]);
      }, 10);
    });
  }

  @CacheCandidate({ ...options, ...{ dependencyKeys: (result) => result } })
  mockFunction(step: number) {
    return [step, step + 1, step + 2];
  }
}
