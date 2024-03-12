import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import { getFee } from '../../utils/payments-utils';
import { helpWithFeesValidation } from '../../utils/validations/fields-validations';

function getApplyOption(appeal: Appeal) {
  let selectedOption = appeal.application.helpWithFeesOption || null;
  const fee = getFee(appeal).calculated_amount;
  return {
    title: i18n.pages.helpWithFees.radioButtonsTitle,
    helpWithFeesHint: i18n.pages.helpWithFees.refundsNote.replace('{{ fee }}', fee),
    options: [
      {
        value: i18n.pages.helpWithFees.options.wantToApply.value,
        text: i18n.pages.helpWithFees.options.wantToApply.text,
        checked: selectedOption === i18n.pages.helpWithFees.options.wantToApply.value
      },
      {
        value: i18n.pages.helpWithFees.options.alreadyApplied.value,
        text: i18n.pages.helpWithFees.options.alreadyApplied.text,
        checked: selectedOption === i18n.pages.helpWithFees.options.alreadyApplied.value
      }
    ],
    inline: false
  };
}

async function getHelpWithFees(req: Request, res: Response, next: NextFunction) {
  try {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    const appeal = req.session.appeal;
    appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/fee-support/help-with-fees.njk', {
      previousPage: paths.appealSubmitted.feeSupportRefund,
      formAction: paths.appealSubmitted.helpWithFeesRefund,
      question: getApplyOption(req.session.appeal),
      continueCancelButtons: true,
      refundJourney: true
    });
  } catch (error) {
    next(error);
  }
}

function postHelpWithFees() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);

    try {
      const validation = helpWithFeesValidation(req.body);
      if (validation) {
        return res.render('appeal-application/fee-support/help-with-fees.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealSubmitted.feeSupportRefund,
          pageTitle: i18n.pages.helpWithFees.title,
          question: getApplyOption(req.session.appeal),
          formAction: paths.appealSubmitted.helpWithFeesRefund,
          continueCancelButtons: true,
          refundJourney: true
        });
      }
      const selectedValue = req.body['answer'];
      const application = req.session.appeal.application;
      application.helpWithFeesOption = selectedValue;
      return res.redirect(getHelpWithFeesRedirectPage(selectedValue));
    } catch (error) {
      next(error);
    }
  };
}

function getHelpWithFeesRedirectPage(selectedOption: string): string {
  switch (selectedOption) {
    case i18n.pages.helpWithFees.options.wantToApply.value:
      return paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund;
    case i18n.pages.helpWithFees.options.alreadyApplied.value:
      return paths.appealSubmitted.helpWithFeesReferenceNumberRefund;
    default:
      throw new Error('The selected help with fees page option is not valid. Please check the value.');
  }
}

function setupHelpWithFeesRefundController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.helpWithFeesRefund, middleware, getHelpWithFees);
  router.post(paths.appealSubmitted.helpWithFeesRefund, middleware, postHelpWithFees());
  return router;
}

export {
  getHelpWithFees,
  postHelpWithFees,
  setupHelpWithFeesRefundController,
  getHelpWithFeesRedirectPage,
  getApplyOption
};
