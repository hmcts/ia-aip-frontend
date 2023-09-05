import { NextFunction, Request, Response, Router } from 'express';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { addSummaryRow } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { clearWitnessCachedData, formatWitnessName, getWitnessComponent } from '../../utils/utils';
import { v4 as uuid } from 'uuid';
import {
  witnessesValidation,
  witnessNameValidation
} from '../../utils/validations/fields-validations';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
function getWitnessNamesPage(req: Request, res: Response, next: NextFunction) {
  try {
    let witnessNames: WitnessName [] = req.session.appeal.hearingRequirements.witnessNames || [];
    const summaryList = buildWitnessNamesList(witnessNames);
    const isShowingAddButton = checkWitnessLength(witnessNames);

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

      clearWitnessCachedData(req.session.appeal.hearingRequirements);

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
        witnessPartyId: uuid(),
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
      let witnessNames: WitnessName[] = req.session.appeal.hearingRequirements.witnessNames || [];
      const nameToRemove: string = req.query.name as string;

      req.session.appeal.hearingRequirements.witnessNames = witnessNames.filter(name => formatWitnessName(name) !== nameToRemove);

      // remove the witness data
      for (let index = 0; index < 10; index++) {
        let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, index.toString());

        if (witnessComponent && witnessComponent.witnessFullName && witnessComponent.witnessFullName === nameToRemove) {
          req.session.appeal.hearingRequirements[witnessComponent.witnessFieldString] = null;
          req.session.appeal.hearingRequirements[witnessComponent.witnessListElementFieldString] = null;
          req.session.appeal.hearingRequirements[witnessComponent.witnessInterpreterLanguageCategoryFieldString] = null;
          req.session.appeal.hearingRequirements[witnessComponent.witnessInterpreterSpokenLanguageFieldString] = null;
          req.session.appeal.hearingRequirements[witnessComponent.witnessInterpreterSignLanguageFieldString] = null;
        }
      }

      // relocate the witness data because of index change
      for (let index = 0; index < 10; index++) {
        let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, index.toString());

        req.session.appeal.hearingRequirements.witnessNames.map((witnessObj, i) => {
          let hearingRequirements = req.session.appeal.hearingRequirements;
          if (witnessComponent && witnessComponent.witnessFullName && witnessComponent.witnessFullName === formatWitnessName(witnessObj)) {

            hearingRequirements[('witness' + (i + 1))] = witnessComponent.witness;
            hearingRequirements[('witnessListElement' + (i + 1))] = witnessComponent.witnessListElement;
            hearingRequirements[('witness' + (i + 1) + 'InterpreterLanguageCategory')] = witnessComponent.witnessInterpreterLanguageCategory;
            hearingRequirements[('witness' + (i + 1) + 'InterpreterSpokenLanguage')] = witnessComponent.witnessInterpreterSpokenLanguage;
            hearingRequirements[('witness' + (i + 1) + 'InterpreterSignLanguage')] = witnessComponent.witnessInterpreterSignLanguage;

          }
        });
      }

      // clear the rest of cached witness data
      for (let index = req.session.appeal.hearingRequirements.witnessNames.length; index < 10; index++) {
        req.session.appeal.hearingRequirements[('witness' + (index + 1))] = null;
        req.session.appeal.hearingRequirements[('witnessListElement' + (index + 1))] = null;
        req.session.appeal.hearingRequirements[('witness' + (index + 1) + 'InterpreterLanguageCategory')] = null;
        req.session.appeal.hearingRequirements[('witness' + (index + 1) + 'InterpreterSpokenLanguage')] = null;
        req.session.appeal.hearingRequirements[('witness' + (index + 1) + 'InterpreterSignLanguage')] = null;
      }

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
