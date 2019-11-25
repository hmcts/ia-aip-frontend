import { NextFunction,Request, Response, Router } from 'express';
import { appealTypes } from '../data/appeal-types';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { typeOfAppealValidation } from '../utils/fields-validations';

function getTypeOfAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    const appealType = req.session.appeal.application && req.session.appeal.application.appealType || [];
    const types = appealTypes.map(type => {
      if (appealType.includes(type.value)) type.checked = true;
      else type.checked = false;
      return type;
    });

    return res.render('appeal-application/type-of-appeal.njk', { types });
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
          errorList: Object.values(validation)
        });
      }
      await updateAppealService.updateAppeal(req);
      req.session.appeal.application.appealType = req.body['appealType'];
      return res.redirect(paths.taskList);
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
