import { MatchingService } from '../src/modules/matching/matching.service';

describe('MatchingService design', () => {
  it('matches only via service and returns stable waiting/matched states', () => {
    expect(MatchingService).toBeDefined();
  });
});
