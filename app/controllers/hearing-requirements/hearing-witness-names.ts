import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import {
  witnessNameValidation
} from '../../utils/validations/fields-validations';

function getWitnessNamesPage(req: Request, res: Response, next: NextFunction) {
  try {
    let witnessNames: string [] = req.session.appeal.hearingRequirements.witnessNames || [];
    return res.render('hearing-requirements/hearing-witness-names.njk', {
      previousPage: paths.submitHearingRequirements.witnesses,
      witnessNames: witnessNames,
      addWitnessAction: paths.submitHearingRequirements.hearingWitnessNamesAdd,
      removeWitnessAction: paths.submitHearingRequirements.hearingWitnessNamesRemove
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
      let witnessNames: string [] = req.session.appeal.hearingRequirements.witnessNames || [];
      const validation = witnessNames.length < 1 ? witnessNameValidation(req.body) : null;
      if (validation) {
        return renderPage(res, validation, witnessNames);
      }

      witnessNames.push(req.body['witnessName']);
      req.session.appeal.hearingRequirements.witnessNames = witnessNames;
      return res.redirect(paths.submitHearingRequirements.witnessOutsideUK);
    } catch (e) {
      next(e);
    }
  };
}

function renderPage (res: Response, validation: ValidationErrors, witnessNames: string[]) {
  return res.render('hearing-requirements/hearing-witness-names.njk', {
    error: validation,
    errorList: Object.values(validation),
    previousPage: paths.submitHearingRequirements.witnesses,
    witnessNames: witnessNames,
    addWitnessAction: paths.submitHearingRequirements.hearingWitnessNamesAdd,
    removeWitnessAction: paths.submitHearingRequirements.hearingWitnessNamesRemove
  });
}

function addMoreWitnessPostAction() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'witnessName')) {
        return getConditionalRedirectUrl(req, res, paths.submitHearingRequirements.taskList + '?saved');
      }
      let witnessNames: string [] = req.session.appeal.hearingRequirements.witnessNames || [];
      const validation = witnessNameValidation(req.body);
      if (validation) {
        return renderPage(res, validation, witnessNames);
      }
      witnessNames.push(req.body['witnessName']);
      req.session.appeal.hearingRequirements.witnessNames = witnessNames;
      return res.redirect(paths.submitHearingRequirements.hearingWitnessNames);
    } catch (e) {
      next(e);
    }
  };
}

function removeWitnessPostAction() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      let witnessNames: string [] = req.session.appeal.hearingRequirements.witnessNames || [];
      const nameToRemove: string = req.query.name as string;
      req.session.appeal.hearingRequirements.witnessNames = witnessNames.filter(name => name !== nameToRemove);
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
  router.post(paths.submitHearingRequirements.hearingWitnessNamesAdd, middleware, addMoreWitnessPostAction());
  router.get(paths.submitHearingRequirements.hearingWitnessNamesRemove, middleware, removeWitnessPostAction());

  return router;
}

export {
  setupWitnessNamesController,
  getWitnessNamesPage,
  postWitnessNamesPage,
  addMoreWitnessPostAction,
  removeWitnessPostAction
};
