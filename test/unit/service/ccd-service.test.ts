import rp from 'request-promise';
import { SecurityHeaders } from '../../../app/service/authentication-service';
import { CcdService, Events } from '../../../app/service/ccd-service';
import { expect, sinon } from '../../utils/testUtils';

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
        resolve([expectedCase]);
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
      const expectedResult = { } as any;
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
    const expectedResult = { } as any;

    it('updates case', async () => {
      const startUpdateCaseStub = sinon.stub(ccdService, 'startUpdateAppeal');
      startUpdateCaseStub.resolves({
        event_id: 'eventId',
        token: 'token'
      });

      const submitUpdateCaseStub = sinon.stub(ccdService, 'submitUpdateAppeal');
      const caseData = { journeyType: 'AIP' };
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
        case_data: caseData
      }, headers);

      expect(caseDetails).eq(expectedResult);
    });
  });

  describe('calls ccd api', () => {
    const ccdService = new CcdService();
    const getRequest = sinon.stub(rp, 'get');
    const expectedResultGet = new Promise((resolve) => {
      resolve();
    });
    const postRequest = sinon.stub(rp, 'post');
    const expectedResultPost = new Promise((resolve) => {
      resolve();
    });

    before(async () => {
      getRequest.returns(expectedResultGet);
      postRequest.returns(expectedResultPost);
    });

    it('startCreateCase', () => {
      const createCase = ccdService.startCreateCase(userId, headers);

      expect(createCase).eq(expectedResultGet);
    });

    it('submitCreateCase', () => {
      const submitCreateCase = ccdService.submitCreateCase(userId, headers, {} as any);

      expect(submitCreateCase).eq(expectedResultPost);
    });

    it('loadCasesForUser', () => {
      const createCase = ccdService.loadCasesForUser(userId, headers);

      expect(createCase).eq(expectedResultGet);
    });

    it('startUpdateCase with "editAppeal"', () => {
      const updateCase = ccdService.startUpdateAppeal(userId, caseId, Events.EDIT_APPEAL.id, headers);

      expect(updateCase).eq(expectedResultGet);
    });

    it('startUpdateCase with "submitAppeal', () => {
      const updateCase = ccdService.startUpdateAppeal(userId, caseId, Events.SUBMIT_APPEAL.id, headers);

      expect(updateCase).eq(expectedResultGet);
    });

    it('submitUpdateCase', () => {
      const submitCreateCase = ccdService.submitUpdateAppeal(userId, caseId,headers, {} as any);

      expect(submitCreateCase).eq(expectedResultPost);
    });
  });
});
