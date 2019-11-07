import rp from 'request-promise';
import CcdService from '../../../app/service/ccd-service';
import { SecurityHeaders } from '../../../app/service/getHeaders';
import { expect, sinon } from '../../utils/testUtils';

describe('idam-service', () => {
  const headers = {} as SecurityHeaders;
  const userId = 'userId';
  const expectedCase = { caseId: 1 };
  let loadedCase;
  let loadCaseStub;
  let createCaseStub;

  describe('loadOrCreateCase loads a case', () => {
    const ccdService = new CcdService();

    before(async () => {
      loadCaseStub = sinon.stub(ccdService, 'loadCase');
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
      loadCaseStub = sinon.stub(ccdService, 'loadCase');
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

  describe('calls ccd api', () => {
    const ccdService = new CcdService();
    const getRequest = sinon.stub(rp, 'get');
    const expectedResult = new Promise((resolve) => {
      resolve();
    });

    before(async () => {
      getRequest.returns(expectedResult);
    });

    it('createCase', () => {
      const createCase = ccdService.createCase(userId, headers);

      expect(createCase).eq(expectedResult);
    });

    it('loadCase', () => {
      const createCase = ccdService.loadCase(userId, headers);

      expect(createCase).eq(expectedResult);
    });
  });
});
