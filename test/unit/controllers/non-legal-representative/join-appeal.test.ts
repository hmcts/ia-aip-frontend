import { Request, Response } from 'express';
import {
  getJoinAppeal, getJoinAppealConfirmation,
  getJoinAppealConfirmDetails,
  postJoinAppeal, postJoinAppealConfirmDetails, setupJoinAppealControllers
} from '../../../../app/controllers/non-legal-representative/join-appeal';
import { Events } from '../../../../app/data/events';
import { isJourneyAllowedMiddleware } from '../../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../../app/paths';
import CcdSystemService, { PipValidation } from '../../../../app/service/ccd-system-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Join appeal controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let ccdSystemService: Partial<CcdSystemService>;
  const uuid: string = 'idamUID';
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
          uid: uuid
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
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getJoinAppeal', () => {
    it('should render join-appeal', () => {
      getJoinAppeal(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/join-appeal.njk', {
        previousPage: paths.common.overview
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getJoinAppeal(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postJoinAppeal', () => {
    let joinAppealPipValidationStub: sinon.SinonStub;
    let renderStub: sinon.SinonStub;
    let redirectStub: sinon.SinonStub;

    beforeEach(() => {
      joinAppealPipValidationStub = sandbox.stub();
      ccdSystemService = {
        joinAppealPipValidation: joinAppealPipValidationStub
      };

      redirectStub = sandbox.stub();
      renderStub = sandbox.stub();
      res = {
        render: renderStub,
        send: sandbox.stub(),
        redirect: redirectStub,
        locals: {}
      } as Partial<Response>;
    });

    it('should render join-appeal with correct errors if caseReference is empty', async () => {
      req.body = {
        caseReference: '',
        joinAppealAccessCode: 'some code'
      };
      const expectedValidationError = {
        caseReference: {
          key: 'caseReference',
          href: '#caseReference',
          text: i18n.validationErrors.caseReference
        }
      };
      await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/join-appeal.njk', {
        caseReference: '',
        joinAppealAccessCode: 'some code',
        errorList: Object.values(expectedValidationError),
        errors: expectedValidationError,
        previousPage: '/'
      });
    });

    it('should render join-appeal with correct errors if joinAppealAccessCode is empty', async () => {
      req.body = {
        caseReference: 'some reference',
        joinAppealAccessCode: ''
      };
      const expectedValidationError = {
        joinAppealAccessCode: {
          key: 'joinAppealAccessCode',
          href: '#joinAppealAccessCode',
          text: i18n.validationErrors.joinAppealAccessCode
        }
      };
      await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/join-appeal.njk', {
        caseReference: 'some reference',
        joinAppealAccessCode: '',
        errorList: Object.values(expectedValidationError),
        errors: expectedValidationError,
        previousPage: '/'
      });
    });

    it('should redirect to joinAppealConfirmDetails if validation succeeds and pip is validated', async () => {
      req.body = {
        caseReference: '1234-5678 9012-3456',
        joinAppealAccessCode: 'someAccessCode'
      };
      const pipValidation = {
        accessValidated: true
      };
      joinAppealPipValidationStub.resolves(pipValidation);

      await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(joinAppealPipValidationStub).to.be.calledOnceWith('1234567890123456', 'someAccessCode');
      expect(req.session.joinAppealPipValidation).to.equal(pipValidation);
      expect(res.redirect).to.be.calledOnceWith(paths.nonLegalRep.joinAppealConfirmDetails);
    });

    describe('should render join-appeal with correct errors on pip validation failure', async () => {
      let pipValidation: PipValidation;
      const caseId: string = '1234-5678 9012-3456';
      const accessCode: string = 'someAccessCode';
      beforeEach(() => {
        req.body = {
          caseReference: caseId,
          joinAppealAccessCode: accessCode
        };
        pipValidation = {
          accessValidated: false,
          caseIdValid: true,
          doesPinExist: true,
          pinValid: true,
          codeUnused: true,
          codeNotExpired: true
        };
      });

      it('caseIdValid false', async () => {
        pipValidation.caseIdValid = false;
        joinAppealPipValidationStub.resolves(pipValidation);
        const expectedError = {
          caseReference: {
            key: 'caseReference',
            href: '#caseReference',
            text: i18n.pages.joinAppeal.enterCaseReference.error
          }
        };
        await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
        expect(joinAppealPipValidationStub).to.be.calledOnceWith('1234567890123456', accessCode);
        expect(req.session.joinAppealPipValidation).to.equal(undefined);
        expect(res.render).to.be.calledOnceWith('non-legal-rep/join-appeal.njk', {
          caseReference: caseId,
          joinAppealAccessCode: accessCode,
          errors: expectedError,
          errorList: Object.values(expectedError),
          previousPage: paths.common.overview
        });
      });

      it('doesPinExist false', async () => {
        pipValidation.doesPinExist = false;
        joinAppealPipValidationStub.resolves(pipValidation);
        const expectedError = {
          joinAppealAccessCode: {
            key: 'joinAppealAccessCode',
            href: '#joinAppealAccessCode',
            text: i18n.pages.joinAppeal.enterAccessCode.pinNotExistError.replace('{{ caseReference }}', caseId)
          }
        };
        await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
        expect(joinAppealPipValidationStub).to.be.calledOnceWith('1234567890123456', accessCode);
        expect(req.session.joinAppealPipValidation).to.equal(undefined);
        expect(res.render).to.be.calledOnceWith('non-legal-rep/join-appeal.njk', {
          caseReference: caseId,
          joinAppealAccessCode: accessCode,
          errors: expectedError,
          errorList: Object.values(expectedError),
          previousPage: paths.common.overview
        });
      });

      it('pinValid false', async () => {
        pipValidation.pinValid = false;
        joinAppealPipValidationStub.resolves(pipValidation);
        const expectedError = {
          joinAppealAccessCode: {
            key: 'joinAppealAccessCode',
            href: '#joinAppealAccessCode',
            text: i18n.pages.joinAppeal.enterAccessCode.pinInvalidError.replace('{{ caseReference }}', caseId)
          }
        };
        await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
        expect(joinAppealPipValidationStub).to.be.calledOnceWith('1234567890123456', accessCode);
        expect(req.session.joinAppealPipValidation).to.equal(undefined);
        expect(res.render).to.be.calledOnceWith('non-legal-rep/join-appeal.njk', {
          caseReference: caseId,
          joinAppealAccessCode: accessCode,
          errors: expectedError,
          errorList: Object.values(expectedError),
          previousPage: paths.common.overview
        });
      });

      it('codeUnused false', async () => {
        pipValidation.codeUnused = false;
        joinAppealPipValidationStub.resolves(pipValidation);
        const expectedError = {
          joinAppealAccessCode: {
            key: 'joinAppealAccessCode',
            href: '#joinAppealAccessCode',
            text: i18n.pages.joinAppeal.enterAccessCode.pinUsedError.replace('{{ caseReference }}', caseId)
          }
        };
        await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
        expect(joinAppealPipValidationStub).to.be.calledOnceWith('1234567890123456', accessCode);
        expect(req.session.joinAppealPipValidation).to.equal(undefined);
        expect(res.render).to.be.calledOnceWith('non-legal-rep/join-appeal.njk', {
          caseReference: caseId,
          joinAppealAccessCode: accessCode,
          errors: expectedError,
          errorList: Object.values(expectedError),
          previousPage: paths.common.overview
        });
      });

      it('codeNotExpired false', async () => {
        pipValidation.codeNotExpired = false;
        joinAppealPipValidationStub.resolves(pipValidation);
        const expectedError = {
          joinAppealAccessCode: {
            key: 'joinAppealAccessCode',
            href: '#joinAppealAccessCode',
            text: i18n.pages.joinAppeal.enterAccessCode.pinExpiredError.replace('{{ caseReference }}', caseId)
          }
        };
        await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
        expect(joinAppealPipValidationStub).to.be.calledOnceWith('1234567890123456', accessCode);
        expect(req.session.joinAppealPipValidation).to.equal(undefined);
        expect(res.render).to.be.calledOnceWith('non-legal-rep/join-appeal.njk', {
          caseReference: caseId,
          joinAppealAccessCode: accessCode,
          errors: expectedError,
          errorList: Object.values(expectedError),
          previousPage: paths.common.overview
        });
      });

      it('generic error', async () => {
        joinAppealPipValidationStub.resolves(pipValidation);
        const expectedError = {
          joinAppealAccessCode: {
            key: 'joinAppealAccessCode',
            href: '#joinAppealAccessCode',
            text: i18n.pages.joinAppeal.enterAccessCode.pinGenericError.replace('{{ caseReference }}', caseId)
          }
        };
        await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
        expect(joinAppealPipValidationStub).to.be.calledOnceWith('1234567890123456', accessCode);
        expect(req.session.joinAppealPipValidation).to.equal(undefined);
        expect(res.render).to.be.calledOnceWith('non-legal-rep/join-appeal.njk', {
          caseReference: caseId,
          joinAppealAccessCode: accessCode,
          errors: expectedError,
          errorList: Object.values(expectedError),
          previousPage: paths.common.overview
        });
      });
    });

    it('should catch a render error and redirect with error', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postJoinAppeal(ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getJoinAppealConfirmDetails', () => {
    it('should render join-appeal-confirm-details', () => {
      req.session.joinAppealPipValidation = {
        caseSummary: {
          referenceNumber: '1234567890123456',
          name: 'some name',
          appealReference: 'some appeal reference'
        }
      };
      getJoinAppealConfirmDetails(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/join-appeal-confirm-details.njk', {
        previousPage: paths.nonLegalRep.joinAppeal,
        caseDetails: [
          {
            key: { text: i18n.pages.joinAppeal.confirmDetails.fieldReferenceNumber },
            value: { html: '1234-5678-9012-3456' }
          },
          {
            key: { text: i18n.pages.joinAppeal.confirmDetails.fieldAppealReference },
            value: { html: 'some appeal reference' }
          },
          { key: { text: i18n.pages.joinAppeal.confirmDetails.fieldName }, value: { html: 'some name' } }
        ]
      });
    });

    it('should catch render error and redirect with error', () => {
      req.session.joinAppealPipValidation = {
        caseSummary: {
          referenceNumber: '1234567890123456',
          name: 'some name',
          appealReference: 'some appeal reference'
        }
      };
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getJoinAppealConfirmDetails(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });

    it('should redirect with error if no caseSummary from joinAppealPipValidation in session', () => {
      getJoinAppealConfirmDetails(req as Request, res as Response, next);
      expect(next.calledWith(sinon.match.instanceOf(TypeError))).to.equal(true);
      expect(next.args[0][0].message).to.equal("Cannot read properties of undefined (reading 'caseSummary')");
    });
  });

  describe('postJoinAppealConfirmDetails', () => {
    const caseId = '1234567890123456';
    const firstName = 'someFirstName';
    const lastName = 'someLastName';
    const someEmail = 'test@test.com';
    const appealRef = 'some appeal reference';
    let submitEventByCaseDetailsStub: sinon.SinonStub;
    let getCaseByIdStub: sinon.SinonStub;
    let renderStub: sinon.SinonStub;
    let redirectStub: sinon.SinonStub;
    const expectedCaseDetails = {
      case_data: {
        something: 'value',
        nlrDetails: {
          idamId: uuid
        }
      }
    };
    beforeEach(() => {
      submitEventByCaseDetailsStub = sandbox.stub();
      getCaseByIdStub = sandbox.stub();
      ccdSystemService = {
        getCaseById: getCaseByIdStub
      };
      updateAppealService = {
        submitEventByCaseDetails: submitEventByCaseDetailsStub
      };

      redirectStub = sandbox.stub();
      renderStub = sandbox.stub();
      res = {
        render: renderStub,
        send: sandbox.stub(),
        redirect: redirectStub,
        locals: {}
      } as Partial<Response>;
      req.idam.userDetails.given_name = firstName;
      req.idam.userDetails.family_name = lastName;
      req.idam.userDetails.sub = someEmail;
      req.session.joinAppealPipValidation = {
        caseSummary: {
          referenceNumber: caseId,
          name: firstName + ' ' + lastName,
          appealReference: appealRef
        }
      };
      const caseData = { something: 'value' };
      const caseDetails = { case_data: caseData };
      const response = { data: caseDetails };
      getCaseByIdStub.resolves(response);
    });

    it('should render join-appeal-confirm-details with correct errors if submit confirmation event fails', async () => {
      submitEventByCaseDetailsStub.resolves({error: ['some error']});
      await postJoinAppealConfirmDetails(updateAppealService as UpdateAppealService, ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(getCaseByIdStub).to.be.calledOnceWith(caseId);
      expect(submitEventByCaseDetailsStub).to.be.calledOnceWith(Events.JOIN_APPEAL_CONFIRMATION, expectedCaseDetails);

      expect(res.render).to.be.calledWith('non-legal-rep/join-appeal-confirm-details.njk', {
        previousPage: paths.nonLegalRep.joinAppeal,
        caseDetails: [
          {
            key: { text: i18n.pages.joinAppeal.confirmDetails.fieldReferenceNumber },
            value: { html: '1234-5678-9012-3456' }
          },
          {
            key: { text: i18n.pages.joinAppeal.confirmDetails.fieldAppealReference },
            value: { html: 'some appeal reference' }
          },
          { key: { text: i18n.pages.joinAppeal.confirmDetails.fieldName }, value: { html: 'someFirstName someLastName' } }
        ],
        errorList: [
          {
            key: 'confirm-details-button',
            text: i18n.pages.joinAppeal.confirmDetails.error,
            href: '#confirm-details-button'
          }
        ]
      });
    });

    it('should redirect to joinAppealConfirmation if validation and event response error is emptyList', async () => {
      submitEventByCaseDetailsStub.resolves({error: []});
      await postJoinAppealConfirmDetails(updateAppealService as UpdateAppealService, ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(getCaseByIdStub).to.be.calledOnceWith(caseId);
      expect(submitEventByCaseDetailsStub).to.be.calledOnceWith(Events.JOIN_APPEAL_CONFIRMATION, expectedCaseDetails);
      expect(res.redirect).to.be.calledWith(paths.nonLegalRep.joinAppealConfirmation);
    });

    it('should redirect to joinAppealConfirmation if validation and no event response error', async () => {
      submitEventByCaseDetailsStub.resolves({});
      await postJoinAppealConfirmDetails(updateAppealService as UpdateAppealService, ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(getCaseByIdStub).to.be.calledOnceWith(caseId);
      expect(submitEventByCaseDetailsStub).to.be.calledOnceWith(Events.JOIN_APPEAL_CONFIRMATION, expectedCaseDetails);
      expect(res.redirect).to.be.calledWith(paths.nonLegalRep.joinAppealConfirmation);
    });

    it('should catch a validation error and redirect with error', async () => {
      submitEventByCaseDetailsStub.resolves({error: ['some error']});
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postJoinAppealConfirmDetails(updateAppealService as UpdateAppealService, ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });

    it('should catch getCaseById error and redirect with error', async () => {
      const error = new Error('the error');
      getCaseByIdStub.throws(error);
      await postJoinAppealConfirmDetails(updateAppealService as UpdateAppealService, ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });

    it('should catch submitEventByCaseDetailsStub error and redirect with error', async () => {
      const error = new Error('the error');
      submitEventByCaseDetailsStub.throws(error);
      await postJoinAppealConfirmDetails(updateAppealService as UpdateAppealService, ccdSystemService as CcdSystemService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getJoinAppealConfirmation', () => {
    it('should render confirmation-page', () => {
      req.session.joinAppealPipValidation = { caseSummary: { name: 'someAppellantName' } };
      getJoinAppealConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.joinAppeal.confirmation.title,
        whatNextContent: i18n.pages.joinAppeal.confirmation.whatNextContent,
        appellantName: 'someAppellantName'
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getJoinAppealConfirmation(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('setupJoinAppealControllers', () => {
    it('should return the correct routers', () => {
      const express = require('express');
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [isJourneyAllowedMiddleware];

      setupJoinAppealControllers(middleware, updateAppealService as UpdateAppealService, ccdSystemService as CcdSystemService);
      expect(routerGetStub.calledWith(paths.nonLegalRep.joinAppeal, middleware, getJoinAppeal)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.joinAppeal, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.joinAppealConfirmDetails, middleware, getJoinAppealConfirmDetails)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.joinAppealConfirmDetails, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.joinAppealConfirmation, middleware, getJoinAppealConfirmation)).to.equal(true);
    });
  });
});
