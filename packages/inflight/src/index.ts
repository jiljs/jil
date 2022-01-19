/* eslint-disable @typescript-eslint/no-explicit-any */
import {assert} from 'ts-essentials';

export class CallTimeoutError extends Error {}

interface PendingRequest {
  timeout: number;
  timestamp: number;
  resolve(value?: unknown): void;
  reject(value?: unknown): void;
}

export type InflightIdGenerator<T = any> = () => T;

export interface InflightOptions {
  timeout: number;
  interval: number;
  idgen: InflightIdGenerator;
}

const DefaultInflightOptions: InflightOptions = {
  timeout: 10,
  interval: 5,
  idgen: makeNumberGenerator(),
};

export class Inflight<IdType> {
  public readonly options: InflightOptions;
  protected pendings = new Map<IdType, PendingRequest>();
  protected timer: any;

  constructor(options: Partial<InflightOptions> = {}) {
    this.options = {...DefaultInflightOptions, ...options};

    assert(
      this.options.timeout > this.options.interval,
      `timeout(${this.options.timeout}s) must be greater than interval(${this.options.interval}s)`,
    );
  }

  get idgen() {
    return this.options.idgen;
  }

  acquire<R = unknown>(timeout?: number): {id: IdType; promise: Promise<R>} {
    const id = this.nextRequestId();
    assert(!this.pendings.get(id), 'ID collision.');
    const promise = new Promise<R>((resolve, reject) => {
      this.pendings.set(id, {timeout: timeout ?? this.options.timeout, timestamp: Date.now(), resolve, reject});
    });
    return {id, promise};
  }

  has(id: IdType) {
    return this.pendings.has(id);
  }

  resolve(id: IdType, answer?: unknown) {
    const req = this.pendings.get(id);
    if (req) {
      this.pendings.delete(id);
      req.resolve(answer);
    }
  }

  reject(id: IdType, reason?: unknown) {
    const req = this.pendings.get(id);
    if (req) {
      this.pendings.delete(id);
      req.reject(reason);
    }
  }

  rejectAll(reason?: unknown) {
    this.pendings.forEach(req => {
      req.reject(reason);
    });
    this.pendings.clear();
  }

  clear() {
    this.pendings.clear();
  }

  check(now?: number) {
    now = now ?? Date.now();
    this.pendings.forEach((req, key) => {
      if (now! - req.timestamp > (req.timeout ?? this.options.timeout) * 1000) {
        this.pendings.delete(key);
        req.reject(new CallTimeoutError('Request timed out.'));
      }
    });
  }

  start() {
    assert(this.timer == null, 'already start stall');
    if (this.options.interval > 0) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.timer = setInterval(async () => this.check(), this.options.interval * 1000);
    }
  }

  stop() {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  protected nextRequestId() {
    return this.idgen();
  }
}

function makeNumberGenerator(start = 1, max = 0x100000000) {
  let current = start - 1;
  return () => {
    if (++current === max) current = start;
    return current;
  };
}
