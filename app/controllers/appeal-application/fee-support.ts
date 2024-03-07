import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getFee } from '../../utils/payments-utils';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { remissionOptionsValidation } from '../../utils/validations/fields-validations';

function getRemissionOptionsQuestion(appeal: Appeal) {
  const fee = getFee(appeal).calculated_amount;

  let remissionOption = appeal.application.remissionOption || null;
  const selectionHint = i18n.pages.remissionOptionPage.options.noneOfTheseStatements.hint;
  return {
    title: i18n.pages.remissionOptionPage.title,
    hint: i18n.pages.remissionOptionPage.hint.replace('{{ fee }}', fee),
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
        value: i18n.pages.remissionOptionPage.options.noneOfTheseStatements.value,
        text: i18n.pages.remissionOptionPage.options.noneOfTheseStatements.text,
        hint: {
          text: selectionHint
        },
        checked: remissionOption === i18n.pages.remissionOptionPage.options.noneOfTheseStatements.value
      }
    ],
    inline: false
  };
}

async function getFeeSupport(req: Request, res: Response, next: NextFunction) {
  try {
    const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    if (!dlrmFeeRemissionFlag) return res.redirect(paths.common.overview);
    const appeal = req.session.appeal;
    appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/fee-support/fee-support.njk', {
      previousPage: paths.appealStarted.taskList,
      pageTitle: i18n.pages.remissionOptionPage.title,
      formAction: paths.appealStarted.feeSupport,
      question: getRemissionOptionsQuestion(req.session.appeal),
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postFeeSupport(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    if (!dlrmFeeRemissionFlag) return res.redirect(paths.common.overview);
    async function persistAppeal(appeal: Appeal, drlmSetAsideFlag) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], drlmSetAsideFlag);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = remissionOptionsValidation(req.body);
      if (validation) {
        return res.render('appeal-application/fee-support/fee-support.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.taskList,
          pageTitle: i18n.pages.remissionOptionPage.title,
          formAction: paths.appealStarted.feeSupport,
          question: getRemissionOptionsQuestion(req.session.appeal),
          saveAndContinue: true
        });
      }

      const selectedValue = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          remissionOption: selectedValue
        }
      };
      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      await persistAppeal(appeal, dlrmFeeRemissionFlag);
      const defaultRedirect = getFeeSupportRedirectPage(selectedValue);
      let redirectPage = getRedirectPage(isEdit, defaultRedirect, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupFeeSupportController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.feeSupport, middleware, getFeeSupport);
  router.post(paths.appealStarted.feeSupport, middleware, postFeeSupport(updateAppealService));
  return router;
}

function getFeeSupportRedirectPage(remissionOption: string): string {
  switch (remissionOption) {
    case i18n.pages.remissionOptionPage.options.asylumSupportFromHo.value:
      return paths.appealStarted.asylumSupport;
    case i18n.pages.remissionOptionPage.options.feeWaiverFromHo.value:
      return paths.appealStarted.feeWaiver;
    case i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.value:
    case i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.value:
      return paths.appealStarted.localAuthorityLetter;
    case i18n.pages.remissionOptionPage.options.noneOfTheseStatements.value:
      return paths.appealStarted.helpWithFees;
    default:
      throw new Error('The selected remission option is not valid. Please check the value.');
  }
}

export {
  setupFeeSupportController,
  getFeeSupport,
  postFeeSupport,
  getFeeSupportRedirectPage,
  getRemissionOptionsQuestion
};
