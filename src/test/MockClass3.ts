import { CacheCandidate } from '../lib';
import { options, pluginsOptions } from './options';

export class MockClass {
  constructor(
    public a: number,
    public b: number,
    public aAsync: number,
    public bAsync: number
  ) {}

  @CacheCandidate({ ...options, ...pluginsOptions(['a', 'b']) })
  async mockAsyncFunction(step: number) {
    return step;
  }

  @CacheCandidate({ ...options, ...pluginsOptions(['a', 'b']) })
  mockFunction(step: number) {
    return step;
  }
}
