import { Request } from 'express';
import { getHearingCentre, getHearingCentreEmail, getHearingDate, getHearingTime } from '../../../app/utils/cma-hearing-details';
import { getDeadline, getDueDateForAppellantToRespondToJudgeDecision, getFormattedDirectionDueDate } from '../../../app/utils/event-deadline-date-finder';
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
            },
            {
              'id': 4,
              'tag': 'legalRepresentativeHearingRequirements',
              'dateDue': '2020-07-28',
              'dateSent': '2020-07-23'
            },
            {
              'id': 5,
              'tag': 'requestCaseBuilding',
              'dateDue': '2020-08-28',
              'dateSent': '2020-08-23'
            }
          ],
          history: [
            {
              'id': 'submitAppeal',
              'createdDate': '2020-02-08T16:00:00.000'
            },
            {
              'id': 'pendingPayment',
              'createdDate': '2020-02-08T16:00:00.000'
            },
            {
              'id': 'submitReasonsForAppeal',
              'createdDate': '2020-02-18T16:00:00.000'
            },
            {
              'id': 'buildCase',
              'createdDate': '2020-02-18T16:00:00.000'
            },
            {
              'id': 'requestRespondentReview',
              'createdDate': '2020-02-18T16:00:00.000'
            },
            {
              'id': 'reasonsForAppealSubmitted',
              'createdDate': '2020-02-18T16:00:00.000'
            },
            {
              'id': 'decisionWithdrawn',
              'createdDate': '2020-02-19T16:00:00.000'
            },
            {
              'id': 'updateTribunalDecision',
              'createdDate': '2024-03-05T15:36:26.099'
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

    it('appealSubmitted should return a formatted date with 5 days offset from the appealSubmission date', () => {

      const currentAppealStatus = 'appealSubmitted';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('13 February 2020');
    });

    it('appealSubmitted with fee and setAside is enabled should return a formatted date with 14 days offset from the' +
      ' appealSubmission date', () => {

      const currentAppealStatus = 'appealSubmitted';
      req.session.appeal.application.appealType = 'refusalOfHumanRights';
      const result = getDeadline(currentAppealStatus, req as Request, true);

      expect(result).to.be.equal('22 February 2020');
    });

    it('lateAppealSubmitted with fee and setAside is enabled should return a formatted date with 14 days offset from the' +
      ' appealSubmission date', () => {

      const currentAppealStatus = 'lateAppealSubmitted';
      req.session.appeal.application.appealType = 'euSettlementScheme';
      const result = getDeadline(currentAppealStatus, req as Request, true);

      expect(result).to.be.equal('22 February 2020');
    });

    it('pendingPayment should return a formatted date with 14 days offset from the appealSubmission date', () => {

      const currentAppealStatus = 'pendingPayment';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('22 February 2020');
    });

    it('awaitingRespondentEvidence should return a formatted date with 14 days offset from the appealSubmission date', () => {

      const currentAppealStatus = 'appealSubmitted';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('13 February 2020');
    });

    it('awaitingRespondentEvidence should return a formatted date with 14 days offset from the appealSubmission date', () => {

      const currentAppealStatus = 'awaitingRespondentEvidence';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('13 February 2020');
    });

    it('awaitingRespondentEvidence should return a formatted date with 14 days offset from the appealSubmission date' +
      ' when dlrmFeeRemission is enabled', () => {

      const currentAppealStatus = 'awaitingRespondentEvidence';
      const result = getDeadline(currentAppealStatus, req as Request, true);

      expect(result).to.be.equal('22 February 2020');
    });
    it('awaitingRespondentEvidence should return a formatted date with 28 days offset from the appealSubmission date' +
      ' when dlrmFeeRemission is enabled and appeal is out of country', () => {
      req.session.appeal.appealOutOfCountry = 'Yes';
      req.session.appeal.application.helpWithFeesOption = 'someFee';
      const currentAppealStatus = 'awaitingRespondentEvidence';
      const result = getDeadline(currentAppealStatus, req as Request, true);

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

    it('caseUnderReview should return a formatted date with 14 days offset from the buildCase event', () => {

      const currentAppealStatus = 'caseUnderReview';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('03 March 2020');
    });

    it('awaitingCmaRequirements should return a formatted  date with the requestCmaRequirements direction due date', () => {

      const currentAppealStatus = 'awaitingCmaRequirements';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('21 May 2020');
    });

    it('should return a formatted date for decisionWithdrawn state', () => {

      const currentAppealStatus = 'decisionWithdrawn';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('03 March 2020');
    });

    it('submitHearingRequirements should return a formatted  date with the legalRepresentativeHearingRequirements direction due date', () => {

      const currentAppealStatus = 'submitHearingRequirements';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('28 July 2020');
    });

    it('should return a formatted date for decisionWithdrawn state @thisONes', () => {

      const currentAppealStatus = 'decisionWithdrawn';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('03 March 2020');
    });

    it('submitHearingRequirements should return a formatted  date with the legalRepresentativeHearingRequirements direction due date', () => {

      const currentAppealStatus = 'submitHearingRequirements';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('28 July 2020');
    });

    it('should return a formatted date for decisionWithdrawn state @thisONes', () => {

      const currentAppealStatus = 'decisionWithdrawn';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('03 March 2020');
    });

    it('submitHearingRequirements should return a formatted  date with the legalRepresentativeHearingRequirements direction due date', () => {

      const currentAppealStatus = 'submitHearingRequirements';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('28 July 2020');
    });

    it('should return a formatted date for decisionWithdrawn state @thisONes', () => {

      const currentAppealStatus = 'decisionWithdrawn';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('03 March 2020');
    });

    it('should return a formatted date for decisionMaintained state', () => {

      const currentAppealStatus = 'decisionMaintained';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('23 February 2020');
    });

    it('should return a formatted date for respondentReview state', () => {

      const currentAppealStatus = 'respondentReview';
      const result = getDeadline(currentAppealStatus, req as Request);

      expect(result).to.be.equal('03 March 2020');
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

    it('cmaListed should return the hearing centre email for an ended case not listed', () => {
      req.session.appeal.hearing.hearingCentre = '';
      req.session.appeal.hearingCentre = 'taylorHouse';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case not listed', () => {
      req.session.appeal.hearing.hearingCentre = '';
      req.session.appeal.hearingCentre = 'manchester';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_MANCHESTER_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case not listed', () => {
      req.session.appeal.hearing.hearingCentre = '';
      req.session.appeal.hearingCentre = 'glasgow';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_GLASGOW_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case not listed', () => {
      req.session.appeal.hearing.hearingCentre = '';
      req.session.appeal.hearingCentre = 'newport';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_NEWPORT_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case not listed', () => {
      req.session.appeal.hearing.hearingCentre = '';
      req.session.appeal.hearingCentre = 'bradford';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_BRADFORD_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case not listed', () => {
      req.session.appeal.hearing.hearingCentre = '';
      req.session.appeal.hearingCentre = 'northShields';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_NORTH_SHIELDS_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case not listed', () => {
      req.session.appeal.hearing.hearingCentre = '';
      req.session.appeal.hearingCentre = 'hattonCross';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_HATTON_CROSS_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case not listed', () => {
      req.session.appeal.hearing.hearingCentre = '';
      req.session.appeal.hearingCentre = 'birmingham';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_BIRMINGHAM_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'taylorHouse';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'manchester';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_MANCHESTER_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'glasgow';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_GLASGOW_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'newport';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_NEWPORT_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'bradford';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_BRADFORD_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'northShields';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_NORTH_SHIELDS_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'hattonCross';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_HATTON_CROSS_EMAIL');
    });

    it('cmaListed should return the hearing centre email for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'birmingham';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_BIRMINGHAM_EMAIL');
    });

    it('getHearingCentreEmail should return the hearing centre email based on the hearing.hearingCentre for an ended case previously listed', () => {
      req.session.appeal.hearing.hearingCentre = 'birmingham';
      req.session.appeal.hearingCentre = 'hattonCross';
      const result = getHearingCentreEmail(req as Request);
      expect(result).to.be.equal('IA_HEARING_CENTRE_BIRMINGHAM_EMAIL');
    });

    it('cmaListed should return the formatted hearing centre', () => {
      const result = getHearingTime(req as Request);
      expect(result).to.be.equal('10:00 am');
    });

    it('getFormattedDirectionDueDate should return due date from first directive with matching tag (multiple tags)', () => {
      const result = getFormattedDirectionDueDate(req.session.appeal.directions, ['requestReasonsForAppeal', 'requestCaseBuilding']);
      expect(result).to.be.equal('01 September 2020');
    });

    it('getFormattedDirectionDueDate should return due date from first directive with matching tag', () => {
      const result = getFormattedDirectionDueDate(req.session.appeal.directions, ['requestCaseBuilding']);
      expect(result).to.be.equal('28 August 2020');
    });

    it('getDueDateForAppellantToRespondToJudgeDecision should return due date when triggered updateTribunalDecision event with rule 31', () => {

      req.session.appeal.appealStatus = 'decided';
      req.session.appeal.isDecisionAllowed = 'allowed';
      req.session.appeal.updatedAppealDecision = 'dismissed';
      req.session.appeal.updateTribunalDecisionList = 'underRule31';

      const result = getDueDateForAppellantToRespondToJudgeDecision(req as Request, true);
      expect(result).to.be.equal('19 March 2024');
    });

    it('getDueDateForAppellantToRespondToJudgeDecision should return due date when triggered updateTribunalDecision event with rule 31 and OOC', () => {

      req.session.appeal.appealStatus = 'decided';
      req.session.appeal.isDecisionAllowed = 'allowed';
      req.session.appeal.updatedAppealDecision = 'dismissed';
      req.session.appeal.updateTribunalDecisionList = 'underRule31';
      req.session.appeal.appealOutOfCountry = 'Yes';

      const result = getDueDateForAppellantToRespondToJudgeDecision(req as Request, true);
      expect(result).to.be.equal('02 April 2024');
    });

    it('getDueDateForAppellantToRespondToJudgeDecision should return due date when triggered updateTribunalDecision event with rule 32', () => {

      req.session.appeal.appealStatus = 'decided';
      req.session.appeal.updateTribunalDecisionList = 'underRule32';

      const result = getDueDateForAppellantToRespondToJudgeDecision(req as Request, true);
      expect(result).to.be.equal(null);
    });

    it('getDueDateForAppellantToRespondToJudgeDecision should return due date from finalDecisionAndReasonsPdf tag when the flag of DLRM set aside is off', () => {

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        {
          fileId: '976fa409-4aab-40a4-a3f9-0c918f7293c8',
          name: 'DC 50016 2024-test 1650 27022024-Decision-and-reasons-Cover-letter-FINAL.pdf',
          id: '1',
          tag: 'finalDecisionAndReasonsPdf',
          dateUploaded: '2024-02-28'
        }
      ];

      const result = getDueDateForAppellantToRespondToJudgeDecision(req as Request, false);
      expect(result).to.be.equal('13 March 2024');
    });

    it('getDueDateForAppellantToRespondToJudgeDecision should return due date from finalDecisionAndReasonsPdf tag when the flag of DLRM set aside is off and OOC', () => {

      req.session.appeal.appealOutOfCountry = 'Yes';
      req.session.appeal.finalDecisionAndReasonsDocuments = [
        {
          fileId: '976fa409-4aab-40a4-a3f9-0c918f7293c8',
          name: 'DC 50016 2024-test 1650 27022024-Decision-and-reasons-Cover-letter-FINAL.pdf',
          id: '1',
          tag: 'finalDecisionAndReasonsPdf',
          dateUploaded: '2024-02-28'
        }
      ];

      const result = getDueDateForAppellantToRespondToJudgeDecision(req as Request, false);
      expect(result).to.be.equal('27 March 2024');
    });
  });
});
