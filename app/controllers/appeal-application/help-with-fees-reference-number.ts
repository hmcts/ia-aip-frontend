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
import { helpWithFeesRefNumberValidation } from '../../utils/validations/fields-validations';

async function getHelpWithFeesRefNumber(req: Request, res: Response, next: NextFunction) {
  try {
    const drlmSetAsideFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    if (!drlmSetAsideFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };

    return res.render('appeal-application/fee-support/help-with-fees-reference-number.njk', {
      previousPage: previousPage,
      formAction: paths.appealStarted.helpWithFeesReferenceNumber,
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postHelpWithFeesRefNumber(updateAppealService: UpdateAppealService) {
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
      if (!shouldValidateWhenSaveForLater(req.body, 'helpWithFeesRefNumber')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = helpWithFeesRefNumberValidation(req.body);
      if (validation) {
        return res.render('appeal-application/fee-support/help-with-fees-reference-number.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.helpWithFeesReferenceNumber,
          pageTitle: i18n.pages.helpWithFeesReference.title,
          formAction: paths.appealStarted.helpWithFeesReferenceNumber,
          saveAndContinue: true
        });
      }
      const selectedValue = req.body['helpWithFeesRefNumber'];
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          helpWithFeesRefNumber: selectedValue
        }
      };
      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      await persistAppeal(appeal, dlrmFeeRemissionFlag);
      const defaultRedirect = paths.appealStarted.taskList;
      let redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupHelpWithFeesReferenceNumberController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.helpWithFeesReferenceNumber, middleware, getHelpWithFeesRefNumber);
  router.post(paths.appealStarted.helpWithFeesReferenceNumber, middleware, postHelpWithFeesRefNumber(updateAppealService));
  return router;
}

export {
  getHelpWithFeesRefNumber,
  postHelpWithFeesRefNumber,
  setupHelpWithFeesReferenceNumberController
};
