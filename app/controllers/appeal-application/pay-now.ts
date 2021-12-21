import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { PageSetup } from '../../interfaces/PageSetup';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { payNowValidation } from '../../utils/validations/fields-validations';
import { checkPcqHealth, invokePcq } from '../pcq';

function getPayNowQuestion(appeal: Appeal) {
  const paAppealTypeAipPaymentOption = appeal.paAppealTypeAipPaymentOption || null;
  const question = {
    title: i18n.pages.payNow.title,
    hint: i18n.pages.payNow.hint,
    options: [
      {
        value: i18n.pages.payNow.options.now.value,
        text: i18n.pages.payNow.options.now.text,
        checked: paAppealTypeAipPaymentOption === 'payNow'
      },
      {
        value: i18n.pages.payNow.options.later.value,
        text: i18n.pages.payNow.options.later.text,
        checked: paAppealTypeAipPaymentOption === 'payLater'
      }
    ]
  };
  return question;
}

async function getPayNow(req: Request, res: Response, next: NextFunction) {
  try {
    const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
    if (!paymentsFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('templates/radio-question-page.njk', {
      previousPage: paths.appealStarted.decisionType,
      pageTitle: i18n.pages.payNow.title,
      formAction: paths.appealStarted.payNow,
      question: getPayNowQuestion(req.session.appeal),
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postPayNow(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
      if (!paymentsFlag) return res.redirect(paths.common.overview);
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = payNowValidation(req.body);
      if (validation) {
        return res.render('templates/radio-question-page.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.decisionType,
          pageTitle: i18n.pages.payNow.title,
          formAction: paths.appealStarted.payNow,
          question: getPayNowQuestion(req.session.appeal),
          saveAndContinue: true
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        paAppealTypeAipPaymentOption: req.body['answer']
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      let defaultRedirect = paths.appealStarted.taskList;
      let editingModeRedirect = paths.appealStarted.checkAndSend;

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], paymentsFlag);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, editingModeRedirect, req.body.saveForLater, defaultRedirect);

      if (['protection'].includes(appeal.application.appealType)) {
        const pcqFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.PCQ, false);
        if (!pcqFlag) return res.redirect(redirectPage);
        let isPcqUp: boolean = await checkPcqHealth();
        if (isPcqUp) {
          invokePcq(res, appeal);
        } else {
          return res.redirect(redirectPage);
        }
      } else {
        return res.redirect(redirectPage);
      }
    } catch (error) {
      next(error);
    }
  };
}

@PageSetup.register
class SetupPayNowController {
  initialise(middleware: any[], updateAppealService): Router {
    const router = Router();
    router.get(paths.appealStarted.payNow, middleware, getPayNow);
    router.post(paths.appealStarted.payNow, middleware, postPayNow(updateAppealService));
    return router;
  }
}

export {
  SetupPayNowController,
  getPayNow,
  getPayNowQuestion,
  postPayNow
};
