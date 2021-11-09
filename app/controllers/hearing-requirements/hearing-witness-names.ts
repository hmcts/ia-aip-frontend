import { NextFunction, Request, Response, Router } from 'express';
// import * as _ from 'lodash';
import { paths } from '../../paths';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import {
  witnessNameValidation
} from '../../utils/validations/fields-validations';

function getWitnessNamesPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('hearing-requirements/hearing-witness-names.njk', {
      previousPage: paths.submitHearingRequirements.witnesses
    });
  } catch (e) {
    next(e);
  }
}

function postWitnessNamesPage() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'witnessName')) {
        return getConditionalRedirectUrl(req, res, paths.submitHearingRequirements.taskList + '?saved');
      }
      const validation = witnessNameValidation(req.body);
      console.log('validation::' + JSON.stringify(validation));
      if (validation) {
        // TODO: populate the table here
        console.log('req.body::' + JSON.stringify(req.body));
        return res.redirect(paths.submitHearingRequirements.witnessOutsideUK);
      }
      return res.redirect(paths.submitHearingRequirements.hearingWitnessNames);
    } catch (e) {
      next(e);
    }
  };
}

function setupWitnessNamesController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.hearingWitnessNames, middleware, getWitnessNamesPage);
  router.post(paths.submitHearingRequirements.hearingWitnessNames, middleware, postWitnessNamesPage());
  return router;
}

export {
  setupWitnessNamesController,
  getWitnessNamesPage,
  postWitnessNamesPage
};
