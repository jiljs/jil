import {Inflight} from '../index';

describe('Inflight', function () {
  it('should initiate', function () {
    const inflight = new Inflight();
    expect(inflight).toBeInstanceOf(Inflight);
  });

  // TODO more tests
});
