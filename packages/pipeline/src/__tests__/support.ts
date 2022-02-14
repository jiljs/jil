import {Monitor} from '../monitor';
import {Pipeline} from '../pipeline';
import {WorkUnit} from '../workunit';
import {toArray} from 'tily/array/toArray';

let events: unknown[][] = [];

beforeEach(() => {
  events = [];
});

export function monitorEvent(name: string) {
  return (data: unknown) => {
    events.push([
      name,
      toArray(data).map(arg => {
        if (arg instanceof WorkUnit || arg instanceof Pipeline) {
          return arg.id;
        }

        return arg;
      }),
    ]);
  };
}

export function createMonitor() {
  const monitor = new Monitor();

  monitor.onPipelineAfterRun(monitorEvent('onAfterRun'));
  monitor.onPipelineBeforeRun(monitorEvent('onBeforeRun'));
  monitor.onPipelineRunWorkUnit(monitorEvent('onRunWorkUnit'));
  monitor.onWorkUnitFail(monitorEvent('onFail'));
  monitor.onWorkUnitPass(monitorEvent('onPass'));
  monitor.onWorkUnitSkip(monitorEvent('onSkip'));
  monitor.onWorkUnitRun(monitorEvent('onRun'));

  return monitor;
}

export function getMonitoredEvents() {
  return [...events];
}
