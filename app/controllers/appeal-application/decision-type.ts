import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import PcqService from '../../service/pcq-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { decisionTypeValidation } from '../../utils/validations/fields-validations';

function getDecisionTypeQuestion(appeal: Appeal) {
  let hint: string;
  let decision: string;
  if (['revocationOfProtection', 'deprivation'].includes(appeal.application.appealType)) {
    hint = i18n.pages.decisionTypePage.hint.withoutFee;
    decision = appeal.application.rpDcAppealHearingOption || null;
  } else if (['protection', 'refusalOfHumanRights', 'refusalOfEu'].includes(appeal.application.appealType)) {
    hint = i18n.pages.decisionTypePage.hint.withFee;
    decision = appeal.application.decisionHearingFeeOption || null;
  }
  const question = {
    title: i18n.pages.decisionTypePage.title,
    hint,
    options: [
      {
        value: i18n.pages.decisionTypePage.options.withHearing.value,
        text: i18n.pages.decisionTypePage.options.withHearing.text,
        checked: decision === i18n.pages.decisionTypePage.options.withHearing.value
      },
      {
        value: i18n.pages.decisionTypePage.options.withoutHearing.value,
        text: i18n.pages.decisionTypePage.options.withoutHearing.text,
        checked: decision === i18n.pages.decisionTypePage.options.withoutHearing.value
      }
    ],
    inline: false
  };
  return question;
}

async function getDecisionType(req: Request, res: Response, next: NextFunction) {
  try {
    const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
    if (!paymentsFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('templates/radio-question-page.njk', {
      previousPage: paths.appealStarted.taskList,
      pageTitle: i18n.pages.decisionTypePage.title,
      formAction: paths.appealStarted.decisionType,
      question: getDecisionTypeQuestion(req.session.appeal),
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postDecisionType(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    async function persistAppeal(appeal: Appeal, paymentsFlag) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], paymentsFlag);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

    try {
      const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
      if (!paymentsFlag) return res.redirect(paths.common.overview);
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = decisionTypeValidation(req.body);
      const { appealType } = req.session.appeal.application;
      if (validation) {
        return res.render('templates/radio-question-page.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.typeOfAppeal,
          pageTitle: i18n.pages.decisionTypePage.title,
          formAction: paths.appealStarted.decisionType,
          question: getDecisionTypeQuestion(req.session.appeal),
          saveAndContinue: true
        });
      }
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          rpDcAppealHearingOption: ['revocationOfProtection', 'deprivation'].includes(appealType) ? req.body['answer'] : '',
          decisionHearingFeeOption: ['protection', 'refusalOfHumanRights', 'refusalOfEu'].includes(appealType) ? req.body['answer'] : ''
        }
      };

      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      await persistAppeal(appeal, paymentsFlag);
      const defaultRedirect = req.session.appeal.application.appealType === 'protection' ? paths.appealStarted.payNow : paths.appealStarted.taskList;
      let redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      if (['protection'].includes(appeal.application.appealType) || appeal.pcqId) return res.redirect(redirectPage);
      const pcqFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.PCQ, false);
      if (!pcqFlag) return res.redirect(redirectPage);
      const pcqService = new PcqService();
      const isPcqUp: boolean = await pcqService.checkPcqHealth();
      if (isPcqUp) {
        appeal.pcqId = pcqService.getPcqId();
        await persistAppeal(appeal, paymentsFlag);
        pcqService.invokePcq(res, appeal);
      } else {
        return res.redirect(redirectPage);
      }
    } catch (error) {
      next(error);
    }
  };
}

function setupDecisionTypeController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.decisionType, middleware, getDecisionType);
  router.post(paths.appealStarted.decisionType, middleware, postDecisionType(updateAppealService));
  return router;
}

export {
  setupDecisionTypeController,
  getDecisionType,
  getDecisionTypeQuestion,
  postDecisionType
};
