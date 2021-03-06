import { Blueprint, Schemas } from "@jil/common/optimal";
import { DEFAULT_PRIORITY, Pluggable, Plugin, Registry, RegistryOptions } from "../..";

export interface Renderable extends Pluggable {
  render: () => string;
}

export class Renderer extends Plugin<unknown, { value: string }> implements Renderable {
  readonly name = "";

  priority = DEFAULT_PRIORITY;

  blueprint({ string }: Schemas): Blueprint<{ value: string }> {
    return {
      value: string()
    };
  }

  render() {
    return "test";
  }
}

export function createRendererRegistry(options?: Partial<RegistryOptions<Renderable>>) {
  return new Registry<Renderable>("jil-test", "renderer", {
    validate(plugin) {
      if (typeof plugin.render !== "function") {
        throw new TypeError("Renderer requires a `render()` method.");
      }
    },
    ...options
  });
}
