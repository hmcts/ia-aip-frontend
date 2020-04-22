import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { appealTypes } from '../../data/appeal-types';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { typeOfAppealValidation } from '../../utils/validations/fields-validations';

function getTypeOfAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const appealType = req.session.appeal.application && req.session.appeal.application.appealType || [];
    const types = appealTypes.map(type => {
      type.checked = appealType.includes(type.value);
      return type;
    });

    return res.render('appeal-application/type-of-appeal.njk', {
      types,
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
          types: appealTypes,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.taskList
        });
      }

      req.session.appeal.application.appealType = req.body['appealType'];
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);

      return getConditionalRedirectUrl(req, res, paths.appealStarted.taskList);
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
