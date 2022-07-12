import { NextFunction, Request, Response } from 'express';
import { deleteSupportingEvidence, getProvideSupportingEvidence, getProvideSupportingEvidenceCheckAndSend, getProvideSupportingEvidenceYesOrNo, getRequestSent, postProvideSupportingEvidenceYesOrNo, uploadSupportingEvidence } from '../../../../app/controllers/make-application/make-application-common';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Make application common', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          application: {},
          documentMap: []
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = {
      submitEventRefactored: sandbox.stub()
    } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getProvideSupportingEvidenceYesOrNo', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      getProvideSupportingEvidenceYesOrNo(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postProvideSupportingEvidenceYesOrNo', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      postProvideSupportingEvidenceYesOrNo(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getProvideSupportingEvidence', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      getProvideSupportingEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getProvideSupportingEvidenceCheckAndSend', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      getProvideSupportingEvidenceCheckAndSend(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getRequestSent', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);

      getRequestSent(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('uploadSupportingEvidence', () => {
    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      await uploadSupportingEvidence(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('deleteSupportingEvidence', () => {
    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      await deleteSupportingEvidence(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
