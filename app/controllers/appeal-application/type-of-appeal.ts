import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { appealTypes } from '../../data/appeal-types';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { typeOfAppealValidation } from '../../utils/validations/fields-validations';

function getTypeOfAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const appealType = req.session.appeal.application && req.session.appeal.application.appealType || [];
    const types = appealTypes.map(type => {
      if (appealType.includes(type.value)) type.checked = true;
      else type.checked = false;
      return type;
    });

    return res.render('appeal-application/type-of-appeal.njk', {
      types,
      previousPage: paths.taskList
    });
  } catch (error) {
    next(error);
  }
}

function postTypeOfAppeal(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = typeOfAppealValidation(req.body);
      if (validation) {
        return res.render('appeal-application/type-of-appeal.njk', {
          types: appealTypes,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.taskList
        });
      }

      req.session.appeal.application.appealType = req.body['appealType'];
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);

      return getConditionalRedirectUrl(req, res, paths.taskList);
    } catch (error) {
      next(error);
    }
  };
}

function setupTypeOfAppealController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.typeOfAppeal, getTypeOfAppeal);
  router.post(paths.typeOfAppeal, postTypeOfAppeal(updateAppealService));
  return router;
}

export {
  setupTypeOfAppealController,
  getTypeOfAppeal,
  postTypeOfAppeal
};
