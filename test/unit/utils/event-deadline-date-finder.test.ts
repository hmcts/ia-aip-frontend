import { getDeadline } from '../../../app/utils/event-deadline-date-finder';
import { expect } from '../../utils/testUtils';

describe('event-deadline-date-finder', () => {
  describe('getDeadline', () => {
    it('appealStarted should return null', () => {
      const history = {
        appealStarted: {
          event: 'appealStarted',
          date: '2020-02-07T16:00:00.000'
        },
        appealSubmitted: {
          event: 'appealSubmitted',
          date: '2020-02-08T16:00:00.000'
        }
      };

      const currentAppealStatus = 'appealStarted';
      const result = getDeadline(currentAppealStatus, history);

      expect(result).to.be.null;
    });

    it('appealSubmitted should return a formatted date with 14 days offset', () => {
      const history = {
        appealStarted: {
          event: 'appealStarted',
          date: '2020-02-07T16:00:00.000'
        },
        appealSubmitted: {
          event: 'appealSubmitted',
          date: '2020-02-08T16:00:00.000'
        }
      };

      const currentAppealStatus = 'appealSubmitted';
      const result = getDeadline(currentAppealStatus, history);

      expect(result).to.be.equal('21 February 2020');
    });
  });
});
