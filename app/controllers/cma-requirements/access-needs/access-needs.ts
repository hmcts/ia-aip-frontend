import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { isoLanguages } from '../../../data/isoLanguages';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { selectedRequiredValidation } from '../../../utils/validations/fields-validations';
import { postCmaRequirementsYesNoHandler } from '../common';

const yesOrNoOption = (answer: boolean) => [
  { text: 'Yes', value: 'yes', checked: answer === true },
  { text: 'No', value: 'no', checked: answer === false }
];

function getAccessNeeds(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-management-appointment/access-needs-page.njk', {
      previousPage: paths.common.overview
    });
  } catch (error) {
    next(error);
  }
}

function getNeedInterpreterPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessNeeds } = req.session.appeal.cmaRequirements;
    const answer = _.get(accessNeeds, 'isInterpreterServicesNeeded', null);
    return res.render('templates/radio-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.accessNeeds,
      formAction: paths.awaitingCmaRequirements.accessNeedsInterpreter,
      pageTitle: i18n.pages.cmaRequirements.accessNeedsSection.needInterpreterPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.cmaRequirements.accessNeedsSection.needInterpreterPage.title
      }
    });
  } catch (error) {
    next(error);
  }
}

function postNeedInterpreterPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.accessNeeds.selectInterpreter;
      const pageContent = {
        previousPage: paths.awaitingCmaRequirements.accessNeeds,
        formAction: paths.awaitingCmaRequirements.accessNeedsInterpreter,
        pageTitle: i18n.pages.cmaRequirements.accessNeedsSection.needInterpreterPage.pageTitle,
        question: {
          options: yesOrNoOption(null),
          title: i18n.pages.cmaRequirements.accessNeedsSection.needInterpreterPage.title,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        if (answer) {
          req.session.appeal.cmaRequirements = {
            ...req.session.appeal.cmaRequirements,
            accessNeeds: {
              ...req.session.appeal.cmaRequirements.accessNeeds,
              isInterpreterServicesNeeded: true
            }
          };
          await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
          return res.redirect(paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage);
        } else {
          req.session.appeal.cmaRequirements = {
            ...req.session.appeal.cmaRequirements,
            accessNeeds: {
              ...req.session.appeal.cmaRequirements.accessNeeds,
              isInterpreterServicesNeeded: false
            }
          };
          await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
          return res.redirect(paths.awaitingCmaRequirements.accessNeedsStepFreeAccess);
        }
      };

      return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function getAdditionalLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-management-appointment/additional-language.njk', {
      previousPage: paths.awaitingCmaRequirements.accessNeedsInterpreter,
      items: isoLanguages
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
      const validation = selectedRequiredValidation(req.body, i18n.validationErrors.cmaRequirements.accessNeeds.addLanguage);
      if (validation) {
        return res.render('case-management-appointment/additional-language.njk', {
          items: isoLanguages,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.taskList
        });
      }
      let interpreterLanguages: InterpreterLanguage[] = req.session.appeal.cmaRequirements.accessNeeds.interpreterLanguage || [];
      interpreterLanguages.push({
        language: req.body['language'],
        languageDialect: req.body['dialect']
      });
      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        accessNeeds: {
          ...req.session.appeal.cmaRequirements.accessNeeds,
          interpreterLanguage: interpreterLanguages
        }
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.accessNeedsStepFreeAccess);

    } catch (error) {
      next(error);
    }
  };
}

function getStepFreeAccessPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { isHearingRoomNeeded, isInterpreterServicesNeeded } = req.session.appeal.cmaRequirements.accessNeeds;
    const backButton = isInterpreterServicesNeeded === true ? paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage : paths.awaitingCmaRequirements.accessNeedsInterpreter;
    const answer = isHearingRoomNeeded || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: backButton,
      formAction: paths.awaitingCmaRequirements.accessNeedsStepFreeAccess,
      pageTitle: i18n.pages.cmaRequirements.accessNeedsSection.stepFreeAccessPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.cmaRequirements.accessNeedsSection.stepFreeAccessPage.title,
        hint: i18n.pages.cmaRequirements.accessNeedsSection.stepFreeAccessPage.text,
        name: 'answer'
      }
    });
  } catch (error) {
    next(error);
  }
}

function postStepFreeAccessPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.accessNeeds.stepFreeAccess;
      const pageContent = {
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        formAction: paths.awaitingCmaRequirements.accessNeedsStepFreeAccess,
        pageTitle: i18n.pages.cmaRequirements.accessNeedsSection.stepFreeAccessPage.pageTitle,
        question: {
          options: yesOrNoOption(null),
          title: i18n.pages.cmaRequirements.accessNeedsSection.stepFreeAccessPage.title,
          hint: i18n.pages.cmaRequirements.accessNeedsSection.stepFreeAccessPage.text,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.cmaRequirements = {
          ...req.session.appeal.cmaRequirements,
          accessNeeds: {
            ...req.session.appeal.cmaRequirements.accessNeeds,
            isHearingRoomNeeded: answer
          }
        };
        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.accessNeedsHearingLoop);
      };
      return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function getHearingLoopPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { isHearingLoopNeeded } = req.session.appeal.cmaRequirements.accessNeeds;
    const answer = isHearingLoopNeeded || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.accessNeedsStepFreeAccess,
      formAction: paths.awaitingCmaRequirements.accessNeedsHearingLoop,
      pageTitle: i18n.pages.cmaRequirements.accessNeedsSection.hearingLoopPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.cmaRequirements.accessNeedsSection.hearingLoopPage.title,
        hint: i18n.pages.cmaRequirements.accessNeedsSection.hearingLoopPage.text,
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

      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.accessNeeds.hearingLoop;
      const pageContent = {
        previousPage: paths.awaitingCmaRequirements.accessNeedsStepFreeAccess,
        formAction: paths.awaitingCmaRequirements.accessNeedsHearingLoop,
        pageTitle: i18n.pages.cmaRequirements.accessNeedsSection.hearingLoopPage.pageTitle,
        question: {
          options: yesOrNoOption(null),
          title: i18n.pages.cmaRequirements.accessNeedsSection.hearingLoopPage.title,
          hint: i18n.pages.cmaRequirements.accessNeedsSection.hearingLoopPage.text,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.cmaRequirements = {
          ...req.session.appeal.cmaRequirements,
          accessNeeds: {
            ...req.session.appeal.cmaRequirements.accessNeeds,
            isHearingLoopNeeded: answer
          }
        };
        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.taskList);
      };

      return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function setupAccessNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.accessNeeds, middleware, getAccessNeeds);
  router.get(paths.awaitingCmaRequirements.accessNeedsInterpreter, middleware, getNeedInterpreterPage);
  router.post(paths.awaitingCmaRequirements.accessNeedsInterpreter, middleware, postNeedInterpreterPage(updateAppealService));
  router.get(paths.awaitingCmaRequirements.accessNeedsStepFreeAccess, middleware, getStepFreeAccessPage);
  router.post(paths.awaitingCmaRequirements.accessNeedsStepFreeAccess, middleware, postStepFreeAccessPage(updateAppealService));
  router.get(paths.awaitingCmaRequirements.accessNeedsHearingLoop, middleware, getHearingLoopPage);
  router.post(paths.awaitingCmaRequirements.accessNeedsHearingLoop, middleware, postHearingLoopPage(updateAppealService));
  router.get(paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage, middleware, getAdditionalLanguage);
  router.post(paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage, middleware, postAdditionalLanguage(updateAppealService));
  return router;
}

export {
  setupAccessNeedsController,
  getAccessNeeds,
  getNeedInterpreterPage,
  getAdditionalLanguage,
  getStepFreeAccessPage,
  getHearingLoopPage,
  postStepFreeAccessPage,
  postHearingLoopPage,
  postAdditionalLanguage,
  postNeedInterpreterPage
};
