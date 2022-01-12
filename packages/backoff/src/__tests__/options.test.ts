import { sanitizeOptions } from "../options";

describe("options", function() {
  it("the initial backoff delay should be greater than or equal 1", function() {
    expect(() => sanitizeOptions({ initialDelay: -1 })).toThrow();
    expect(() => sanitizeOptions({ initialDelay: 0 })).toThrow();
    expect(() => sanitizeOptions({ initialDelay: 1 })).not.toThrow();
  });

  it("the maximal backoff delay should be greater than or equal 1", function() {
    expect(() => sanitizeOptions({ maxDelay: -1 })).toThrow();
    expect(() => sanitizeOptions({ maxDelay: 0 })).toThrow();
  });

  it("the maximal backoff delay should be greater than the initial backoff delay", function() {
    expect(() => sanitizeOptions({
      initialDelay: 10,
      maxDelay: 10
    })).toThrow();

    expect(() => sanitizeOptions({
      initialDelay: 10,
      maxDelay: 11
    })).not.toThrow();
  });
});
