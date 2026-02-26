import { Request, Response } from 'express';
import {
  getAddNonLegalRepresentative,
  getInviteToCreateAccount,
  getInviteToCreateAccountConfirmation,
  getInviteToJoinAppeal,
  getInviteToJoinAppealConfirmation,
  postInviteToCreateAccount,
  postInviteToJoinAppeal,
  setupNonLegalRepresentativeControllers
} from '../../../../app/controllers/non-legal-representative/add-non-legal-representative';
import { Events } from '../../../../app/data/events';
import { isJourneyAllowedMiddleware } from '../../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Appeal application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;

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
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getAddNonLegalRepresentative', () => {
    it('should render add-non-legal-representative', () => {
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/add-non-legal-representative.njk', {
        previousPage: paths.common.overview
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToCreateAccount', () => {
    it('should render provide-email-create-account', () => {
      getInviteToCreateAccount(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-create-account.njk', {
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getInviteToCreateAccount(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postInviteToCreateAccount', () => {
    let submitEventRefactoredStub: sinon.SinonStub;
    let renderStub: sinon.SinonStub;
    let redirectStub: sinon.SinonStub;

    beforeEach(() => {
      submitEventRefactoredStub = sandbox.stub();
      updateAppealService = {
        submitEventRefactored: submitEventRefactoredStub
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

    it('should render provide-email-create-account with correct errors if email is empty', async () => {
      req.body = {
        'email-value': ''
      };
      const expectedValidationError = {
        'email-value': {
          key: 'email-value',
          href: '#email-value',
          text: i18n.validationErrors.emailEmpty
        }
      };
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-create-account.njk', {
        nlrEmail: '',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render provide-email-create-account with correct errors if email validation fails', async () => {
      req.body = {
        'email-value': 'something that is not an email'
      };
      const expectedValidationError = {
        'email-value': {
          key: 'email-value',
          href: '#email-value',
          text: i18n.validationErrors.emailFormat
        }
      };
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-create-account.njk', {
        nlrEmail: 'something that is not an email',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should redirect to inviteToCreateAccountConfirmation if validation and event succeeds', async () => {
      req.body = {
        'email-value': 'test@test.com'
      };
      const expectedAppeal = { ...req.session.appeal, nlrEmail: 'test@test.com' };
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitEventRefactoredStub).to.be.calledOnceWith(Events.SEND_INVITE_TO_NON_LEGAL_REP, expectedAppeal, 'idamUID', 'atoken');
      expect(res.redirect).to.be.calledOnceWith(paths.nonLegalRep.inviteToCreateAccountConfirmation);
    });

    it('should catch a validation error and redirect with error', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });

    it('should catch event submission error and redirect with error', async () => {
      req.body = {
        'email-value': 'test@test.com'
      };
      const error = new Error('the error');
      submitEventRefactoredStub.throws(error);
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToCreateAccountConfirmation', () => {
    it('should render confirmation-page', () => {
      getInviteToCreateAccountConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToCreateAccount.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToCreateAccount.confirmation.whatNextListItems,
        nlrEmail: undefined
      });
    });

    it('should render confirmation-page with nlrEmail', () => {
      req.session = {
        appeal: {
          nlrEmail: 'someEmail'
        } as Appeal
      } as any;
      getInviteToCreateAccountConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToCreateAccount.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToCreateAccount.confirmation.whatNextListItems,
        nlrEmail: 'someEmail'
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getInviteToCreateAccountConfirmation(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToJoinAppeal', () => {
    it('should render provide-email-join-appeal', () => {
      getInviteToJoinAppeal(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-join-appeal.njk', {
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getInviteToJoinAppeal(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postInviteToJoinAppeal', () => {
    let submitEventRefactoredStub: sinon.SinonStub;
    let validationMidEventStub: sinon.SinonStub;
    let renderStub: sinon.SinonStub;
    let redirectStub: sinon.SinonStub;

    beforeEach(() => {
      submitEventRefactoredStub = sandbox.stub();
      validationMidEventStub = sandbox.stub();
      updateAppealService = {
        submitEventRefactored: submitEventRefactoredStub,
        validateMidEvent: validationMidEventStub
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

    it('should render provide-email-join-appeal with correct errors if email is empty', async () => {
      req.body = {
        'email-value': ''
      };
      const expectedValidationError = {
        'email-value': {
          key: 'email-value',
          href: '#email-value',
          text: i18n.validationErrors.emailEmpty
        }
      };
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-join-appeal.njk', {
        nlrEmail: '',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render provide-email-join-appeal with correct errors if email validation fails', async () => {
      req.body = {
        'email-value': 'something that is not an email'
      };
      const expectedValidationError = {
        'email-value': {
          key: 'email-value',
          href: '#email-value',
          text: i18n.validationErrors.emailFormat
        }
      };
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-join-appeal.njk', {
        nlrEmail: 'something that is not an email',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render provide-email-join-appeal with correct error if mid event validation fails', async () => {
      req.body = {
        'email-value': 'test@test.com'
      };
      const expectedValidationError = {
        'email-value': {
          key: 'email-value',
          href: '#email-value',
          text: i18n.pages.inviteNlrToJoinAppeal.userNotExistsError
        }
      };
      validationMidEventStub.resolves(['some mid event error']);
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-join-appeal.njk', {
        nlrEmail: 'test@test.com',
        shouldAdviceShow: true,
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should redirect to inviteToJoinAppealConfirmation if validation, mid event validation and event succeed', async () => {
      req.body = {
        'email-value': 'test@test.com'
      };
      validationMidEventStub.resolves([]);
      submitEventRefactoredStub.resolves({});
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.nlrEmail).to.equal('test@test.com');
      expect(res.redirect).to.be.calledOnceWith(paths.nonLegalRep.inviteToJoinAppealConfirmation);
    });

    it('should catch a validation error and redirect with error', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });

    it('should catch mid event validation error and redirect with error', async () => {
      req.body = {
        'email-value': 'test@test.com'
      };
      const error = new Error('the error');
      validationMidEventStub.throws(error);
      submitEventRefactoredStub.resolves({});
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });

    it('should catch event submission error and redirect with error', async () => {
      req.body = {
        'email-value': 'test@test.com'
      };
      const error = new Error('the error');
      validationMidEventStub.resolves([]);
      submitEventRefactoredStub.throws(error);
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToJoinAppealConfirmation', () => {
    it('should render confirmation-page', () => {
      getInviteToJoinAppealConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToJoinAppeal.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToJoinAppeal.confirmation.whatNextListItems,
        nlrEmail: undefined
      });
    });

    it('should render confirmation-page with nlrEmail', () => {
      req.session = {
        appeal: {
          nlrEmail: 'someEmail'
        } as Appeal
      } as any;
      getInviteToJoinAppealConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToJoinAppeal.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToJoinAppeal.confirmation.whatNextListItems,
        nlrEmail: 'someEmail'
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getInviteToJoinAppealConfirmation(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('setupNonLegalRepresentativeControllers', () => {
    it('should return the correct routers', () => {
      const express = require('express');
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [isJourneyAllowedMiddleware];

      setupNonLegalRepresentativeControllers(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.nonLegalRep.addNonLegalRep, middleware, getAddNonLegalRepresentative)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToCreateAccount, middleware, getInviteToCreateAccount)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.inviteToCreateAccount, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToCreateAccountConfirmation, middleware, getInviteToCreateAccountConfirmation)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToJoinAppeal, middleware, getInviteToJoinAppeal)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.inviteToJoinAppeal, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToJoinAppealConfirmation, middleware, getInviteToJoinAppealConfirmation)).to.equal(true);
    });
  });
});
