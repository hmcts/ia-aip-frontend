import { NextFunction,Request, Response, Router } from 'express';
import i18n from '../../locale/en.json';
import AppealTypes from '../domain/appeal-types';
import { paths } from '../paths';

const appealTypes = new AppealTypes();

function getTypeOfAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('type-of-appeal.njk', { appealTypes });
  } catch (error) {
    next(error);
  }
}

function validate(data: []) {
  return !(!data || !data.length);
}

function postTypeOfAppeal(req: Request, res: Response, next: NextFunction) {
  const request = req.body;
  try {

    if (!validate(request.data)) {
      return res.render('type-of-appeal.njk', { appealTypes, error: i18n.validationErrors.atLeastOneOption });
    }
    // Saving data in session for now should save to CCD once implementation is finished
    req.session.typeOfAppeal = request.data;
    switch (request.button) {
      case 'save-and-continue':
        // TODO: replace devNextPage with real next pages
        return res.redirect(paths.devNextPage);
      case 'save-for-later':
        // TODO: re-direct to the dashboard page ?
        return res.redirect(paths.taskList);
      default:
        break;
    }
  } catch (error) {
    next(error);
  }
}

function setupTypeOfAppealController(): Router {
  const router = Router();
  router.get(paths.typeOfAppeal, getTypeOfAppeal);
  router.post(paths.typeOfAppeal, postTypeOfAppeal);
  return router;
}

export {
  setupTypeOfAppealController,
  getTypeOfAppeal,
  postTypeOfAppeal
};
