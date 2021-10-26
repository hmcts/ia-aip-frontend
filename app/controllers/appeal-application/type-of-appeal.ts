import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { appealTypes } from '../../data/appeal-types';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { typeOfAppealValidation } from '../../utils/validations/fields-validations';

async function getAppealTypes(req: Request) {
  const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, 'online-card-payments-feature', false);
  const types = paymentsFlag ? appealTypes : appealTypes.filter(type => type.value === 'protection' || type.value === 'revocationOfProtection');
  const appealType = req.session.appeal.application && req.session.appeal.application.appealType || [];
  return types.map(type => {
    type.checked = appealType.includes(type.value);
    return type;
  });
}

async function getTypeOfAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/type-of-appeal.njk', {
      types: await getAppealTypes(req),
      previousPage: paths.appealStarted.taskList
    });
  } catch (error) {
    next(error);
  }
}

function postTypeOfAppeal(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'appealType')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = typeOfAppealValidation(req.body);
      if (validation) {
        return res.render('appeal-application/type-of-appeal.njk', {
          errors: validation,
          errorList: Object.values(validation),
          types: await getAppealTypes(req),
          previousPage: paths.appealStarted.taskList
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          appealType: req.body['appealType']
        }
      };

      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.taskList);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupTypeOfAppealController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.typeOfAppeal, middleware, getTypeOfAppeal);
  router.post(paths.appealStarted.typeOfAppeal, middleware, postTypeOfAppeal(updateAppealService));
  return router;
}

export {
  setupTypeOfAppealController,
  getTypeOfAppeal,
  postTypeOfAppeal
};
