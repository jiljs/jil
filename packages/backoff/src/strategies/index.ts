import { BackoffOptions } from "../options";
import { BackoffStrategyCtor, BackoffStrategyType } from "../strategy";
import { ExponentialBackoffStrategy } from "./exponential";
import { FibonacciBackoffStrategy } from "./fibonacci";

export function createStrategy(options: BackoffOptions) {
  const Ctor = getCtor(options.strategy);
  return new Ctor(options);
}

function getCtor(type: BackoffStrategyType | BackoffStrategyCtor): BackoffStrategyCtor {
  if (typeof type === "function") {
    return type;
  }

  switch (type) {
    case "exponential":
      return ExponentialBackoffStrategy;
    case "fibonacci":
      return FibonacciBackoffStrategy;
    default:
      throw new Error(`Unknown strategy with type ${type}. Use a BackoffStrategy class instead`);
  }
}
