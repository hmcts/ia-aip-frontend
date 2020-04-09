import { getDeadline } from '../../../app/utils/event-deadline-date-finder';
import { expect } from '../../utils/testUtils';

describe('event-deadline-date-finder', () => {
  const directions = [
    {
      tag: 'requestReasonsForAppeal',
      parties: 'appellant',
      dueDate: '2020-04-21',
      dateSent: '2020-03-24'
    },
    {
      tag: 'respondentEvidence',
      parties: 'respondent',
      dueDate: '2020-04-07',
      dateSent: '2020-03-24'
    } ];
  describe('getDeadline', () => {
    it('appealStarted should return null', () => {

      const currentAppealStatus = 'appealStarted';
      const result = getDeadline(currentAppealStatus, directions, []);

      expect(result).to.be.null;
    });

    it('appealSubmitted should return a formatted date with 14 days offset from the appealSubmission date', () => {
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
      const result = getDeadline(currentAppealStatus, directions, history);

      expect(result).to.be.equal('07 March 2020');
    });

    it('awaitingRespondentEvidence should return a formatted date with 14 days offset from the appealSubmission date', () => {
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
      const result = getDeadline(currentAppealStatus, directions, history);

      expect(result).to.be.equal('07 March 2020');
    });

    it('awaitingRespondentEvidence should return a formatted date with 14 days offset from the appealSubmission date', () => {
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

      const currentAppealStatus = 'awaitingRespondentEvidence';
      const result = getDeadline(currentAppealStatus, directions, history);

      expect(result).to.be.equal('07 March 2020');
    });

    it('awaitingReasonsForAppeal should return a formatted date with the requestReasonForAppeal direction due date', () => {
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

      const currentAppealStatus = 'awaitingReasonsForAppeal';
      const result = getDeadline(currentAppealStatus, directions, history);

      expect(result).to.be.equal('21 April 2020');
    });

    it('reasonsForAppealSubmitted should return a formatted date with 14 days offset from the submitReasonsForAppeal event', () => {
      const history = {
        appealStarted: {
          event: 'appealStarted',
          date: '2020-02-07T16:00:00.000'
        },
        appealSubmitted: {
          event: 'appealSubmitted',
          date: '2020-02-08T16:00:00.000'
        },
        submitReasonsForAppeal: {
          event: 'submitReasonsForAppeal',
          date: '2020-02-18T16:00:00.000'
        }
      };

      const currentAppealStatus = 'reasonsForAppealSubmitted';
      const result = getDeadline(currentAppealStatus, directions, history);

      expect(result).to.be.equal('03 March 2020');
    });
  });
});
