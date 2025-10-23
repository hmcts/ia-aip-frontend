import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import { payLaterForApplicationNeeded } from '../../utils/payments-utils';
import { remissionOptionsValidation } from '../../utils/validations/fields-validations';

function getOptionsQuestion(appeal: Appeal) {
  let remissionOption = appeal.application.lateRemissionOption || null;

  return {
    title: i18n.pages.remissionOptionPage.refundTitle,
    hint: i18n.pages.remissionOptionPage.selectOne,
    options: [
      {
        value: i18n.pages.remissionOptionPage.options.asylumSupportFromHo.value,
        text: i18n.pages.remissionOptionPage.options.asylumSupportFromHo.text,
        checked: remissionOption === i18n.pages.remissionOptionPage.options.asylumSupportFromHo.value
      },
      {
        value: i18n.pages.remissionOptionPage.options.feeWaiverFromHo.value,
        text: i18n.pages.remissionOptionPage.options.feeWaiverFromHo.text,
        checked: remissionOption === i18n.pages.remissionOptionPage.options.feeWaiverFromHo.value
      },
      {
        value: i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.value,
        text: i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.text,
        checked: remissionOption === i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.value
      },
      {
        value: i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.value,
        text: i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.text,
        checked: remissionOption === i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.value
      },
      {
        value: i18n.pages.remissionOptionPage.options.iWantToGetHelpWithFees.value,
        text: i18n.pages.remissionOptionPage.options.iWantToGetHelpWithFees.text,
        checked: remissionOption === i18n.pages.remissionOptionPage.options.iWantToGetHelpWithFees.value
      }
    ],
    inline: false
  };
}

async function getFeeSupport(req: Request, res: Response, next: NextFunction) {
  try {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    const appeal = req.session.appeal;
    const { application } = req.session.appeal;
    appeal.application.isEdit = _.has(req.query, 'edit');
    const paPayLater = payLaterForApplicationNeeded(req) && application.appealType === 'protection';

    return res.render('ask-for-fee-remission/fee-support-refund.njk', {
      previousPage: paths.common.overview,
      pageTitle: i18n.pages.remissionOptionPage.refundTitle,
      formAction: paths.appealSubmitted.feeSupportRefund,
      question: getOptionsQuestion(req.session.appeal),
      paPayLater
    });
  } catch (error) {
    next(error);
  }
}

function postFeeSupport() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    const paPayLater = payLaterForApplicationNeeded(req);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);

    try {
      const validation = remissionOptionsValidation(req.body);
      if (validation) {
        return res.render('ask-for-fee-remission/fee-support-refund.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.common.overview,
          pageTitle: i18n.pages.remissionOptionPage.refundTitle,
          formAction: paths.appealSubmitted.feeSupportRefund,
          question: getOptionsQuestion(req.session.appeal),
          paPayLater
        });
      }

      const selectedValue = req.body['answer'];
      const application = req.session.appeal.application;
      application.lateRemissionOption = selectedValue;
      return res.redirect(getFeeSupportRedirectPage(selectedValue));
    } catch (error) {
      next(error);
    }
  };
}

function setupFeeSupportRefundController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.feeSupportRefund, middleware, getFeeSupport);
  router.post(paths.appealSubmitted.feeSupportRefund, middleware, postFeeSupport());
  return router;
}

function getFeeSupportRedirectPage(remissionOption: string): string {
  switch (remissionOption) {
    case i18n.pages.remissionOptionPage.options.asylumSupportFromHo.value:
      return paths.appealSubmitted.asylumSupportRefund;
    case i18n.pages.remissionOptionPage.options.feeWaiverFromHo.value:
      return paths.appealSubmitted.feeWaiverRefund;
    case i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.value:
    case i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.value:
      return paths.appealSubmitted.localAuthorityLetterRefund;
    case i18n.pages.remissionOptionPage.options.iWantToGetHelpWithFees.value:
      return paths.appealSubmitted.helpWithFeesRefund;
    default:
      throw new Error('The selected remission option is not valid. Please check the value.');
  }
}

export {
  setupFeeSupportRefundController,
  getFeeSupportRedirectPage,
  getFeeSupport,
  postFeeSupport,
  getOptionsQuestion
};
