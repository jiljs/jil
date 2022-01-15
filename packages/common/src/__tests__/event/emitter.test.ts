import assert from "assert";
import { noop } from "tily/function/noop";
import { errorHandler, setUnexpectedErrorHandler } from "../../errors/handler";
import { Emitter } from "../../event/emitter";
import { EventUnsubscribe } from "../../event";
import { Samples } from "./samples";

describe("Emitter", function() {
  const counter = new Samples.EventCounter();

  beforeEach(() => {
    counter.reset();
  });

  it("emit array", () => {
    expect.assertions(4);
    const emitter = new Emitter<[a: string, b: number]>();
    const unsubscribe = emitter.event(([a, b]) => {
      expect(a).toEqual("foo");
      expect(b).toEqual(42);
    });
    expect(emitter.emit(["foo", 42])).toBeTruthy();
    unsubscribe();
    expect(emitter.emit(["foo", 42])).toBeFalsy();
  });

  it("emit plain", () => {
    const doc = new Samples.Document3();

    const unsub = doc.onDidChange(counter.onEvent, counter);

    doc.setText("far");
    doc.setText("boo");

    // unhook listener
    unsub();
    doc.setText("boo");
    expect(counter.count).toStrictEqual(2);
  });

  it("bucket", function() {
    const bucket: EventUnsubscribe[] = [];
    const doc = new Samples.Document3();
    const subscription = doc.onDidChange(counter.onEvent, counter, bucket);

    doc.setText("far");
    doc.setText("boo");

    // unhook listener
    while (bucket.length) {
      bucket.pop()!();
    }
    doc.setText("boo");

    // noop
    subscription();

    doc.setText("boo");
    assert.strictEqual(counter.count, 2);
  });

  it("onFirstAdd|onLastRemove", () => {
    let firstCount = 0;
    let lastCount = 0;
    const a = new Emitter({
      onFirstListenerAdd() {
        firstCount += 1;
      },
      onLastListenerRemove() {
        lastCount += 1;
      }
    });

    assert.strictEqual(firstCount, 0);
    assert.strictEqual(lastCount, 0);

    const subscription = a.event(noop);
    assert.strictEqual(firstCount, 1);
    assert.strictEqual(lastCount, 0);

    subscription();
    assert.strictEqual(firstCount, 1);
    assert.strictEqual(lastCount, 1);

    a.event(function() {
    });
    assert.strictEqual(firstCount, 2);
    assert.strictEqual(lastCount, 1);
  });

  it("throwingListener", () => {
    const origErrorHandler = errorHandler.getUnexpectedErrorHandler();
    setUnexpectedErrorHandler(() => null);

    try {
      const a = new Emitter<undefined>();
      let hit = false;
      a.event(function() {
        // eslint-disable-next-line no-throw-literal
        throw 9;
      });
      a.event(function() {
        hit = true;
      });
      a.emit(undefined);
      assert.strictEqual(hit, true);
    } finally {
      setUnexpectedErrorHandler(origErrorHandler);
    }
  });

  it("reusing event function and context", function() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let counter = 0;

    function listener() {
      counter += 1;
    }

    const context = {};

    const emitter = new Emitter<undefined>();
    const reg1 = emitter.event(listener, context);
    const reg2 = emitter.event(listener, context);

    emitter.emit(undefined);
    assert.strictEqual(counter, 2);

    reg1();
    emitter.emit(undefined);
    assert.strictEqual(counter, 3);

    reg2();
    emitter.emit(undefined);
    assert.strictEqual(counter, 3);
  });

  it("In Order Delivery", function() {
    const a = new Emitter<string>();
    const listener2Events: string[] = [];
    a.event(function listener1(event) {
      if (event === "e1") {
        a.emit("e2");
        // assert that all events are delivered at this point
        assert.deepStrictEqual(listener2Events, ["e1", "e2"]);
      }
    });
    a.event(function listener2(event) {
      listener2Events.push(event);
    });
    a.emit("e1");

    // assert that all events are delivered in order
    assert.deepStrictEqual(listener2Events, ["e1", "e2"]);
  });

  it("dispose is reentrant", () => {
    const emitter = new Emitter<number>({
      onLastListenerRemove: () => {
        emitter.dispose();
      }
    });

    const unsub = emitter.event(() => undefined);
    unsub(); // should not crash
  });
});
