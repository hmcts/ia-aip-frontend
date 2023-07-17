import { NextFunction, Request, Response, Router } from 'express';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { addSummaryRow } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { formatWitnessName } from '../../utils/utils';
import {
  witnessesValidation,
  witnessNameValidation
} from '../../utils/validations/fields-validations';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
function getWitnessNamesPage(req: Request, res: Response, next: NextFunction) {
  try {
    let witnessNames: WitnessName [] = req.session.appeal.hearingRequirements.witnessNames || [];
    const summaryList = buildWitnessNamesList(witnessNames);
    const isShowingAddButton = checkWitnessLength(witnessNames)

    return res.render('hearing-requirements/hearing-witness-names.njk', {
      previousPage,
      summaryList,
      isShowingAddButton,
      witnessAction: paths.submitHearingRequirements.hearingWitnessNames
    });
  } catch (e) {
    next(e);
  }
}

function postWitnessNamesPage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      let witnessNames: WitnessName [] = req.session.appeal.hearingRequirements.witnessNames || [];
      const validation = witnessesValidation(witnessNames);
      if (validation) {
        return renderPage(res, validation, witnessNames);
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

function renderPage (res: Response, validation: ValidationErrors, witnessNames: WitnessName[]) {
  return res.render('hearing-requirements/hearing-witness-names.njk', {
    error: validation,
    errorList: Object.values(validation),
    previousPage: previousPage,
    summaryList: buildWitnessNamesList(witnessNames),
    isShowingAddButton: checkWitnessLength(witnessNames),
    witnessAction: paths.submitHearingRequirements.hearingWitnessNames
  });
}

function addMoreWitnessPostAction() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, ['witnessName', 'witnessFamilyName'])) {
        return getConditionalRedirectUrl(req, res, paths.submitHearingRequirements.taskList + '?saved');
      }
      let witnessNames: WitnessName [] = req.session.appeal.hearingRequirements.witnessNames || [];
      const validation = witnessNameValidation(req.body);
      if (validation) {
        return renderPage(res, validation, witnessNames);
      }
      const newWitnessName: WitnessName = {
        witnessGivenNames: req.body['witnessName'],
        witnessFamilyName: req.body['witnessFamilyName']
      };
      witnessNames.push(newWitnessName);
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
      let witnessNames: WitnessName [] = req.session.appeal.hearingRequirements.witnessNames || [];
      const nameToRemove: string = req.query.name as string;
      req.session.appeal.hearingRequirements.witnessNames = witnessNames.filter(name => formatWitnessName(name) !== nameToRemove);
      return res.redirect(paths.submitHearingRequirements.hearingWitnessNames);
    } catch (e) {
      next(e);
    }
  };
}

function buildWitnessNamesList(witnessNames: WitnessName[]): SummaryList[] {
  const witnessNamesSummaryLists: SummaryList[] = [];
  const witnessNamesRows: SummaryRow[] = [];
  witnessNames.forEach(name => {
    const nameFormated = formatWitnessName(name);
    witnessNamesRows.push(
        addSummaryRow(
            nameFormated,
            [],
            `${paths.submitHearingRequirements.hearingWitnessNamesRemove}?name=${encodeURIComponent(nameFormated)}`,
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

function checkWitnessLength(witnessNames: WitnessName[]): boolean {
  return (witnessNames && witnessNames.length < 10);
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
