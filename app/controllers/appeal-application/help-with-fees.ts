import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { helpWithFeesValidation } from '../../utils/validations/fields-validations';

function getApplyOption(appeal: Appeal) {

  let selectedOption = '';
  return {
    title: i18n.pages.helpWithFees.title,
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
      },
      {
        value: i18n.pages.helpWithFees.options.willPayForAppeal.value,
        text: i18n.pages.helpWithFees.options.willPayForAppeal.text,
        checked: selectedOption === i18n.pages.helpWithFees.options.willPayForAppeal.value
      }
    ],
    inline: false
  };
}

async function getHelpWithFees(req: Request, res: Response, next: NextFunction) {
  try {
    const appeal = req.session.appeal;
    const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    if (!dlrmFeeRemissionFlag) return res.redirect(paths.common.overview);
    appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/fee-support/help-with-fees.njk', {
      previousPage: paths.appealStarted.feeSupport,
      formAction: paths.appealStarted.helpWithFees,
      question: getApplyOption(req.session.appeal),
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postHelpWithFees(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    async function persistAppeal(appeal: Appeal, drlmSetAsideFlag) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], drlmSetAsideFlag);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

    try {
      const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
      if (!dlrmFeeRemissionFlag) return res.redirect(paths.common.overview);
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = helpWithFeesValidation(req.body);
      if (validation) {
        return res.render('appeal-application/fee-support/help-with-fees.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.helpWithFees,
          pageTitle: i18n.pages.helpWithFees.title,
          question: getApplyOption(req.session.appeal),
          formAction: paths.appealStarted.helpWithFees,
          saveAndContinue: true
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
      const defaultRedirect = getHelpWithFeesRedirectPage(selectedValue);
      if (defaultRedirect === paths.appealStarted.taskList) {
        req.session.appeal.application.feeSupportPersisted = true;
      }
      await persistAppeal(appeal, dlrmFeeRemissionFlag);
      let redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function getHelpWithFeesRedirectPage(remissionOption: string): string {
  switch (remissionOption) {
    case 'wantToApply':
      return paths.appealStarted.stepsToApplyForHelpWithFees;
    case 'alreadyApplied':
      return paths.appealStarted.helpWithFeesReferenceNumber;
    case 'willPayForAppeal':
      return paths.appealStarted.taskList;
    default:
      throw new Error('The selected help with fees page option is not valid. Please check the value.');
  }
}

function setupHelpWithFeesController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.helpWithFees, middleware, getHelpWithFees);
  router.post(paths.appealStarted.helpWithFees, middleware, postHelpWithFees(updateAppealService));
  return router;
}

export {
  getHelpWithFees,
  postHelpWithFees,
  setupHelpWithFeesController,
  getHelpWithFeesRedirectPage
};
