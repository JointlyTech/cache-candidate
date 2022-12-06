import { CacheCandidate } from '../lib';
import { options } from './options';

export class MockClass {
  constructor(
    public a: number,
    public b: number,
    public aAsync: number,
    public bAsync: number
  ) {}

  @CacheCandidate(options)
  async mockAsyncFunction(step: number) {
    return step;
  }

  @CacheCandidate(options)
  mockFunction(step: number) {
    return step;
  }
}
