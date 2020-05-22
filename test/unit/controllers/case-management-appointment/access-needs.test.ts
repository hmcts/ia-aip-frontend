import { NextFunction, Request, Response } from 'express';
import { getAccessNeeds,getAdditionalLanguage,getHearingLoopPage, getNeedInterpreterPage, getStepFreeAccessPage, postAdditionalLanguage, postHearingLoopPage, postNeedInterpreterPage, postStepFreeAccessPage, setupAccessNeedsController
} from '../../../../app/controllers/case-management-appointment/access-needs';
import { isoLanguages } from '../../../../app/data/isoLanguages';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('case management appointment controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();
  const list = [ { checked: false, text: 'No', value: 'no' }, { checked: false, text: 'Yes', value: 'yes' }];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          cmaRequirements: {
            isInterpreterServicesNeeded: 'yes'
          },
          application: {
            contactDetails: {}
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
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.stepFreeAccess);
      expect(routerPOSTStub).to.have.been.calledWith(paths.awaitingCmaRequirements.stepFreeAccess);
    });
  });

  describe('getAdditionalLanguage', () => {
    it('getAdditionalLanguage should getAdditionalLanguage.njk', () => {
      getAdditionalLanguage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('case-management-appointment/additional-language.njk', {
        items: isoLanguages,
        previousPage: paths.awaitingCmaRequirements.needInterpreter
      });
    });
  });

  describe('getHearingLoop', () => {
    it('getHearingLoop should render get-hearing-loop.njk with no option loaded', () => {
      req.session.appeal.cmaRequirements.isInterpreterServicesNeeded = '';
      getHearingLoopPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('case-management-appointment/hearing-loop.njk', {
        previousPage: paths.awaitingCmaRequirements.stepFreeAccess,
        list
      });
    });

    it('getHearingLoop should render get-hearing-loop.njk', () => {
      const expectedList = [{ checked:  false, text:  'No', value:  'no' }, { checked:  false, text:  'Yes', value:  'yes' }];
      getHearingLoopPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('case-management-appointment/hearing-loop.njk', {
        previousPage: paths.awaitingCmaRequirements.stepFreeAccess,
        list: expectedList
      });
    });
  });

  describe('getNeedInterpreterPage', () => {
    it('getNeedInterpreterPage should render getNeedInterpreterPage', () => {
      const list = [ { checked: false, text: 'No', value: 'no' }, { checked: true, text: 'Yes', value: 'yes' }];
      getNeedInterpreterPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('case-management-appointment/need-interpreter.njk', {
        list: list,
        previousPage: paths.awaitingCmaRequirements.accessNeeds
      });
    });
  });

  describe('getStepFreeAccessPage', () => {
    it('getStepFreeAccessPage should render getStepFreeAccessPage', () => {
      getStepFreeAccessPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('case-management-appointment/step-free-access.njk', {
        list: list,
        previousPage: paths.awaitingCmaRequirements.additionalLanguage
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

        expect(res.render).to.have.been.calledWith('case-management-appointment/step-free-access.njk', {
          errorList: [{ href: '#answer', key: 'answer', text: '\"answer\" is not allowed to be empty' }],
          errors: {  'answer': { href: '#answer', key: 'answer', text: '\"answer\" is not allowed to be empty' } },
          previousPage: paths.awaitingCmaRequirements.additionalLanguage,
          list
        });
      });

      it('should show validation error if no option is selected needsInterperter', async () => {
        req.body.answer = '';
        req.session.appeal.cmaRequirements.isInterpreterServicesNeeded = '';
        await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('case-management-appointment/need-interpreter.njk', {
          errorList: [{ href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' }],
          errors: {  'answer': { href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' } },
          previousPage: paths.awaitingCmaRequirements.accessNeeds,
          list
        });
      });

      it('should show validation error if no option is selected post hearing loop', async () => {
        req.body.answer = '';

        await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(res.render).to.have.been.calledWith('case-management-appointment/hearing-loop.njk', {
          errorList: [{ href: '#answer', key: 'answer', text: '\"answer\" is not allowed to be empty' }],
          errors: { 'answer': { href: '#answer', key: 'answer', text: '\"answer\" is not allowed to be empty' } },
          previousPage: paths.awaitingCmaRequirements.stepFreeAccess,
          list
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

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.accessNeeds);
    });

    it('should show validation error if no option is selected post additional answer', async () => {
      req.body.answer = 'yes';
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.additionalLanguage);
    });

    it('should show validation error if no option is selected post additional answer', async () => {
      req.body.answer = 'no';
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.stepFreeAccess);
    });

    it('should show validation error if no option is selected post additional answer', async () => {
      req.body.answer = 'Test';

      await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.hearingLoop);
    });

    it('should show validation error if no option is selected post additional language', async () => {
      req.body.language = 'Test';

      await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.stepFreeAccess);
    });

    it('getAccessNeeds should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAccessNeeds(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

  });
});
