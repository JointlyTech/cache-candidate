import { CacheCandidatePluginWithAdditionalParameters } from '@jointly/cache-candidate-plugin-base';

export interface CandidateFunctionOptions {
  timeFrameCacheRecords: Array<TimeFrameCacheRecord>;
  options: CacheCandidateOptions;
  args: any;
}
export interface CacheCandidateCacheAdapter {
  get: (key: string) => Promise<DataCacheRecord | undefined>;
  set: (key: string, value: any, ttl: number) => Promise<any>;
  has: (key: string) => Promise<boolean>;
  delete: (key: string) => Promise<boolean>;
  [key: string]: any;
}

export interface CacheCandidateOptions {
  ttl: number;
  timeFrame: number;
  candidateFunction?: (CandidateFunctionOptions) => boolean;
  millisecondThreshold?: number;
  requestsThreshold: number;
  keepAlive: boolean;
  cache: CacheCandidateCacheAdapter;
  events: {
    onCacheHit: ({ key }: { key: string }) => void;
    onCacheSet: ({ key }: { key: string }) => void;
    onCacheDelete: ({ key }: { key: string }) => void;
    onBeforeFunctionExecution: ({ key }: { key: string }) => void;
    onAfterFunctionExecution: ({
      key,
      executionTime
    }: {
      key: string;
      executionTime: number;
    }) => void;
  };
  plugins: Array<CacheCandidatePluginWithAdditionalParameters>;
}

export interface DataCacheRecord {
  result: any;
  birthTime: number;
}

export interface TimeFrameCacheRecord {
  executionTime: number;
  executionEnd: Date;
}

export type TimeFrameCache = Map<string, Array<TimeFrameCacheRecord>>;
export type RunningQueryCache = Map<string, Promise<any>>;
export type TimeoutCache = Map<string, NodeJS.Timeout>;

export const DataCacheRecordNotFound = Symbol('DataCacheRecordNotFound');
export const RunningQueryRecordNotFound = Symbol('RunningQueryRecordNotFound');
