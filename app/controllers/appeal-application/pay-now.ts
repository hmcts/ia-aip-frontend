import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { PageSetup } from '../../interfaces/PageSetup';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import PcqService from '../../service/pcq-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { payNowValidation } from '../../utils/validations/fields-validations';

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
  return async (request: Request, res: Response, next: NextFunction) => {
    async function persistAppeal(appeal: Appeal, paymentsFlag) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(
        Events.EDIT_APPEAL, appeal,
        request.idam.userDetails.uid, request.cookies['__auth-token'],
        paymentsFlag);
      request.session.appeal = { ...request.session.appeal, ...appealUpdated };
    }

    try {
      const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(request, FEATURE_FLAGS.CARD_PAYMENTS, false);
      if (!paymentsFlag) return res.redirect(paths.common.overview);
      if (!shouldValidateWhenSaveForLater(request.body, 'answer')) {
        return getConditionalRedirectUrl(request, res, paths.common.overview + '?saved');
      }
      const validation = payNowValidation(request.body);
      if (validation) {
        return res.render('templates/radio-question-page.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.decisionType,
          pageTitle: i18n.pages.payNow.title,
          formAction: paths.appealStarted.payNow,
          question: getPayNowQuestion(request.session.appeal),
          saveAndContinue: true
        });
      }

      const appeal: Appeal = {
        ...request.session.appeal,
        paAppealTypeAipPaymentOption: request.body['answer']
      };
      const editingMode: boolean = request.session.appeal.application.isEdit || false;
      let defaultRedirect = paths.appealStarted.taskList;
      let editingModeRedirect = paths.appealStarted.checkAndSend;

      await persistAppeal(appeal, paymentsFlag);
      let redirectPage = getRedirectPage(editingMode, editingModeRedirect, request.body.saveForLater, defaultRedirect);
      if (['protection'].includes(appeal.application.appealType) && !appeal.pcqId) {
        const pcqFlag = await LaunchDarklyService.getInstance().getVariation(request, FEATURE_FLAGS.PCQ, false);
        if (!pcqFlag) return res.redirect(redirectPage);
        const pcqService = new PcqService();
        let isPcqUp: boolean = await pcqService.checkPcqHealth();
        if (isPcqUp) {
          appeal.pcqId = pcqService.getPcqId();
          await persistAppeal(appeal, paymentsFlag);
          pcqService.invokePcq(res, appeal);
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
