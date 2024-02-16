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
import { asylumSupportValidation } from '../../utils/validations/fields-validations';

async function getAsylumSupport(req: Request, res: Response, next: NextFunction) {
  try {
    const drlmSetAsideFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    if (!drlmSetAsideFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/fee-support/asylum-support.njk', {
      previousPage: paths.appealStarted.feeSupport,
      formAction: paths.appealStarted.asylumSupport,
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postAsylumSupport(updateAppealService: UpdateAppealService) {
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
      const validation = asylumSupportValidation(req.body);
      if (validation) {
        return res.render('appeal-application/fee-support/asylum-support.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.asylumSupport,
          pageTitle: i18n.pages.asylumSupportPage.title,
          formAction: paths.appealStarted.asylumSupport,
          saveAndContinue: true
        });
      }
      const selectedValue = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          asylumSupportRefNumber: selectedValue
        }
      };
      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      await persistAppeal(appeal, dlrmFeeRemissionFlag);
      const defaultRedirect = paths.appealStarted.asylumSupport;
      let redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupAsylumSupportController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.asylumSupport, middleware, getAsylumSupport);
  router.post(paths.appealStarted.asylumSupport, middleware, postAsylumSupport(updateAppealService));
  return router;
}

export {
  setupAsylumSupportController
};
