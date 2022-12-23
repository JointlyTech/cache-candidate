import { CacheCandidate } from '../lib';
import { options } from './options';

export class MockClass {
  constructor(
    public a: number,
    public b: number,
    public aAsync: number,
    public bAsync: number
  ) {}

  @CacheCandidate({...options, ...{dependencyKeys: (data) => {return ['a', 'b'] }}})
  async mockAsyncFunction(step: number) {
    return step;
  }

  @CacheCandidate({...options, ...{dependencyKeys: ['a', 'b']}})
  mockFunction(step: number) {
    return step;
  }
}
