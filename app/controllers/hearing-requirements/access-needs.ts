import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { isoLanguages } from '../../data/isoLanguages';

import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { addSummaryRow } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import {
  interpreterLanguagesValidation,
  selectedRequiredValidation
} from '../../utils/validations/fields-validations';
import { postHearingRequirementsYesNoHandler } from './common';

const yesOrNoOption = (answer: boolean) => [
  { text: 'Yes', value: 'yes', checked: answer === true },
  { text: 'No', value: 'no', checked: answer === false }
];

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };

function getAccessNeeds(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('hearing-requirements/access-needs.njk', {
      previousPage: previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getNeedInterpreterPage(req: Request, res: Response, next: NextFunction) {
  try {
    const answer = req.session.appeal.hearingRequirements.isInterpreterServicesNeeded as boolean || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: paths.submitHearingRequirements.accessNeeds,
      formAction: paths.submitHearingRequirements.hearingInterpreter,
      pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.title,
        hint:  i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.text,
        name: 'answer'
      }
    });
  } catch (error) {
    next(error);
  }
}

function postNeedInterpreterPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.accessNeeds.selectInterpreter;
      const pageContent = {
        previousPage: paths.submitHearingRequirements.accessNeeds,
        formAction: paths.submitHearingRequirements.hearingInterpreter,
        pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.pageTitle,
        question: {
          options: yesOrNoOption(null),
          title: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.title,
          hint:  i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.text,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = answer;
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        if (answer) {
          return res.redirect(paths.submitHearingRequirements.hearingLanguageDetails);
        } else {
          return res.redirect(paths.submitHearingRequirements.hearingStepFreeAccess);
        }
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function getAdditionalLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    let interpreterLanguages: InterpreterLanguage [] = req.session.appeal.hearingRequirements.interpreterLanguages || [];
    return res.render('hearing-requirements/language-details.njk', {
      previousPage: paths.submitHearingRequirements.hearingInterpreter,
      items: isoLanguages,
      summaryList: buildLanguageList(interpreterLanguages),
      languageAction: paths.submitHearingRequirements.hearingLanguageDetails
    });
  } catch (error) {
    next(error);
  }
}

function postAdditionalLanguage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      let interpreterLanguages: InterpreterLanguage [] = req.session.appeal.hearingRequirements.interpreterLanguages || [];
      const validation = interpreterLanguagesValidation(interpreterLanguages);
      if (validation) {
        return renderPage(res, validation, interpreterLanguages);
      }

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.submitHearingRequirements.hearingStepFreeAccess);

    } catch (error) {
      next(error);
    }
  };
}

function renderPage (res: Response, validation: ValidationErrors, interpreterLanguages: InterpreterLanguage []) {

  return res.render('hearing-requirements/language-details.njk', {
    items: isoLanguages,
    error: validation,
    errorList: Object.values(validation),
    previousPage: paths.submitHearingRequirements.hearingInterpreter,
    summaryList: buildLanguageList(interpreterLanguages),
    languageAction: paths.submitHearingRequirements.hearingLanguageDetails
  });
}

function buildLanguageList(interpreterLanguages: InterpreterLanguage[]): SummaryList[] {
  const languagesSummaryLists: SummaryList[] = [];
  const languageRows: SummaryRow[] = [];
  interpreterLanguages.forEach((interpreterLanguage: InterpreterLanguage) => {
    languageRows.push(
        addSummaryRow(
            'Language',
            [interpreterLanguage.language],
            `${paths.submitHearingRequirements.hearingLanguageDetailsRemove}?name=${encodeURIComponent(interpreterLanguage.language)}`,
            null,
            'Remove'
        )
    );
    languageRows.push(
        addSummaryRow(
            'Dialect',
            [interpreterLanguage.languageDialect]
        )
    );
  });
  languagesSummaryLists.push({
    summaryRows: languageRows,
    title: 'Languages'
  });
  return languagesSummaryLists;
}

function addMoreLanguagePostAction() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      let interpreterLanguages: InterpreterLanguage [] = req.session.appeal.hearingRequirements.interpreterLanguages || [];
      const validation = selectedRequiredValidation(req.body, i18n.validationErrors.hearingRequirements.accessNeeds.addLanguage);
      if (validation) {
        return renderPage(res, validation, interpreterLanguages);
      }
      const language: string = req.body['language'] as string;
      const dialect: string = req.body['dialect'] as string;
      const interpreterLanguage: InterpreterLanguage = { language: language, languageDialect: dialect };

      interpreterLanguages.push(interpreterLanguage);
      req.session.appeal.hearingRequirements.interpreterLanguages = interpreterLanguages;
      return res.redirect(paths.submitHearingRequirements.hearingLanguageDetails);
    } catch (e) {
      next(e);
    }
  };
}

