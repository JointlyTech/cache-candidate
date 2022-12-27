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
    onLog: ({ key, event }: { key: string; event: Events }) => void;
  };
  dependencyKeys?:
    | string
    | number
    | Array<string | number>
    | ((
        result: DataCacheRecord['result']
      ) =>
        | string
        | number
        | Array<string | number>
        | Promise<Array<string> | Array<number>>);
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
export type KeepAliveCache = Map<string, NodeJS.Timeout>;

export enum Events {
  RUNNING_QUERY = 'RUNNING_QUERY',
  CHECKING_CANDIDATE_FUNCTION = 'CHECKING_CANDIDATE_FUNCTION',
  CHECKING_MILLISECOND_THRESHOLD = 'CHECKING_MILLISECOND_THRESHOLD',
  CHECKING_REQUESTS_THRESHOLD = 'CHECKING_REQUESTS_THRESHOLD'
}
