import {random} from '../../random';

describe('Random', function () {
  it('should import correctly', () => {
    expect(random).toBeTruthy();
    expect(typeof random.randomBytes).toBe('function');
  });
});
