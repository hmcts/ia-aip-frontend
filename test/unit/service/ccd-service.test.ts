import rp from 'request-promise';
import { Events } from '../../../app/data/events';
import { SecurityHeaders } from '../../../app/service/authentication-service';
import { CcdService } from '../../../app/service/ccd-service';
import { expect, sinon } from '../../utils/testUtils';
import { multipleEventsData, startAppealEventData } from '../mockData/events/data';
import { expectedMultipleEventsData, expectedStartAppealEventData } from '../mockData/events/expectations';

describe('idam-service', () => {
  const headers = {} as SecurityHeaders;
  const userId = 'userId';
  const caseId = 'caseId';
  const expectedCase = { caseId: 1 };
  let loadedCase;
  let loadCaseStub;
  let createCaseStub;

  describe('loadOrCreateCase loads a case', () => {
    const ccdService = new CcdService();

    before(async () => {
      loadCaseStub = sinon.stub(ccdService, 'loadCasesForUser');
      loadCaseStub.withArgs(userId, headers).returns(new Promise((resolve) => {
        resolve([ expectedCase ]);
      }));

      createCaseStub = sinon.mock(ccdService).expects('createCase').never();

      loadedCase = await ccdService.loadOrCreateCase(userId, headers);
    });

    it('loads the first case', () => {
      expect(loadedCase).eq(expectedCase);
    });

    it('does not create a new case', () => {
      createCaseStub.verify();
    });
  });

  describe('loadOrCreateCase creates a case', () => {
    const ccdService = new CcdService();

    before(async () => {
      loadCaseStub = sinon.stub(ccdService, 'loadCasesForUser');
      loadCaseStub.withArgs(userId, headers).returns(new Promise((resolve) => {
        resolve([]);
      }));

      createCaseStub = sinon.stub(ccdService, 'createCase');
      createCaseStub.withArgs(userId, headers).returns(new Promise((resolve) => {
        resolve(expectedCase);
      }));

      loadedCase = await ccdService.loadOrCreateCase(userId, headers);
    });

    it('creates a case', () => {
      expect(loadedCase).eq(expectedCase);
    });
  });

  describe('createCase', () => {
    const ccdService = new CcdService();

    it('creates and submits case', async () => {
      const startCreateCaseStub = sinon.stub(ccdService, 'startCreateCase');
      startCreateCaseStub.resolves({
        event_id: 'eventId',
        token: 'token'
      });

      const submitCreateCaseStub = sinon.stub(ccdService, 'submitCreateCase');
      const expectedResult = {} as any;
      submitCreateCaseStub.withArgs(userId, headers, {
        event: {
          id: 'eventId',
          summary: 'Create case AIP',
          description: 'Create case AIP'
        },
        data: {
          journeyType: 'aip'
        },
        event_token: 'token',
        ignore_warning: true
      }).resolves(expectedResult);

      const ccdCaseDetails = await ccdService.createCase(userId, headers);

      expect(ccdCaseDetails).eq(expectedResult);
    });
  });

  describe('updateCase', () => {
    const ccdService = new CcdService();
    const expectedResult = {} as any;

    it('updates case', async () => {
      const startUpdateCaseStub = sinon.stub(ccdService, 'startUpdateAppeal');
      startUpdateCaseStub.resolves({
        event_id: 'eventId',
        token: 'token'
      });

      const submitUpdateCaseStub = sinon.stub(ccdService, 'submitUpdateAppeal');
      const caseData = { journeyType: 'AIP' } as Partial<CaseData>;
      submitUpdateCaseStub.withArgs(userId, caseId, headers, {
        event: {
          id: 'eventId',
          summary: Events.EDIT_APPEAL.summary,
          description: Events.EDIT_APPEAL.description
        },
        data: caseData,
        event_token: 'token',
        ignore_warning: true
      }).resolves(expectedResult);

      const caseDetails = await ccdService.updateAppeal(Events.EDIT_APPEAL, userId, {
        id: caseId,
        state: 'appealStarted',
        case_data: caseData as CaseData
      }, headers);

      expect(caseDetails).eq(expectedResult);
    });
  });

  describe('getCaseHistory', () => {
    const ccdService = new CcdService();
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
      sandbox = sinon.createSandbox();

    });

    afterEach(() => {
      sandbox.restore();
    });

    it('gets events history when timeline is enabled for one event', async () => {
      const retrieveCaseHistoryStub = sandbox.stub(ccdService, 'retrieveCaseHistoryV2');
      retrieveCaseHistoryStub.resolves(startAppealEventData);

      const result = await ccdService.getCaseHistory(userId, caseId, headers);
      // tslint:disable-next-line:no-console
      console.debug('***************************************');
      // tslint:disable-next-line:no-console
      console.debug(JSON.stringify(result));
      // tslint:disable-next-line:no-console
      console.debug(JSON.stringify(expectedStartAppealEventData));

      expect(result).deep.equal(expectedStartAppealEventData);
    });

    it('gets events history when timeline is enabled and filters out unnecessary events for multiple events', async () => {
      const retrieveCaseHistoryStub = sandbox.stub(ccdService, 'retrieveCaseHistoryV2');
      retrieveCaseHistoryStub.resolves(multipleEventsData);

      const result = await ccdService.getCaseHistory(userId, caseId, headers);

      expect(result).deep.equal(expectedMultipleEventsData.filter(event => event.id !== 'editAppeal'));
    });
  });

  describe('calls ccd api', () => {
    const ccdService = new CcdService();
    let getRequest: sinon.SinonStub;
    let postRequest: sinon.SinonStub;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      getRequest = sandbox.stub(rp, 'get').resolves({});
      postRequest = sandbox.stub(rp, 'post').resolves({});
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('startCreateCase', async () => {
      await ccdService.startCreateCase(userId, headers);

      expect(getRequest).to.have.been.called;
    });

    it('submitCreateCase', async () => {
      await ccdService.submitCreateCase(userId, headers, {} as any);

      expect(postRequest).to.have.been.called;
    });

    it('loadCasesForUser', async () => {
      await ccdService.loadCasesForUser(userId, headers);

      expect(getRequest).to.have.been.called;
    });

    it('startUpdateAppeal with "editAppeal"', async () => {
      await ccdService.startUpdateAppeal(userId, caseId, Events.EDIT_APPEAL.id, headers);

      expect(getRequest).to.have.been.called;
    });

    it('submitUpdateCase', async () => {
      await ccdService.submitUpdateAppeal(userId, caseId, headers, {} as any);

      expect(postRequest).to.have.been.called;
    });

    it('retrieveCaseHistoryV2', async () => {
      await ccdService.retrieveCaseHistoryV2(userId, caseId, headers);

      expect(getRequest).to.have.been.called;
    });
  });
});
