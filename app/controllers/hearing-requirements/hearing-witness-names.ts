import { NextFunction, Request, Response, Router } from 'express';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { addSummaryRow } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import {
  witnessNameValidation
} from '../../utils/validations/fields-validations';

function getWitnessNamesPage(req: Request, res: Response, next: NextFunction) {
  try {
    let witnessNames: string [] = req.session.appeal.hearingRequirements.witnessNames || [];
    return res.render('hearing-requirements/hearing-witness-names.njk', {
      previousPage: paths.submitHearingRequirements.witnesses,
      summaryList: buildWitnessNamesList(witnessNames),
      addWitnessAction: paths.submitHearingRequirements.hearingWitnessNamesAdd
    });
  } catch (e) {
    next(e);
  }
}

function postWitnessNamesPage(updateAppealService: UpdateAppealService) {
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
      const witnessName: string = req.body['witnessName'] as string;
      if (!witnessName) {
        witnessNames.push();
        req.session.appeal.hearingRequirements.witnessNames = witnessNames;
      }
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
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
    summaryList: buildWitnessNamesList(witnessNames),
    addWitnessAction: paths.submitHearingRequirements.hearingWitnessNamesAdd
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

function buildWitnessNamesList(witnessNames: string[]): SummaryList[] {
  const witnessNamesSummaryLists: SummaryList[] = [];
  const witnessNamesRows: SummaryRow[] = [];
  witnessNames.map((name: string) => {
    witnessNamesRows.push(
        addSummaryRow(
            name,
            [],
            `${paths.submitHearingRequirements.hearingWitnessNamesRemove}?name=${encodeURIComponent(name)}`,
            null,
            'Remove'
        )
    );
  });
  witnessNamesSummaryLists.push({
    summaryRows: witnessNamesRows,
    title: 'Added witnesses'
  });
  return witnessNamesSummaryLists;
}

function setupWitnessNamesController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.hearingWitnessNames, middleware, getWitnessNamesPage);
  router.post(paths.submitHearingRequirements.hearingWitnessNames, middleware, postWitnessNamesPage(updateAppealService));
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
