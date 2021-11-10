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
      if (validation) {
        return res.render('hearing-requirements/hearing-witness-names.njk', {
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.submitHearingRequirements.witnesses
        });
      }
      // TODO: populate the table here
      let witnessNames: string [] = req.session.appeal.hearingRequirements.witnessNames || [];
      witnessNames.push(req.body['witnessName']);
      req.session.appeal.hearingRequirements.witnessNames = witnessNames;
      return res.redirect(paths.submitHearingRequirements.witnessOutsideUK);
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
