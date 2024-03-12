import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getRedirectPage } from '../../utils/utils';
import { helpWithFeesValidation } from '../../utils/validations/fields-validations';

function getApplyOption(appeal: Appeal) {
  let selectedOption = appeal.application.helpWithFeesOption || null;
  return {
    title: i18n.pages.helpWithFees.radioButtonsTitle,
    helpWithFeesHint: i18n.pages.helpWithFees.refundsNote.replace('{{ fee }}', appeal.feeAmountGbp),
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

function postHelpWithFees(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    async function persistAppeal(appeal: Appeal, refundFeatureEnabled) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], refundFeatureEnabled);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

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
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          helpWithFeesOption: selectedValue
        }
      };
      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      await persistAppeal(appeal, refundFeatureEnabled);
      const defaultRedirect = getHelpWithFeesRedirectPage(selectedValue);
      let redirectPage = getRedirectPage(isEdit, defaultRedirect, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
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

function setupHelpWithFeesRefundController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealSubmitted.helpWithFeesRefund, middleware, getHelpWithFees);
  router.post(paths.appealSubmitted.helpWithFeesRefund, middleware, postHelpWithFees(updateAppealService));
  return router;
}

export {
  getHelpWithFees,
  postHelpWithFees,
  setupHelpWithFeesRefundController,
  getHelpWithFeesRedirectPage,
  getApplyOption
};
