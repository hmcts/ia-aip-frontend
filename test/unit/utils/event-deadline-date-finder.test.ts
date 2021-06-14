import { Request } from 'express';
import { setupSecrets } from '../../../app/setupSecrets';
import { getHearingCentre, getHearingCentreEmail, getHearingDate, getHearingTime } from '../../../app/utils/cma-hearing-details';
import { getDeadline } from '../../../app/utils/event-deadline-date-finder';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
describe('event-deadline-date-finder', () => {

  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  const logger: Logger = new Logger();
  const config = setupSecrets();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {},
      session: {
        appeal: {
          hearing: {
            'hearingCentre': 'taylorHouse',
            'time': '90',
            'date': '2020-08-11T10:00:00.000'
          },
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

    it('cmaListed should return the formatted date', () => {
      const result = getHearingDate(req as Request);
      expect(result).to.be.equal('11 August 2020');
    });

    it('cmaListed should return the correct hearing centre', () => {
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('Taylor House');
    });

    it('cmaListed should return the correct hearing centre', () => {
      req.session.appeal.hearing.hearingCentre = 'manchester';
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('Manchester');
    });

    it('cmaListed should return the correct hearing centre', () => {
      req.session.appeal.hearing.hearingCentre = 'glasgow';
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('Glasgow');
    });

    it('cmaListed should return the correct hearing centre', () => {
      req.session.appeal.hearing.hearingCentre = 'newport';
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('Newport');
    });

    it('cmaListed should return the correct hearing centre', () => {
      req.session.appeal.hearing.hearingCentre = 'bradford';
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('Bradford');
    });

    it('cmaListed should return the correct hearing centre', () => {
      req.session.appeal.hearing.hearingCentre = 'northShields';
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('North Shields');
    });

    it('cmaListed should return the correct hearing centre', () => {
      req.session.appeal.hearing.hearingCentre = 'hattonCross';
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('Hatton Cross');
    });

    it('cmaListed should return the correct hearing centre', () => {
      req.session.appeal.hearing.hearingCentre = 'birmingham';
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('Birmingham');
    });

    it('cmaListed should return a blank hearing centre', () => {
      req.session.appeal.hearing.hearingCentre = '';
      const result = getHearingCentre(req as Request);
      expect(result).to.be.equal('');
    });

    it('cmaListed should return the hearing centre email', () => {
      const result = getHearingCentreEmail(req as Request);
      expect(result).not.to.be.equal(null);
    });

    it('cmaListed should return the hearing centre email', () => {
      req.session.appeal.hearingCentre = 'manchester';
      const result = getHearingCentreEmail(req as Request);
      expect(result).not.to.be.equal(null);
    });

    it('cmaListed should return the hearing centre email', () => {
      req.session.appeal.hearingCentre = 'glasgow';
      const result = getHearingCentreEmail(req as Request);
      expect(result).not.to.be.equal(null);
    });

    it('cmaListed should return the hearing centre email', () => {
      req.session.appeal.hearingCentre = 'newport';
      const result = getHearingCentreEmail(req as Request);
      expect(result).not.to.be.equal(null);
    });

    it('cmaListed should return the hearing centre email', () => {
      req.session.appeal.hearingCentre = 'bradford';
      const result = getHearingCentreEmail(req as Request);
      expect(result).not.to.be.equal(null);
    });

    it('cmaListed should return the hearing centre email', () => {
      req.session.appeal.hearingCentre = 'northShields';
      const result = getHearingCentreEmail(req as Request);
      expect(result).not.to.be.equal(null);
    });

    it('cmaListed should return the hearing centre email', () => {
      req.session.appeal.hearingCentre = 'hattonCross';
      const result = getHearingCentreEmail(req as Request);
      expect(result).not.to.be.equal(null);
    });

    it('cmaListed should return the hearing centre email', () => {
      req.session.appeal.hearingCentre = 'birmingham';
      const result = getHearingCentreEmail(req as Request);
      expect(result).not.to.be.equal(null);
    });

    it('cmaListed should return the formatted hearing centre', () => {
      const result = getHearingTime(req as Request);
      expect(result).to.be.equal('10:00 am');
    });
  });
});
