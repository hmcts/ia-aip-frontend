import { NextFunction, Request, Response } from 'express';
import { getAccessNeeds,getAdditionalLanguage,getHearingLoopPage, getNeedInterpreterPage, getStepFreeAccessPage, postAdditionalLanguage, postHearingLoopPage, postNeedInterpreterPage, postStepFreeAccessPage, setupAccessNeedsController } from '../../../../../app/controllers/cma-requirements/access-needs/access-needs';
import { Events } from '../../../../../app/data/events';
import { isoLanguages } from '../../../../../app/data/isoLanguages';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import Logger from '../../../../../app/utils/logger';
import { expect, sinon } from '../../../../utils/testUtils';

const express = require('express');

describe('case management appointment controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          cmaRequirements: {
            accessNeeds: {
              isInterpreterServicesNeeded: true
            }
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

  describe('setupContactDetailsController', () => {
    it('should setup the routes', () => {
      const middleware = [];

      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupAccessNeedsController(middleware,updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.accessNeedsStepFreeAccess);
      expect(routerPOSTStub).to.have.been.calledWith(paths.awaitingCmaRequirements.accessNeedsStepFreeAccess);
    });
  });

  describe('getAdditionalLanguage', () => {
    it('getAdditionalLanguage should getAdditionalLanguage.njk', () => {
      getAdditionalLanguage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('case-management-appointment/additional-language.njk', {
        items: isoLanguages,
        previousPage: paths.awaitingCmaRequirements.accessNeedsInterpreter
      });
    });
  });

  describe('getHearingLoop', () => {
    it('getHearingLoop should render get-hearing-loop.njk with no option loaded', () => {
      req.session.appeal.cmaRequirements.accessNeeds.isInterpreterServicesNeeded = null;
      getHearingLoopPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: paths.awaitingCmaRequirements.accessNeedsStepFreeAccess,
        formAction: '/appointment-hearing-loop',
        pageTitle: 'Will you or anyone coming with you need a hearing loop?',
        question: {
          hint: 'A hearing loop is a sound system designed to help people who use hearing aids.',
          name: 'answer',
          options: [{ checked: false, text: 'Yes', value: 'yes' }, { checked: false, text: 'No', value: 'no' }],
          title: 'Will you or anyone coming with you need a hearing loop?'
        },
        saveAndContinue: true
      });
    });

    it('getHearingLoop should render get-hearing-loop.njk', () => {
      getHearingLoopPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: paths.awaitingCmaRequirements.accessNeedsStepFreeAccess,
        formAction: '/appointment-hearing-loop',
        pageTitle: 'Will you or anyone coming with you need a hearing loop?',
        question: {
          hint: 'A hearing loop is a sound system designed to help people who use hearing aids.',
          name: 'answer',
          options: [{ checked: false, text: 'Yes', value: 'yes' }, { checked: false, text: 'No', value: 'no' }],
          title: 'Will you or anyone coming with you need a hearing loop?'
        },
        saveAndContinue: true
      });
    });
  });

  describe('getNeedInterpreterPage', () => {
    it('getNeedInterpreterPage should render getNeedInterpreterPage', () => {
      getNeedInterpreterPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        formAction: '/appointment-interpreter',
        pageTitle: 'Will you or anyone coming with you need an interpreter?',
        previousPage: '/appointment-access-needs',
        question: {
          options: [{ checked: true, text: 'Yes', value: 'yes' }, { checked: false, text: 'No', value: 'no' }],
          title: 'Will you need an interpreter?'
        },
        saveAndContinue: true
      });
    });
  });

  describe('getStepFreeAccessPage', () => {
    it('getStepFreeAccessPage should render getStepFreeAccessPage', () => {
      getStepFreeAccessPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        formAction: '/appointment-step-free-access',
        previousPage: paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage,
        pageTitle: 'Will you or anyone coming with you need step-free access?',
        question: {
          hint: 'We can provide step-free if you or anyone coming with you is in a wheelchair or has other mobility issues.',
          name: 'answer',
          options: [{ checked: false, text: 'Yes', value: 'yes' }, { checked: false, text: 'No', value: 'no' }],
          title: 'Will you or anyone coming with you need step-free access?'
        },
        saveAndContinue: true
      });
    });
  });

  describe('getAccessNeeds', () => {
    it('getAccessNeeds should render get access needs.njk', () => {
      getAccessNeeds(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('case-management-appointment/access-needs-page.njk', {
        previousPage: paths.common.overview
      });
    });
  });

  describe('postStepFreeAccess', () => {
    describe('validates selections', () => {
      it('should show validation error if no option is selected', async () => {
        req.body.answer = '';

        await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
          errorList: [{ href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' }],
          errors: { answer: { href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' } },
          previousPage: paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage,
          formAction: '/appointment-step-free-access',
          pageTitle: 'Will you or anyone coming with you need step-free access?',
          question: {
            hint: 'We can provide step-free if you or anyone coming with you is in a wheelchair or has other mobility issues.',
            name: 'answer',
            options: [{ checked: false, text: 'Yes', value: 'yes' }, { checked: false, text: 'No', value: 'no' }],
            title: 'Will you or anyone coming with you need step-free access?'
          },
          saveAndContinue: true
        });

      });

      it('should show validation error if no option is selected needsInterperter', async () => {
        req.body.answer = '';
        req.session.appeal.cmaRequirements.accessNeeds.isInterpreterServicesNeeded = null;
        await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
          errorList: [{ href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' }],
          errors: {  'answer': { href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' } },
          formAction: '/appointment-interpreter',
          pageTitle: 'Will you or anyone coming with you need an interpreter?',
          previousPage: paths.awaitingCmaRequirements.accessNeeds,
          question: {
            name: 'answer',
            options: [{ checked: false, text: 'Yes', value: 'yes' }, { checked: false, text: 'No', value: 'no' }],
            title: 'Will you need an interpreter?'
          },
          saveAndContinue: true
        });
      });

      it('should show validation error if no option is selected post hearing loop', async () => {
        req.body.answer = '';

        await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
          errorList: [{ href: '#answer', key: 'answer', text: '\"answer\" is not allowed to be empty' }],
          errors: { 'answer': { href: '#answer', key: 'answer', text: '\"answer\" is not allowed to be empty' } },
          previousPage: paths.awaitingCmaRequirements.accessNeedsStepFreeAccess,
          formAction: '/appointment-hearing-loop',
          pageTitle: 'Will you or anyone coming with you need a hearing loop?',
          question: {
            hint: 'A hearing loop is a sound system designed to help people who use hearing aids.',
            name: 'answer',
            options: [{ checked: false, text: 'Yes', value: 'yes' }, { checked: false, text: 'No', value: 'no' }],
            title: 'Will you or anyone coming with you need a hearing loop?'
          },
          saveAndContinue: true
        });
      });

      it('should show validation error if no option is selected post additional language', async () => {
        req.body.language = '';

        await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(res.render).to.have.been.calledWith('case-management-appointment/additional-language.njk', {
          errorList: [{ href: '#language', key: 'language', text: 'Select a language' }],
          errors: {  'language': { href: '#language', key: 'language', text: 'Select a language' } },
          previousPage: paths.appealStarted.taskList,
          items: isoLanguages
        });
      });
    });
  });

  describe('posts with redirect', () => {
    it('should show validation error if no option is selected post additional language', async () => {
      req.body.answer = 'no';

      await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.taskList);
    });

    it('should show validation error if no option is selected post additional answer', async () => {
      req.body.answer = 'yes';
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage);
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);

    });

    it('should show validation error if no option is selected post additional answer', async () => {
      req.body.answer = 'no';
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.accessNeedsStepFreeAccess);
    });

    it('should show validation error if no option is selected post additional answer', async () => {
      req.body.answer = 'Test';

      await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.accessNeedsHearingLoop);
    });

    it('should show validation error if no option is selected post additional language', async () => {
      req.body.language = 'Test';

      await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.accessNeedsStepFreeAccess);
    });

    it('getAccessNeeds should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAccessNeeds(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

  });
});