function removeLanguagePostAction() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      let interpreterLanguages: InterpreterLanguage [] = req.session.appeal.hearingRequirements.interpreterLanguages || [];
      const nameToRemove: string = req.query.name as string;
      req.session.appeal.hearingRequirements.interpreterLanguages = interpreterLanguages.filter(interpreterLanguage => interpreterLanguage.language !== nameToRemove);
      return res.redirect(paths.submitHearingRequirements.hearingLanguageDetails);
    } catch (e) {
      next(e);
    }
  };
}

function getStepFreeAccessPage(req: Request, res: Response, next: NextFunction) {
  try {
    const backButton = req.session.appeal.hearingRequirements.isInterpreterServicesNeeded === true ? paths.submitHearingRequirements.hearingLanguageDetails : paths.submitHearingRequirements.hearingInterpreter;
    const answer = req.session.appeal.hearingRequirements.isHearingRoomNeeded as boolean || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: backButton,
      formAction: paths.submitHearingRequirements.hearingStepFreeAccess,
      pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.pageTitle,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.title,
        hint: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.text,
        name: 'answer'
      },
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postStepFreeAccessPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.accessNeeds.stepFreeAccess;
      const pageContent = {
        previousPage: previousPage,
        formAction: paths.submitHearingRequirements.hearingStepFreeAccess,
        pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.pageTitle,
        question: {
          options: yesOrNoOption(null),
          title: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.title,
          hint: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.text,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.hearingRequirements.isHearingRoomNeeded = answer;
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.submitHearingRequirements.hearingLoop);
      };
      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function getHearingLoopPage(req: Request, res: Response, next: NextFunction) {
  try {
    const isHearingLoopNeeded: boolean = req.session.appeal.hearingRequirements.isHearingLoopNeeded;
    const answer = isHearingLoopNeeded || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: previousPage,
      formAction: paths.submitHearingRequirements.hearingLoop,
      pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.title,
        hint: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.text,
        name: 'answer'
      }
    });
  } catch (error) {
    next(error);
  }
}

function postHearingLoopPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const answer: boolean = req.session.appeal.hearingRequirements.isHearingLoopNeeded as boolean;
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.accessNeeds.hearingLoop;
      const pageContent = {
        previousPage: previousPage,
        formAction: paths.submitHearingRequirements.hearingLoop,
        pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.pageTitle,
        question: {
          options: yesOrNoOption(answer || null),
          title: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.title,
          hint: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.text,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.hearingRequirements.isHearingLoopNeeded = answer;
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.submitHearingRequirements.taskList);
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function setupAccessNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.accessNeeds, middleware, getAccessNeeds);
  router.get(paths.submitHearingRequirements.hearingInterpreter, middleware, getNeedInterpreterPage);
  router.post(paths.submitHearingRequirements.hearingInterpreter, middleware, postNeedInterpreterPage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingLanguageDetails, middleware, getAdditionalLanguage);
  router.post(paths.submitHearingRequirements.hearingLanguageDetails, middleware, postAdditionalLanguage(updateAppealService));
  router.post(paths.submitHearingRequirements.hearingLanguageDetailsAdd, middleware, addMoreLanguagePostAction());
  router.get(paths.submitHearingRequirements.hearingLanguageDetailsRemove, middleware, removeLanguagePostAction());
  router.get(paths.submitHearingRequirements.hearingStepFreeAccess, middleware, getStepFreeAccessPage);
  router.post(paths.submitHearingRequirements.hearingStepFreeAccess, middleware, postStepFreeAccessPage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingLoop, middleware, getHearingLoopPage);
  router.post(paths.submitHearingRequirements.hearingLoop, middleware, postHearingLoopPage(updateAppealService));

  return router;
}

export {
  setupAccessNeedsController,
  getAccessNeeds,
  getNeedInterpreterPage,
  postNeedInterpreterPage,
  getAdditionalLanguage,
  postAdditionalLanguage,
  addMoreLanguagePostAction,
  removeLanguagePostAction,
  getStepFreeAccessPage,
  postStepFreeAccessPage,
  getHearingLoopPage,
  postHearingLoopPage
};
