import { NextFunction, Request, Response } from 'express';
import {
  addMoreLanguagePostAction,
  getAccessNeeds,
  getAdditionalLanguage,
  getHearingLoopPage,
  getNeedInterpreterPage,
  getStepFreeAccessPage,
  postAdditionalLanguage,
  postHearingLoopPage,
  postNeedInterpreterPage,
  postStepFreeAccessPage, removeLanguagePostAction,
  setupAccessNeedsController
} from '../../../../app/controllers/hearing-requirements/access-needs';

import { isoLanguages } from '../../../../app/data/isoLanguages';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Hearing requirements access needs controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();
  const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          hearingRequirements: {
            isInterpreterServicesNeeded: true
          }
        }
      } as Partial<Appeal>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any,
      body: {}
    } as Partial<Request>;

    updateAppealService = { submitEvent: sandbox.stub() };

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupAccessNeedsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupAccessNeedsController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.accessNeeds);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreter);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetails);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetailsRemove);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingStepFreeAccess);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLoop);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreter);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetails);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetailsAdd);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingStepFreeAccess);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLoop);
    });
  });

  describe('getAccessNeeds', () => {
    it('getAccessNeeds should access-needs.njk', () => {
      getAccessNeeds(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/access-needs.njk', {
        previousPage: previousPage
      });
    });
  });

  describe('NeedInterpreterPage', () => {
    it('getNeedInterpreterPage should render getNeedInterpreterPage', () => {
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = null;
      getNeedInterpreterPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: '/hearing-access-needs',
        formAction: '/hearing-interpreter',
        pageTitle: 'Will you or any witnesses need an interpreter at the hearing?',
        saveAndContinue: true,
        question: {
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses need an interpreter at the hearing?',
          hint: 'We will provide an interpreter if you or any witnesses need one.',
          name: 'answer'
        }
      });
    });

    it('postNeedInterpreterPage should show validation error if no option is selected needs Interperter', async () => {
      req.body.answer = '';
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = null;
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
        errorList: [{ href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' }],
        error: {  'answer': { href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' } },
        previousPage: '/hearing-access-needs',
        formAction: '/hearing-interpreter',
        pageTitle: 'Will you or any witnesses need an interpreter at the hearing?',
        question: {
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses need an interpreter at the hearing?',
          hint: 'We will provide an interpreter if you or any witnesses need one.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('should redirect to overview page if save for later and not validation required', async () => {
      req.body.saveForLater = 'saveForLater';
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

  });

  describe('AdditionalLanguage', () => {

    it('getAdditionalLanguage should getAdditionalLanguage.njk', () => {
      getAdditionalLanguage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/language-details.njk', {
        items: isoLanguages,
        previousPage: '/hearing-interpreter',
        summaryList: [{ 'summaryRows': [],'title': 'Languages' }],
        languageAction: '/hearing-language-details'
      });
    });

    it('should redirect to overview page if save for later and not validation required', async () => {
      req.body.language = '';
      req.body.saveForLater = 'saveForLater';
      await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should show validation error if no option is selected post additional language', async () => {
      req.body.language = '';

      await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('hearing-requirements/language-details.njk', {
        items: isoLanguages,
        error: { language: { key: 'language', text: 'Select a language', href: '#language' } },
        errorList: [ { key: 'language', text: 'Select a language', href: '#language' } ],
        previousPage: '/hearing-interpreter',
        summaryList: [{ 'summaryRows': [],'title': 'Languages' }],
        languageAction: '/hearing-language-details'
      });
    });

  });

  describe('Remove additional language', () => {

    it('should remove language from session and redirect', async () => {
      req.query = { name : 'Afar' };
      req.session.appeal.hearingRequirements.interpreterLanguages = [{ language: 'Afar', languageDialect: '' }];
      await removeLanguagePostAction()(req as Request, res as Response, next);
      expect(req.session.appeal.hearingRequirements.interpreterLanguages).to.not.contain({ language: 'Afar', languageDialect: '' });
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetails);
    });

  });

  describe('addMoreLanguagePostAction', () => {

    it('should fail validation and render template with errors', async () => {
      req.session.appeal.hearingRequirements.interpreterLanguages = [];
      await addMoreLanguagePostAction()(req as Request, res as Response, next);

      const expectedArgs = {
        items: isoLanguages,
        error: {
          language: {
            key: 'language',
            text: '"language" is required',
            href: '#language'
          }
        },
        errorList: [
          {
            key: 'language',
            text: '"language" is required',
            href: '#language'
          }
        ],
        previousPage: '/hearing-interpreter',
        summaryList: [ { summaryRows: [], title: 'Languages' } ],
        languageAction: '/hearing-language-details'
      };
      expect(res.render).to.have.been.calledWith('hearing-requirements/language-details.njk', expectedArgs);

    });

    it('should add language in session and redirect to names page', async () => {
      req.body['language'] = 'Afar';
      req.body['dialect'] = 'af';
      req.session.appeal.hearingRequirements.interpreterLanguages = [];
      await addMoreLanguagePostAction()(req as Request, res as Response, next);
      expect(req.session.appeal.hearingRequirements.interpreterLanguages).to.have.lengthOf(1);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetails);
    });

  });

  describe('StepFreeAccessPage', () => {

    it('getStepFreeAccessPage should render getStepFreeAccessPage', () => {
      getStepFreeAccessPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: '/hearing-language-details',
        formAction: '/hearing-step-free-access',
        pageTitle: 'Will you or any witnesses need step-free access?',
        question: {
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses need step-free access?',
          hint: 'We can provide step-free if you or anyone coming with you is in a wheelchair or has other mobility issues.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('postStepFreeAccessPage should show validation error if no option is selected', async () => {
      req.body.answer = '';
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = null;
      await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
        errorList: [{ href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' }],
        error: {  'answer': { href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' } },
        previousPage: previousPage,
        formAction: '/hearing-step-free-access',
        pageTitle: 'Will you or any witnesses need step-free access?',
        question: {
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses need step-free access?',
          hint: 'We can provide step-free if you or anyone coming with you is in a wheelchair or has other mobility issues.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('postStepFreeAccessPage should redirect to overview page if save for later and not validation required', async () => {
      req.body.saveForLater = 'saveForLater';
      await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

  });

  describe('HearingLoop', () => {

    it('getHearingLoop should render get-hearing-loop.njk with no option loaded', () => {
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = null;
      getHearingLoopPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: previousPage,
        formAction: '/hearing-hearing-loop',
        pageTitle: 'Will you or any witnesses need need a hearing loop?',
        question: {
          hint: 'If you or any other witnesses are in a wheelchair or have any other mobility issues, we will provide step-free access at the hearing.',
          name: 'answer',
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses need need a hearing loop?'
        },
        saveAndContinue: true
      });
    });

    it('postHearingLoopPage should show validation error if no option is selected', async () => {
      req.body.answer = '';
      req.session.appeal.hearingRequirements.isHearingLoopNeeded = null;
      await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
        errorList: [{ href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' }],
        error: {  'answer': { href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' } },
        previousPage: previousPage,
        formAction: '/hearing-hearing-loop',
        pageTitle: 'Will you or any witnesses need need a hearing loop?',
        question: {
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses need need a hearing loop?',
          hint: 'If you or any other witnesses are in a wheelchair or have any other mobility issues, we will provide step-free access at the hearing.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('should redirect to overview page if save for later and not validation required', async () => {
      req.body.answer = '';
      req.body.saveForLater = 'saveForLater';
      await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

  });

  describe('exception scenarios for controllers', () => {

    it('getAccessNeeds should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAccessNeeds(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getStepFreeAccessPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getStepFreeAccessPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getNeedInterpreterPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getNeedInterpreterPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getAdditionalLanguage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAdditionalLanguage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('postStepFreeAccessPage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('postNeedInterpreterPage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('postHearingLoopPage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('postAdditionalLanguage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getHearingLoopPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getHearingLoopPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
