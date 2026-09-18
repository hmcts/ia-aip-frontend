import { Request, Response } from 'express';
import {
  getRemoveNonLegalRepresentative,
  getRemoveNonLegalRepresentativeConfirmation,
  postRemoveNonLegalRepresentative,
  setupRemoveNonLegalRepresentativeControllers
} from '../../../../app/controllers/non-legal-representative/remove-non-legal-representative';
import { Events } from '../../../../app/data/events';
import { isJourneyAllowedMiddleware } from '../../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Remove non-legal representative controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let submitEventRefactoredStub: sinon.SinonStub;
  let validateMidEventStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  const error = new Error('some error');
  let throwStub: sinon.SinonStub;
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
          nlrDetails: {},
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
    throwStub = sandbox.stub().throws(error);
    submitEventRefactoredStub = sandbox.stub();
    validateMidEventStub = sandbox.stub();
    updateAppealService = {
      submitEventRefactored: submitEventRefactoredStub,
      mapToCCDCaseNlrDetails: sandbox.stub(),
      validateMidEvent: validateMidEventStub
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

  afterEach(() => {
    sandbox.restore();
  });

  describe('getRemoveNonLegalRepresentative', () => {
    it('should render remove-non-legal-representative for appellant', () => {
      getRemoveNonLegalRepresentative(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/remove-non-legal-representative.njk', {
        title: i18n.pages.removeNonLegalRepresentative.title,
        paragraphOne: i18n.pages.removeNonLegalRepresentative.paragraphOne,
        paragraphTwo: i18n.pages.removeNonLegalRepresentative.paragraphTwo,
        agreement: i18n.pages.removeNonLegalRepresentative.agreement
      });
    });

    it('should render add-non-legal-representative for NLR', () => {
      req.session.isNonLegalRep = true;
      getRemoveNonLegalRepresentative(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/remove-non-legal-representative.njk', {
        title: i18n.pages.removeNonLegalRepresentative.titlePersonal,
        paragraphOne: i18n.pages.removeNonLegalRepresentative.paragraphOnePersonal,
        paragraphTwo: null,
        agreement: i18n.pages.removeNonLegalRepresentative.agreementPersonal
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getRemoveNonLegalRepresentative(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });


  describe('postRemoveNonLegalRepresentative', () => {
    it('should fail validation for appellant if statement not checked', async () => {
      await postRemoveNonLegalRepresentative(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      const expectedError = {
        statement: {
          key: 'statement',
          href: '#statement',
          text: i18n.validationErrors.removeNlrAgreement
        }
      };
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/remove-non-legal-representative.njk', {
        title: i18n.pages.removeNonLegalRepresentative.title,
        paragraphOne: i18n.pages.removeNonLegalRepresentative.paragraphOne,
        paragraphTwo: i18n.pages.removeNonLegalRepresentative.paragraphTwo,
        agreement: i18n.pages.removeNonLegalRepresentative.agreement,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should submit event and redirect for appellant if validation succeeds', async () => {
      req.body = { statement: 'acceptance' };
      req.session.refreshCasesList = false;
      await postRemoveNonLegalRepresentative(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(false);
      expect(submitEventRefactoredStub).to.be.calledWith(Events.REMOVE_NON_LEGAL_REP, req.session.appeal, 'idamUID', 'atoken');
      expect(redirectStub).to.be.calledWith(paths.nonLegalRep.removeNonLegalRepConfirmation);
      expect(req.session.refreshCasesList).to.equal(true);
    });

    it('should fail validation for NLR if statement not checked', async () => {
      req.session.isNonLegalRep = true;
      await postRemoveNonLegalRepresentative(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      const expectedError = {
        statement: {
          key: 'statement',
          href: '#statement',
          text: i18n.validationErrors.removeNlrSelfAgreement
        }
      };
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/remove-non-legal-representative.njk', {
        title: i18n.pages.removeNonLegalRepresentative.titlePersonal,
        paragraphOne: i18n.pages.removeNonLegalRepresentative.paragraphOnePersonal,
        paragraphTwo: null,
        agreement: i18n.pages.removeNonLegalRepresentative.agreementPersonal,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should submit event and redirect for NLR if validation succeeds', async () => {
      req.body = { statement: 'acceptance' };
      req.session.isNonLegalRep = true;
      req.session.refreshCasesList = false;
      await postRemoveNonLegalRepresentative(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(false);
      expect(submitEventRefactoredStub).to.be.calledWith(Events.REMOVE_NON_LEGAL_REP_SELF, req.session.appeal, 'idamUID', 'atoken');
      expect(redirectStub).to.be.calledWith(paths.nonLegalRep.removeNonLegalRepConfirmation);
      expect(req.session.refreshCasesList).to.equal(true);
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getRemoveNonLegalRepresentative(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getRemoveNonLegalRepresentativeConfirmation', () => {
    it('should render confirmation-page for appellant', () => {
      req.session.isNonLegalRep = false;
      getRemoveNonLegalRepresentativeConfirmation(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/confirmation-page.njk', {
        title: i18n.pages.removeNonLegalRepresentative.confirmation.title,
        whatNextListItems:  i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItems,
        backToCasesList: false
      });
    });

    it('should render confirmation-page for NLR', () => {
      req.session.isNonLegalRep = true;
      getRemoveNonLegalRepresentativeConfirmation(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/confirmation-page.njk', {
        title: i18n.pages.removeNonLegalRepresentative.confirmation.titlePersonal,
        whatNextListItems:  i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItemsPersonal,
        backToCasesList: true
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getRemoveNonLegalRepresentativeConfirmation(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('setupRemoveNonLegalRepresentativeControllers', () => {
    it('should return the correct routers', () => {
      const express = require('express');
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [isJourneyAllowedMiddleware];

      setupRemoveNonLegalRepresentativeControllers(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.nonLegalRep.removeNonLegalRep, middleware, getRemoveNonLegalRepresentative)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.removeNonLegalRep, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.removeNonLegalRepConfirmation, middleware, getRemoveNonLegalRepresentativeConfirmation)).to.equal(true);
    });
  });
});
