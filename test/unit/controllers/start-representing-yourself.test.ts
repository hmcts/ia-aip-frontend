import express, { NextFunction, Request, Response } from 'express';
import {
  getConfirmCaseDetails,
  getEnterCaseReference, getEnterSecurityCode,
  getStartRepresentingYourself, postConfirmCaseDetails, postEnterCaseReference, postValidateAccess,
  setupStartRepresentingMyselfPublicControllers
} from '../../../app/controllers/start-represent-yourself';
import { paths } from '../../../app/paths';
import CcdSystemService from '../../../app/service/ccd-system-service';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('start-representing-yourself', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      params: {},
      session: {}
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('setupStartRepresentingMyselfPublicControllers', () => {
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
    const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
    const ccdSystemService: CcdSystemService = null;

    setupStartRepresentingMyselfPublicControllers(ccdSystemService);

    expect(routerGetStub).to.have.been.calledWith(paths.startRepresentingYourself.start);
    expect(routerGetStub).to.have.been.calledWith(paths.startRepresentingYourself.enterCaseNumber);
    expect(routerPostStub).to.have.been.calledWith(paths.startRepresentingYourself.enterCaseNumber);
    expect(routerGetStub).to.have.been.calledWith(paths.startRepresentingYourself.enterSecurityCode);
    expect(routerPostStub).to.have.been.calledWith(paths.startRepresentingYourself.enterSecurityCode);
    expect(routerGetStub).to.have.been.calledWith(paths.startRepresentingYourself.confirmDetails);
    expect(routerPostStub).to.have.been.calledWith(paths.startRepresentingYourself.confirmDetails);
  });

  it('getStartRepresentingYourself', () => {
    getStartRepresentingYourself(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledWith('start-representing-yourself/start-representing-yourself.njk', {
      nextPage: paths.startRepresentingYourself.enterCaseNumber
    });
  });

  it('getEnterCaseReference', () => {
    getEnterCaseReference(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledWith('start-representing-yourself/enter-case-reference.njk', { });
  });

  it('getEnterCaseReference with error error caseReferenceNumber', () => {
    req.query.error = 'caseReferenceNumber';
    getEnterCaseReference(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledWith('start-representing-yourself/enter-case-reference.njk', {
      error: {
        caseReferenceNumber: {
          key: 'caseReferenceNumber',
          text: i18n.pages.startRepresentingYourself.enterCaseReference.error,
          href: '#caseReferenceNumber'
        }
      },
      errorList: [
        {
          key: 'caseReferenceNumber',
          text: i18n.pages.startRepresentingYourself.enterCaseReference.error,
          href: '#caseReferenceNumber'
        }
      ]
    });
  });

  it('getEnterCaseReference with error pipValidationFailed', () => {
    req.query.error = 'pipValidationFailed';
    getEnterCaseReference(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledWith('start-representing-yourself/enter-case-reference.njk', {
      error: {
        pipValidationFailed: {
          key: 'pipValidationFailed',
          text: i18n.pages.startRepresentingYourself.pipValidationFailed,
          href: '#pipValidationFailed'
        }
      },
      errorList: [
        {
          key: 'pipValidationFailed',
          text: i18n.pages.startRepresentingYourself.pipValidationFailed,
          href: '#pipValidationFailed'
        }
      ]
    });
  });

  it('postEnterCaseReference with valid reference, redirects to enter security code', () => {
    req.body.caseReferenceNumber = '1234-1234-1234-1234';
    postEnterCaseReference(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledWith(paths.startRepresentingYourself.enterSecurityCode);
  });

  it('postEnterCaseReference with invalid reference, redirects to enter case reference with error message', () => {
    req.body.caseReferenceNumber = 'INVALID';
    postEnterCaseReference(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledWith(paths.startRepresentingYourself.enterCaseNumber + '?error=caseReferenceNumber');
  });

  it('getEnterSecurityCode', () => {
    getEnterSecurityCode(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledWith('start-representing-yourself/enter-security-code.njk', { });
  });

  it('getEnterSecurityCode with error message', () => {
    req.query.error = 'accessCode';
    getEnterSecurityCode(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledWith('start-representing-yourself/enter-security-code.njk', {
      error: {
        accessCode: {
          key: 'accessCode',
          text: i18n.pages.startRepresentingYourself.enterSecurityCode.error,
          href: '#accessCode'
        }
      },
      errorList: [
        {
          key: 'accessCode',
          text: i18n.pages.startRepresentingYourself.enterSecurityCode.error,
          href: '#accessCode'
        }
      ]
    });
  });

  it('postValidateAccess is successful, redirects to confirm details', async() => {
    let ccdSystemServiceStub = {
      pipValidation: sandbox.stub().resolves(Promise.resolve({
        accessValidated: true,
        caseSummary: {
          name: 'James Bond',
          dateOfBirth: '1980-12-31',
          referenceNumber: 1234123412341234
        }
      }))
    };

    req.session.startRepresentingYourself = { id: '1234123412341234' };
    req.body.accessCode = 'ABCD1234EFGH';

    await postValidateAccess(ccdSystemServiceStub as unknown as CcdSystemService)(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledWith(paths.startRepresentingYourself.confirmDetails);
  });

  it('postValidateAccess with invalid security code, redirects to enter security code with error message', async() => {
    let ccdSystemServiceStub = {
      pipValidation: sandbox.spy()
    };

    req.body.accessCode = 'INVALID';

    await postValidateAccess(ccdSystemServiceStub as unknown as CcdSystemService)(req as Request, res as Response, next);
    expect(ccdSystemServiceStub.pipValidation).to.have.been.callCount(0);
    expect(res.redirect).to.have.been.calledWith(paths.startRepresentingYourself.enterSecurityCode + '?error=accessCode');
  });

  it('postValidateAccess with incorrect security code, redirects to enter enter case number with error message', async() => {
    let ccdSystemServiceStub = {
      pipValidation: sandbox.stub().resolves(Promise.resolve({
        accessValidated: false
      }))
    };

    req.session.startRepresentingYourself = { id: '1234123412341234' };
    req.body.accessCode = 'ABCD1234EFGH';

    await postValidateAccess(ccdSystemServiceStub as unknown as CcdSystemService)(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledWith(paths.startRepresentingYourself.enterCaseNumber + '?error=pipValidationFailed');
  });

  it('getConfirmCaseDetails', () => {
    req.session.startRepresentingYourself = {
      caseSummary: {
        name: 'James Bond',
        dateOfBirth: '1980-12-31',
        referenceNumber: 1234123412341234
      }
    };

    getConfirmCaseDetails(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledWith('start-representing-yourself/confirm-case-details.njk', {
      caseDetails: [
        { key: { text: i18n.pages.startRepresentingYourself.confirmDetails.fieldName }, value: { html: 'James Bond' } },
        { key: { text: i18n.pages.startRepresentingYourself.confirmDetails.fieldDateOfBirth }, value: { html: '31 December 1980' } },
        { key: { text: i18n.pages.startRepresentingYourself.confirmDetails.fieldReferenceNumber }, value: { html: '1234-1234-1234-1234' } }
      ]
    });
  });

  it('postConfirmCaseDetails', () => {
    postConfirmCaseDetails(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledWith(paths.common.login);
  });
});
