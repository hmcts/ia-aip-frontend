import { Request } from 'express';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import Logger from '../../../app/utils/logger';
import {
  asBooleanValue,
  documentIdToDocStoreUrl,
  formatTextForCYA,
  getApplicationType,
  getFtpaApplicantType,
  hasPendingTimeExtension,
  nowAppealDate,
  toIsoDate
} from '../../../app/utils/utils';
import { expect, sinon } from '../../utils/testUtils';

describe('utils', () => {

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
          reasonsForAppeal: {}
        }
      },
      idam: {
        userDetails: {
          forename: 'forename',
          surname: 'surname',
          uid: 'appellant'
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
    LaunchDarklyService.close();
  });

  describe('asBooleanValue', () => {
    it('should be true', () => {
      expect(asBooleanValue(1)).to.be.eq(true);
      expect(asBooleanValue('1')).to.be.eq(true);
      expect(asBooleanValue('true')).to.be.eq(true);
      expect(asBooleanValue('True')).to.be.eq(true);
      expect(asBooleanValue('TRUE')).to.be.eq(true);
      expect(asBooleanValue('yes')).to.be.eq(true);
      expect(asBooleanValue('Yes')).to.be.eq(true);
      expect(asBooleanValue('YES')).to.be.eq(true);
      expect(asBooleanValue('on')).to.be.eq(true);
      expect(asBooleanValue('On')).to.be.eq(true);
      expect(asBooleanValue('ON')).to.be.eq(true);
    });
    it('should be false', () => {
      expect(asBooleanValue(0)).to.be.eq(false);
      expect(asBooleanValue('0')).to.be.eq(false);
      expect(asBooleanValue('false')).to.be.eq(false);
      expect(asBooleanValue('False')).to.be.eq(false);
      expect(asBooleanValue('FALSE')).to.be.eq(false);
      expect(asBooleanValue('no')).to.be.eq(false);
      expect(asBooleanValue('No')).to.be.eq(false);
      expect(asBooleanValue('NO')).to.be.eq(false);
      expect(asBooleanValue('off')).to.be.eq(false);
      expect(asBooleanValue('Off')).to.be.eq(false);
      expect(asBooleanValue('OFF')).to.be.eq(false);
    });
    it('should be false if its null or undefined', () => {
      expect(asBooleanValue(null)).to.be.eq(false);
      expect(asBooleanValue(undefined)).to.be.eq(false);
    });

    it('should be false for special cases', () => {
      expect(asBooleanValue('')).to.be.eq(false);
      expect(asBooleanValue('undefined')).to.be.eq(false);
      expect(asBooleanValue('null')).to.be.eq(false);
    });

    it('should not transform booleans', () => {
      expect(asBooleanValue(true)).to.be.eq(true);
      expect(asBooleanValue(false)).to.be.eq(false);
    });
  });

  describe('nowAppealDate', () => {
    it('gets an appeal date for today', () => {
      expect(nowAppealDate().year).to.be.eq(new Date().getFullYear().toString(10));
      expect(nowAppealDate().month).to.be.eq((new Date().getMonth() + 1).toString(10));
      expect(nowAppealDate().day).to.be.eq(new Date().getDate().toString(10));
    });
  });

  describe('toIsoDate', () => {
    it('converts date correctly', () => {
      expect(toIsoDate({ year: '2020', month: '1', day: '1' })).to.be.eq('2020-01-01');
      expect(toIsoDate({ year: '2020', month: '12', day: '30' })).to.be.eq('2020-12-30');
    });

    it('handles leap year', () => {
      expect(toIsoDate({ year: '2020', month: '2', day: '29' })).to.be.eq('2020-02-29');
    });

    it('handles summer time year', () => {
      expect(toIsoDate({ year: '2020', month: '3', day: '30' })).to.be.eq('2020-03-30');
    });
  });

  describe('hasPendingTimeExtension', () => {
    const pendingApplication: Collection<Application<Evidence>>[] = [{
      id: '2',
      value: {
        applicant: 'Appellant',
        applicantRole: 'citizen',
        date: '2021-07-15',
        decision: 'Pending',
        details: 'my details',
        state: 'awaitingReasonsForAppeal',
        type: 'Time extension',
        evidence: []
      }
    }];
    const refusedApplication: Collection<Application<Evidence>>[] = [{
      id: '1',
      value: {
        applicant: 'Appellant',
        applicantRole: 'citizen',
        date: '2021-07-10',
        decision: 'Refused',
        decisionDate: '2021-07-12',
        decisionMaker: 'Tribunal Caseworker',
        decisionReason: 'reason why',
        details: 'my details',
        state: 'awaitingReasonsForAppeal',
        type: 'Time extension',
        evidence: []
      }
    }];
    it('does not have inflight appeals if no time extensions', () => {
      const inflightTimeExtension = hasPendingTimeExtension({
        timeExtensions: [],
        appealStatus: 'currentState'
      } as Appeal);
      expect(inflightTimeExtension).to.be.eq(false);
    });

    it('does not have inflight appeals if previous time extensions are not set', () => {
      const inflightTimeExtension = hasPendingTimeExtension({
        appealStatus: 'currentState'
      } as Appeal);
      expect(inflightTimeExtension).to.be.eq(false);
    });

    it('does not have inflight appeals if previous time extension for different state', () => {
      const inflightTimeExtension = hasPendingTimeExtension({
        timeExtensions: [{
          type: 'Time Extension',
          state: 'oldState'
        } as Partial<TimeExtension>],
        appealStatus: 'currentState'
      } as Appeal);
      expect(inflightTimeExtension).to.be.eq(false);
    });

    it('should return default value if undefined', () => {
      const inflightTimeExtension = hasPendingTimeExtension({} as Appeal);
      expect(inflightTimeExtension).to.be.eq(false);
    });

    it('does not have inflight appeals', () => {
      const inflightTimeExtension = hasPendingTimeExtension(
        {
          makeAnApplications: refusedApplication
        } as Appeal);
      expect(inflightTimeExtension).to.be.eq(false);
    });

    it('has inflight appeal', () => {
      const inflightTimeExtension = hasPendingTimeExtension({
        makeAnApplications: pendingApplication
      } as Appeal);
      expect(inflightTimeExtension).to.be.eq(true);
    });
  });

  describe('formatTextForCYA', () => {
    it('converts \n to <br/>', () => {
      const actualText = formatTextForCYA('A_string\nwith_a_new_line');
      expect(actualText).to.be.eq('A_string<br />\nwith_a_new_line');
    });

    it('converts spaces', () => {
      const actualText = formatTextForCYA('A string');
      expect(actualText).to.be.eq('A&nbsp;string');
    });

    it('converts indents', () => {
      const actualText = formatTextForCYA('A string\n  with an indent');
      expect(actualText).to.be.eq('A&nbsp;string<br />\n&nbsp;&nbsp;with&nbsp;an&nbsp;indent');
    });
  });

  describe('getApplicationType', () => {
    it('Valid type', () => {
      expect(getApplicationType('Judge\'s review of application decision')).to.include({ code: 'askJudgeReview', type: 'Judge\'s review of application decision' });
      expect(getApplicationType('Other')).to.include({ code: 'askSomethingElse', type: 'Other' });
    });

    it('Invalid type', () => {
      expect(getApplicationType('INVALID')).to.be.eq(undefined);
    });
  });

  describe('getFtpaApplicantType', () => {
    it('getFtpaApplicantType should return appellant in ftpa decided state', () => {
      req.session.appeal.ftpaApplicantType = 'appellant';
      req.session.appeal.appealStatus = 'ftpaDecided';
      expect(getFtpaApplicantType(req.session.appeal)).to.eq('appellant');
    });

    it('getFtpaApplicantType should return respondent in ftpa decided state', () => {
      req.session.appeal.ftpaApplicantType = 'respondent';
      req.session.appeal.appealStatus = 'ftpaDecided';
      expect(getFtpaApplicantType(req.session.appeal)).to.eq('respondent');
    });

    it('getFtpaApplicantType should return appellant in ftpa submitted state', () => {
      req.session.appeal.ftpaRespondentApplicationDate = '2022-01-01';
      req.session.appeal.ftpaAppellantApplicationDate = '2022-01-02';
      req.session.appeal.appealStatus = 'ftpaSubmitted';
      expect(getFtpaApplicantType(req.session.appeal)).to.eq('appellant');
    });

    it('getFtpaApplicantType should return respondent in ftpa submitted state', () => {
      req.session.appeal.ftpaRespondentApplicationDate = '2022-01-02';
      req.session.appeal.ftpaAppellantApplicationDate = '2022-01-01';
      req.session.appeal.appealStatus = 'ftpaSubmitted';
      expect(getFtpaApplicantType(req.session.appeal)).to.eq('respondent');
    });

    it('getFtpaApplicantType should return appellant in ftpa submitted state', () => {
      req.session.appeal.ftpaRespondentApplicationDate = '2022-01-01';
      req.session.appeal.ftpaAppellantApplicationDate = '2022-01-01';
      req.session.appeal.appealStatus = 'ftpaSubmitted';
      expect(getFtpaApplicantType(req.session.appeal)).to.eq('appellant');
    });

    it('getFtpaApplicantType should return appellant in ftpa submitted state', () => {
      req.session.appeal.ftpaAppellantApplicationDate = '2022-01-02';
      req.session.appeal.appealStatus = 'ftpaSubmitted';
      expect(getFtpaApplicantType(req.session.appeal)).to.eq('appellant');
    });

    it('getFtpaApplicantType should return respondent in ftpa submitted state', () => {
      req.session.appeal.ftpaRespondentApplicationDate = '2022-01-02';
      req.session.appeal.appealStatus = 'ftpaSubmitted';
      expect(getFtpaApplicantType(req.session.appeal)).to.eq('respondent');
    });

    it('getFtpaApplicantType should return undefined in ftpa submitted state', () => {
      req.session.appeal.appealStatus = 'ftpaSubmitted';
      expect(getFtpaApplicantType(req.session.appeal)).to.eq(undefined);
    });

    it('documentIdToDocStoreUrl should retrieve the doc store url using key', () => {
      const documentMap: DocumentMap[] = [
        { id: '00000000-0000-0000-0000-000000000000', url: 'http://someDocumentUrl/' }
      ];
      const result = documentIdToDocStoreUrl('00000000-0000-0000-0000-000000000000', documentMap);
      expect(result).to.be.a('string');
      expect(result).to.be.eq('http://someDocumentUrl/');
    });

  });

});
