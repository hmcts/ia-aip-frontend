import { Request, Response } from 'express';
import { SinonStub } from 'sinon';
import {
  getIsNlrInterpreterRequiredPage,
  getNlrAttending,
  getNlrHearingInterpreterSignLanguageSelection,
  getNlrHearingInterpreterSpokenLanguageSelection,
  getNlrInterpreterTypePage,
  getNlrNeedHearingLoop,
  getNlrNeeds,
  getNlrNeedStepFreeAccess,
  getNlrOutsideUK,
  postIsNlrInterpreterRequiredPage,
  postNlrAttending,
  postNlrHearingInterpreterSignLanguageSelection,
  postNlrHearingInterpreterSpokenLanguageSelection,
  postNlrInterpreterTypePage,
  postNlrNeedHearingLoop,
  postNlrNeedStepFreeAccess,
  postNlrOutsideUK,
  setupHearingNonLegalRepNeedsController,
} from '../../../../app/controllers/hearing-requirements/non-legal-rep';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import RefDataService from '../../../../app/service/ref-data-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import * as HearingUtils from '../../../../app/utils/hearing-requirements-utils';
import Logger from '../../../../app/utils/logger';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Hearing requirements non legal rep controller', () => {
  let sandbox: sinon.SinonSandbox;
  let refDataServiceObj: Partial<RefDataService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let expectedAppeal: Appeal;
  let next: SinonStub;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonSpy;
  let submitStub: sinon.SinonStub;
  let nlrRadioRenderStub: sinon.SinonStub;
  const authToken = 'some-auth-token';
  const userId = 'some-user-uuid';
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    submitStub = sandbox.stub();
    nlrRadioRenderStub = sandbox.stub(HearingUtils, 'nlrRadioRender');
    req = {
      session: {
        appeal: {
          hearingRequirements: {}
        }
      } as Partial<Appeal>,
      cookies: { '__auth-token': authToken },
      idam: {
        userDetails: {
          uid: userId
        }
      },
      app: {
        locals: {
          logger
        }
      } as any,
      body: {}
    } as Partial<Request>;

    updateAppealService = { submitEventRefactored: submitStub };
    renderStub = sandbox.stub();
    redirectStub = sandbox.spy();
    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;
    expectedAppeal = req.session.appeal;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHearingAccessNeedsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingNonLegalRepNeedsController(middleware, updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.nlrAttending, middleware, getNlrAttending);
      expect(routerPostStub).to.be.calledWith(paths.submitHearingRequirements.nlrAttending, middleware, sinon.match.func);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.nlrOutsideUK, middleware, getNlrOutsideUK);
      expect(routerPostStub).to.be.calledWith(paths.submitHearingRequirements.nlrOutsideUK, middleware, sinon.match.func);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeeds, middleware, getNlrNeeds);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.isNlrInterpreterRequired, middleware, getIsNlrInterpreterRequiredPage);
      expect(routerPostStub).to.be.calledWith(paths.submitHearingRequirements.isNlrInterpreterRequired, middleware, sinon.match.func);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterTypes, middleware, getNlrInterpreterTypePage);
      expect(routerPostStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterTypes, middleware, sinon.match.func);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection, middleware, sinon.match.func);
      expect(routerPostStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection, middleware, sinon.match.func);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection, middleware, sinon.match.func);
      expect(routerPostStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection, middleware, sinon.match.func);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeedsStepFreeAccess, middleware, getNlrNeedStepFreeAccess);
      expect(routerPostStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeedsStepFreeAccess, middleware, sinon.match.func);
      expect(routerGetStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeedsHearingLoop, middleware, getNlrNeedHearingLoop);
      expect(routerPostStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeedsHearingLoop, middleware, sinon.match.func);
    });
  });

  describe('getNlrAttending', () => {
    it('getNlrAttending should nlrRadioRender correctly', () => {
      getNlrAttending(req as Request, res as Response, next);
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'nlrAttending', paths.submitHearingRequirements.taskList);
    });

    it('getNlrAttending should catch an exception and call next()', () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      getNlrAttending(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postNlrAttending', () => {
    it('postNlrAttending should nlrRadioRender nlrAttending if failed validation', async () => {
      await postNlrAttending(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const expectedValidation = {
        answer: {
          key: 'answer',
          text: i18n.validationErrors.hearingRequirements.nlrNeedsSection.nlrAttendingRequired,
          href: '#answer'
        }
      };
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'nlrAttending', paths.submitHearingRequirements.taskList, expectedValidation);
    });

    it('postNlrAttending should submit update and redirect to taskList if Yes', async () => {
      req.body.answer = 'Yes';
      expectedAppeal.hearingRequirements.nlrAttending = 'Yes';
      await postNlrAttending(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.taskList);
    });

    it('postNlrAttending should submit update and redirect to nlrOutsideUK if No', async () => {
      req.body.answer = 'No';
      expectedAppeal.hearingRequirements.nlrAttending = 'No';
      await postNlrAttending(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrOutsideUK);
    });

    it('postNlrAttending should catch an exception and call next()', async () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      await postNlrAttending(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNlrOutsideUK', () => {
    it('getNlrOutsideUK should nlrRadioRender correctly', () => {
      getNlrOutsideUK(req as Request, res as Response, next);
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'nlrOutsideUK', paths.submitHearingRequirements.nlrAttending);
    });

    it('getNlrOutsideUK should catch an exception and call next()', () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      getNlrOutsideUK(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postNlrOutsideUK', () => {
    it('postNlrOutsideUK should nlrRadioRender nlrOutsideUK if failed validation', async () => {
      await postNlrOutsideUK(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const expectedValidation = {
        answer: {
          key: 'answer',
          text: i18n.validationErrors.hearingRequirements.nlrNeedsSection.nlrOutsideUKRequired,
          href: '#answer'
        }
      };
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'nlrOutsideUK', paths.submitHearingRequirements.nlrAttending, expectedValidation);
    });

    it('postNlrOutsideUK should submit update and redirect to taskList', async () => {
      req.body.answer = 'something';
      expectedAppeal.hearingRequirements.nlrOutsideUK = 'something';
      await postNlrOutsideUK(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.taskList);
    });

    it('postNlrAttending should catch an exception and call next()', async () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      await postNlrOutsideUK(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNlrNeeds', () => {
    it('getNlrNeeds should nlrRadioRender correctly', () => {
      getNlrNeeds(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/nlr-needs.njk', {
        previousPage: paths.submitHearingRequirements.taskList
      });
    });

    it('getNlrNeeds should catch an exception and call next()', () => {
      const error = new Error('the error');
      renderStub.throws(error);
      getNlrNeeds(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getIsNlrInterpreterRequiredPage', () => {
    it('getIsNlrInterpreterRequiredPage should nlrRadioRender correctly', () => {
      getIsNlrInterpreterRequiredPage(req as Request, res as Response, next);
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'isNlrInterpreterRequired', paths.submitHearingRequirements.nlrNeeds);
    });

    it('getIsNlrInterpreterRequiredPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      getIsNlrInterpreterRequiredPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postIsNlrInterpreterRequiredPage', () => {
    it('postIsNlrInterpreterRequiredPage should nlrRadioRender isNlrInterpreterRequired if failed validation', async () => {
      await postIsNlrInterpreterRequiredPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const expectedValidation = {
        answer: {
          key: 'answer',
          text: i18n.validationErrors.hearingRequirements.nlrNeedsSection.isNlrInterpreterRequiredRequired,
          href: '#answer'
        }
      };
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'isNlrInterpreterRequired', paths.submitHearingRequirements.nlrNeeds, expectedValidation);
    });

    it('postIsNlrInterpreterRequiredPage should submit update and redirect to nlrHearingInterpreterTypes if Yes', async () => {
      req.body.answer = 'Yes';
      expectedAppeal.hearingRequirements.isNlrInterpreterRequired = 'Yes';
      await postIsNlrInterpreterRequiredPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterTypes);
    });

    it('postIsNlrInterpreterRequiredPage should submit update and redirect to nlrNeedsHearingLoop if No', async () => {
      req.body.answer = 'No';
      expectedAppeal.hearingRequirements.isNlrInterpreterRequired = 'No';
      await postIsNlrInterpreterRequiredPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeedsHearingLoop);
    });

    it('postIsNlrInterpreterRequiredPage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      await postIsNlrInterpreterRequiredPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNlrInterpreterTypePage', () => {
    it('getNlrInterpreterTypePage should render interpreter-types.njk with empty nlrInterpreterLanguageCategory', () => {
      getNlrInterpreterTypePage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: paths.submitHearingRequirements.isNlrInterpreterRequired,
        formAction: paths.submitHearingRequirements.nlrHearingInterpreterTypes,
        pageQuestion: i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title,
        checkboxHintText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint,
        interpreterSpokenLanguage: false,
        interpreterSignLanguage: false
      });
    });

    it('getNlrInterpreterTypePage should render interpreter-types.njk with non-empty nlrInterpreterLanguageCategory none included', () => {
      req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['something'];
      getNlrInterpreterTypePage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: paths.submitHearingRequirements.isNlrInterpreterRequired,
        formAction: paths.submitHearingRequirements.nlrHearingInterpreterTypes,
        pageQuestion: i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title,
        checkboxHintText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint,
        interpreterSpokenLanguage: false,
        interpreterSignLanguage: false
      });
    });

    it('getNlrInterpreterTypePage should render interpreter-types.njk with non-empty nlrInterpreterLanguageCategory both included', () => {
      req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      getNlrInterpreterTypePage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: paths.submitHearingRequirements.isNlrInterpreterRequired,
        formAction: paths.submitHearingRequirements.nlrHearingInterpreterTypes,
        pageQuestion: i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title,
        checkboxHintText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint,
        interpreterSpokenLanguage: true,
        interpreterSignLanguage: true
      });
    });

    it('getNlrInterpreterTypePage should catch an exception and call next()', () => {
      const error = new Error('the error');
      renderStub.throws(error);
      getNlrInterpreterTypePage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postNlrInterpreterTypePage', () => {
    const errorList = [
      {
        key: 'selections',
        text: 'You must select at least one kind of interpreter',
        href: '#selections'
      }
    ];

    it('postNlrInterpreterTypePage should getConditionalRedirectUrl if shouldValidateWhenSaveForLater false', async () => {
      req.body.saveForLater = true;
      req.body.selections = '';
      await postNlrInterpreterTypePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub).to.be.calledWith('/appeal-overview?saved');
    });

    it('postNlrInterpreterTypePage should render interpreter-types.njk with empty nlrInterpreterLanguageCategory when validation fails', async () => {
      await postNlrInterpreterTypePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: paths.submitHearingRequirements.isNlrInterpreterRequired,
        formAction: paths.submitHearingRequirements.nlrHearingInterpreterTypes,
        pageQuestion: i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title,
        checkboxHintText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint,
        interpreterSpokenLanguage: false,
        interpreterSignLanguage: false,
        errorList
      });
    });

    it('postNlrInterpreterTypePage should render interpreter-types.njk with non-empty nlrInterpreterLanguageCategory none included when validation fails', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['something'];
      await postNlrInterpreterTypePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: paths.submitHearingRequirements.isNlrInterpreterRequired,
        formAction: paths.submitHearingRequirements.nlrHearingInterpreterTypes,
        pageQuestion: i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title,
        checkboxHintText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint,
        interpreterSpokenLanguage: false,
        interpreterSignLanguage: false,
        errorList
      });
    });

    it('postNlrInterpreterTypePage should render interpreter-types.njk with non-empty nlrInterpreterLanguageCategory both included when validation fails', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      await postNlrInterpreterTypePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: paths.submitHearingRequirements.isNlrInterpreterRequired,
        formAction: paths.submitHearingRequirements.nlrHearingInterpreterTypes,
        pageQuestion: i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title,
        checkboxHintText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint,
        interpreterSpokenLanguage: true,
        interpreterSignLanguage: true,
        errorList
      });
    });

    it('postNlrInterpreterTypePage should submit update and redirect to nlrHearingInterpreterSpokenLanguageSelection if selection contains spokenLanguageInterpreterString', async () => {
      req.body.selections = 'spokenLanguageInterpreter,signLanguageInterpreter';
      expectedAppeal.hearingRequirements.nlrInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      await postNlrInterpreterTypePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection);
    });

    it('postNlrInterpreterTypePage should submit update and redirect to nlrHearingInterpreterSignLanguageSelection if selection does not contain spokenLanguageInterpreterString', async () => {
      req.body.selections = 'signLanguageInterpreter';
      expectedAppeal.hearingRequirements.nlrInterpreterLanguageCategory = ['signLanguageInterpreter'];
      await postNlrInterpreterTypePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection);
    });

    it('postIsNlrInterpreterRequiredPage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      await postIsNlrInterpreterRequiredPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNlrHearingInterpreterSpokenLanguageSelection', () => {
    it('getNlrHearingInterpreterSpokenLanguageSelection should render with languageRefData if nlrInterpreterSpokenLanguage.languageRefData', async () => {
      const nlrInterpreterSpokenLanguage = {
        languageRefData: 'someObject' as any
      };
      req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = nlrInterpreterSpokenLanguage;
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType');
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await getNlrHearingInterpreterSpokenLanguageSelection(refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(false);
      expect(getRenderObjectStub).to.be.calledWith(nlrInterpreterSpokenLanguage, 'someObject', true, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('getNlrHearingInterpreterSpokenLanguageSelection should render with DL if no nlrInterpreterSpokenLanguage.languageRefData', async () => {
      const nlrInterpreterSpokenLanguage = {};
      req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = nlrInterpreterSpokenLanguage;
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('someObject' as any);
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await getNlrHearingInterpreterSpokenLanguageSelection(refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(getRenderObjectStub).to.be.calledWith(nlrInterpreterSpokenLanguage, 'someObject', true, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('getNlrHearingInterpreterSpokenLanguageSelection should render with DL if no nlrInterpreterSpokenLanguage', async () => {
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('someObject' as any);
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await getNlrHearingInterpreterSpokenLanguageSelection(refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(getRenderObjectStub).to.be.calledWith(undefined, 'someObject', true, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('getNlrHearingInterpreterSpokenLanguageSelection should catch an exception and call next()', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = {
        languageRefData: 'someObject' as any
      };
      const error = new Error('the error');
      renderStub.throws(error);
      await getNlrHearingInterpreterSpokenLanguageSelection(refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postNlrHearingInterpreterSpokenLanguageSelection', () => {
    it('postNlrHearingInterpreterSpokenLanguageSelection should getConditionalRedirectUrl if shouldValidateWhenSaveForLater false', async () => {
      req.body.saveForLater = true;
      req.body.languageRefData = '';
      await postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(redirectStub).to.be.calledWith('/appeal-overview?saved');
    });

    it('postNlrHearingInterpreterSpokenLanguageSelection should render with languageRefData if nlrInterpreterSpokenLanguage.languageRefData if validation fails', async () => {
      const nlrInterpreterSpokenLanguage = {
        languageRefData: 'someObject' as any
      };
      req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = nlrInterpreterSpokenLanguage;
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType');
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(false);
      expect(getRenderObjectStub).to.be.calledWith(nlrInterpreterSpokenLanguage, 'someObject', true, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('postNlrHearingInterpreterSpokenLanguageSelection should render with DL if no nlrInterpreterSpokenLanguage.languageRefData if validation fails', async () => {
      const nlrInterpreterSpokenLanguage = {};
      req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = nlrInterpreterSpokenLanguage;
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('someObject' as any);
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(getRenderObjectStub).to.be.calledWith(nlrInterpreterSpokenLanguage, 'someObject', true, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('postNlrHearingInterpreterSpokenLanguageSelection should render with DL if no nlrInterpreterSpokenLanguage if validation fails', async () => {
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('someObject' as any);
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(getRenderObjectStub).to.be.calledWith(undefined, 'someObject', true, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('postNlrHearingInterpreterSpokenLanguageSelection should submit update and redirect to nlrHearingInterpreterSignLanguageSelection if signLanguageInterpreterString', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.body.languageRefData = 'someLanguage';
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('dlObject' as any);
      const preparePostInterpreterLanguageSubmissionObjStub = sandbox.stub(HearingUtils, 'preparePostInterpreterLanguageSubmissionObj')
        .returns('submissionObject' as any);
      expectedAppeal.hearingRequirements.nlrInterpreterSpokenLanguage = 'submissionObject' as any;
      await postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(preparePostInterpreterLanguageSubmissionObjStub).to.be.calledWith(req, 'dlObject');
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection);
    });

    it('postNlrHearingInterpreterSpokenLanguageSelection should submit update and redirect to nlrNeedsStepFreeAccess if no signLanguageInterpreterString', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['spokenLanguageInterpreter'];
      req.body.languageRefData = 'someLanguage';
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('dlObject' as any);
      const preparePostInterpreterLanguageSubmissionObjStub = sandbox.stub(HearingUtils, 'preparePostInterpreterLanguageSubmissionObj')
        .returns('submissionObject' as any);
      expectedAppeal.hearingRequirements.nlrInterpreterSpokenLanguage = 'submissionObject' as any;
      await postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(preparePostInterpreterLanguageSubmissionObjStub).to.be.calledWith(req, 'dlObject');
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeedsStepFreeAccess);
    });

    it('postNlrHearingInterpreterSpokenLanguageSelection should catch an exception and call next()', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = {
        languageRefData: 'someObject' as any
      };
      const error = new Error('the error');
      renderStub.throws(error);
      await postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNlrHearingInterpreterSignLanguageSelection', () => {
    it('getNlrHearingInterpreterSignLanguageSelection should render with languageRefData if nlrInterpreterSignLanguage.languageRefData', async () => {
      const nlrInterpreterSignLanguage = {
        languageRefData: 'someObject' as any
      };
      req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = nlrInterpreterSignLanguage;
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType');
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await getNlrHearingInterpreterSignLanguageSelection(refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(false);
      expect(getRenderObjectStub).to.be.calledWith(nlrInterpreterSignLanguage, 'someObject', false, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('getNlrHearingInterpreterSignLanguageSelection should render with DL if no nlrInterpreterSignLanguage.languageRefData', async () => {
      const nlrInterpreterSignLanguage = {};
      req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = nlrInterpreterSignLanguage;
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('someObject' as any);
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await getNlrHearingInterpreterSignLanguageSelection(refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(getRenderObjectStub).to.be.calledWith(nlrInterpreterSignLanguage, 'someObject', false, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('getNlrHearingInterpreterSignLanguageSelection should render with DL if no nlrInterpreterSignLanguage', async () => {
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('someObject' as any);
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await getNlrHearingInterpreterSignLanguageSelection(refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(getRenderObjectStub).to.be.calledWith(undefined, 'someObject', false, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('getNlrHearingInterpreterSignLanguageSelection should catch an exception and call next()', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = {
        languageRefData: 'someObject' as any
      };
      const error = new Error('the error');
      renderStub.throws(error);
      await getNlrHearingInterpreterSignLanguageSelection(refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postNlrHearingInterpreterSignLanguageSelection', () => {
    it('postNlrHearingInterpreterSignLanguageSelection should getConditionalRedirectUrl if shouldValidateWhenSaveForLater false', async () => {
      req.body.saveForLater = true;
      req.body.languageRefData = '';
      await postNlrHearingInterpreterSignLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(redirectStub).to.be.calledWith('/appeal-overview?saved');
    });

    it('postNlrHearingInterpreterSignLanguageSelection should render with languageRefData if nlrInterpreterSignLanguage.languageRefData if validation fails', async () => {
      const nlrInterpreterSignLanguage = {
        languageRefData: 'someObject' as any
      };
      req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = nlrInterpreterSignLanguage;
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType');
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await postNlrHearingInterpreterSignLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(false);
      expect(getRenderObjectStub).to.be.calledWith(nlrInterpreterSignLanguage, 'someObject', false, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('postNlrHearingInterpreterSignLanguageSelection should render with DL if no nlrInterpreterSignLanguage.languageRefData if validation fails', async () => {
      const nlrInterpreterSignLanguage = {};
      req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = nlrInterpreterSignLanguage;
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('someObject' as any);
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await postNlrHearingInterpreterSignLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(getRenderObjectStub).to.be.calledWith(nlrInterpreterSignLanguage, 'someObject', false, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('postNlrHearingInterpreterSignLanguageSelection should render with DL if no nlrInterpreterSignLanguage if validation fails', async () => {
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('someObject' as any);
      const getRenderObjectStub = sandbox.stub(HearingUtils, 'getInterpreterRenderObject').returns('renderObject' as any);
      await postNlrHearingInterpreterSignLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(getRenderObjectStub).to.be.calledWith(undefined, 'someObject', false, paths.submitHearingRequirements.nlrHearingInterpreterTypes);
      expect(renderStub).to.be.calledWith('hearing-requirements/interpreter-language-selection.njk', 'renderObject');
    });

    it('postNlrHearingInterpreterSignLanguageSelection should submit update and redirect to nlrNeedsStepFreeAccess', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['spokenLanguageInterpreter'];
      req.body.languageRefData = 'someLanguage';
      const retrieveInterpreterDlStub = sandbox.stub(HearingUtils, 'retrieveInterpreterDynamicListByDataType').returns('dlObject' as any);
      const preparePostInterpreterLanguageSubmissionObjStub = sandbox.stub(HearingUtils, 'preparePostInterpreterLanguageSubmissionObj')
        .returns('submissionObject' as any);
      expectedAppeal.hearingRequirements.nlrInterpreterSignLanguage = 'submissionObject' as any;
      await postNlrHearingInterpreterSignLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(retrieveInterpreterDlStub.called).to.equal(true);
      expect(preparePostInterpreterLanguageSubmissionObjStub).to.be.calledWith(req, 'dlObject');
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeedsStepFreeAccess);
    });

    it('postNlrHearingInterpreterSignLanguageSelection should catch an exception and call next()', async () => {
      req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = {
        languageRefData: 'someObject' as any
      };
      const error = new Error('the error');
      renderStub.throws(error);
      await postNlrHearingInterpreterSignLanguageSelection(updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNlrNeedStepFreeAccess', () => {
    it('getNlrNeedStepFreeAccess should nlrRadioRender correctly', () => {
      const previousPageStub = sandbox.stub(HearingUtils, 'getStepFreeAccessPreviousPage').returns('somePreviousPage');
      getNlrNeedStepFreeAccess(req as Request, res as Response, next);
      expect(previousPageStub).to.be.calledWith(req);
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'nlrNeedsStepFreeAccess', 'somePreviousPage');
    });

    it('getNlrNeedStepFreeAccess should catch an exception and call next()', () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      getNlrNeedStepFreeAccess(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postNlrNeedStepFreeAccess', () => {
    it('postNlrNeedStepFreeAccess should nlrRadioRender nlrOutsideUK if failed validation', async () => {
      const previousPageStub = sandbox.stub(HearingUtils, 'getStepFreeAccessPreviousPage').returns('somePreviousPage');
      await postNlrNeedStepFreeAccess(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const expectedValidation = {
        answer: {
          key: 'answer',
          text: i18n.validationErrors.hearingRequirements.nlrNeedsSection.nlrNeedsStepFreeAccessRequired,
          href: '#answer'
        }
      };
      expect(previousPageStub).to.be.calledWith(req);
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'nlrNeedsStepFreeAccess', 'somePreviousPage', expectedValidation);
    });

    it('postNlrNeedStepFreeAccess should submit update and redirect to nlrNeedsHearingLoop', async () => {
      req.body.answer = 'something';
      expectedAppeal.hearingRequirements.nlrNeedsStepFreeAccess = 'something';
      await postNlrNeedStepFreeAccess(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.nlrNeedsHearingLoop);
    });

    it('postNlrNeedStepFreeAccess should catch an exception and call next()', async () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      await postNlrNeedStepFreeAccess(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNlrNeedHearingLoop', () => {
    it('getNlrNeedHearingLoop should nlrRadioRender correctly', () => {
      getNlrNeedHearingLoop(req as Request, res as Response, next);
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'nlrNeedsHearingLoop', paths.submitHearingRequirements.nlrNeedsStepFreeAccess);
    });

    it('getNlrNeedHearingLoop should catch an exception and call next()', () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      getNlrNeedHearingLoop(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postNlrNeedHearingLoop', () => {
    it('postNlrNeedHearingLoop should nlrRadioRender nlrOutsideUK if failed validation', async () => {
      await postNlrNeedHearingLoop(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const expectedValidation = {
        answer: {
          key: 'answer',
          text: i18n.validationErrors.hearingRequirements.nlrNeedsSection.nlrNeedsHearingLoopRequired,
          href: '#answer'
        }
      };
      expect(nlrRadioRenderStub).to.be.calledWith(req, res, next, 'nlrNeedsHearingLoop', paths.submitHearingRequirements.nlrNeedsStepFreeAccess, expectedValidation);
    });

    it('postNlrNeedHearingLoop should submit update and redirect to taskList', async () => {
      req.body.answer = 'something';
      expectedAppeal.hearingRequirements.nlrNeedsHearingLoop = 'something';
      await postNlrNeedHearingLoop(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub).to.be.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, expectedAppeal, userId, authToken);
      expect(redirectStub).to.be.calledWith(paths.submitHearingRequirements.taskList);
    });

    it('postNlrNeedHearingLoop should catch an exception and call next()', async () => {
      const error = new Error('the error');
      nlrRadioRenderStub.throws(error);
      await postNlrNeedHearingLoop(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

});
