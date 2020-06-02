import { Request } from 'express';
import { getDeadline } from '../../../app/utils/event-deadline-date-finder';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('event-deadline-date-finder', () => {

  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {},
      session: {
        appeal: {
          application: {},
          caseBuilding: {},
          reasonsForAppeal: {},
          directions: [
            {
              'id': 3,
              'tag': 'requestCmaRequirements',
              'dateDue': '2020-05-21',
              'dateSent': '2020-05-02'
            },
            {
              'id': 2,
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-09-01',
              'dateSent': '2020-04-21'
            },
            {
              'id': 1,
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'dateSent': '2020-04-14'
            }
          ],
          history: [
            {
              'id': 'submitAppeal',
              'createdDate': '2020-02-08T16:00:00.000'
            },
            {
              'id': 'submitReasonsForAppeal',
              'createdDate': '2020-02-18T16:00:00.000'
            }
          ]
        }
      },
      idam: {
        userDetails: {
          forename: 'forename',
          surname: 'surname'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as unknown as Partial<Request>;

  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getDeadline', () => {
    it('appealStarted should return null', () => {

      const currentAppealStatus = 'appealStarted';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.null;
    });

    it('appealSubmitted should return a formatted date with 14 days offset from the appealSubmission date', () => {

      const currentAppealStatus = 'appealSubmitted';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('07 March 2020');
    });

    it('awaitingRespondentEvidence should return a formatted date with 14 days offset from the appealSubmission date', () => {

      const currentAppealStatus = 'appealSubmitted';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('07 March 2020');
    });

    it('awaitingRespondentEvidence should return a formatted date with 14 days offset from the appealSubmission date', () => {

      const currentAppealStatus = 'awaitingRespondentEvidence';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('07 March 2020');
    });

    it('awaitingReasonsForAppeal should return a formatted date with the requestReasonForAppeal direction due date', () => {

      const currentAppealStatus = 'awaitingReasonsForAppeal';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('01 September 2020');
    });

    it('reasonsForAppealSubmitted should return a formatted date with 14 days offset from the submitReasonsForAppeal event', () => {

      const currentAppealStatus = 'reasonsForAppealSubmitted';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('03 March 2020');
    });

    it('awaitingCmaRequirements should return a formatted  date with the requestCmaRequirements direction due date', () => {

      const currentAppealStatus = 'awaitingCmaRequirements';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('21 May 2020');
    });
  });
});
