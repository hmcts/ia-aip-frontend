import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { isoLanguages } from '../../data/isoLanguages';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { selectedRequiredValidation, yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

const yesOrNoOption = (answer: string) => [
  { text: 'Yes', value: 'yes', checked: answer === 'yes' },
  { text: 'No', value: 'no', checked: answer === 'no' }
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
    const { isInterpreterServicesNeeded } = req.session.appeal;
    const answer = isInterpreterServicesNeeded || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.accessNeeds,
      formAction: paths.awaitingCmaRequirements.needInterpreter,
      pageTitle: i18n.pages.needInterpreterPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.needInterpreterPage.title
      }
    });
  } catch (error) {
    next(error);
  }
}
function postNeedInterpreterPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isInterpreterServicesNeeded } = req.session.appeal;
      const answer = isInterpreterServicesNeeded || null;
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.selectInterpreter);
      if (validation) {
        return res.render('templates/radio-question-page.njk', {
          previousPage: paths.awaitingCmaRequirements.accessNeeds,
          formAction: paths.awaitingCmaRequirements.needInterpreter,
          pageTitle: i18n.pages.needInterpreterPage.pageTitle,
          saveAndContinue: true,
          question: {
            options: yesOrNoOption(answer),
            title: i18n.pages.needInterpreterPage.title,
            name: 'answer'
          },
          errors: validation,
          errorList: Object.values(validation)
        });
      }
      req.session.appeal.isInterpreterServicesNeeded = req.body.answer;
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      if (req.body.answer === 'no') {
        return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.stepFreeAccess);
      } else {
        return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.additionalLanguage);
      }
    } catch (error) {
      next(error);
    }
  };
}

function getAdditionalLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-management-appointment/additional-language.njk', {
      previousPage: paths.awaitingCmaRequirements.needInterpreter,
      items: isoLanguages
    });
  } catch (error) {
    next(error);
  }
}

function postAdditionalLanguage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = selectedRequiredValidation(req.body,i18n.validationErrors.addLanguage);
      if (validation) {
        return res.render('case-management-appointment/additional-language.njk', {
          items: isoLanguages,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.taskList
        });
      }
      req.session.appeal.interpreterLanguage = {
        language: req.body.language,
        dialect: req.body.dialect
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.stepFreeAccess);

    } catch (error) {
      next(error);
    }
  };
}

function getStepFreeAccessPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { isHearingRoomNeeded, isInterpreterServicesNeeded } = req.session.appeal;
    const backButton = isInterpreterServicesNeeded === 'yes' ? paths.awaitingCmaRequirements.additionalLanguage : paths.awaitingCmaRequirements.needInterpreter;
    const answer = isHearingRoomNeeded || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: backButton,
      formAction:  paths.awaitingCmaRequirements.stepFreeAccess,
      pageTitle: i18n.pages.stepFreeAccessPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.stepFreeAccessPage.title,
        hint: i18n.pages.stepFreeAccessPage.text,
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
      const { isHearingRoomNeeded, isInterpreterServicesNeeded } = req.session.appeal;
      const backButton = isInterpreterServicesNeeded === 'yes' ? paths.awaitingCmaRequirements.additionalLanguage : paths.awaitingCmaRequirements.needInterpreter;
      const answer = isHearingRoomNeeded || null;
      const validation = yesOrNoRequiredValidation(req.body,i18n.validationErrors.stepFreeAccess);
      if (validation) {
        return res.render('templates/radio-question-page.njk', {
          previousPage: backButton,
          formAction:  paths.awaitingCmaRequirements.stepFreeAccess,
          pageTitle: i18n.pages.stepFreeAccessPage.pageTitle,
          saveAndContinue: true,
          question: {
            options: yesOrNoOption(answer),
            title: i18n.pages.stepFreeAccessPage.title,
            hint: i18n.pages.stepFreeAccessPage.text,
            name: 'answer'
          },
          errors: validation,
          errorList: Object.values(validation)
        });
      }
      req.session.appeal.isHearingRoomNeeded = req.body.answer;
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.hearingLoop);
    } catch (error) {
      next(error);
    }
  };
}

function getHearingLoopPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { isHearingLoopNeeded } = req.session.appeal;
    const answer = isHearingLoopNeeded || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.stepFreeAccess,
      formAction:  paths.awaitingCmaRequirements.hearingLoop,
      pageTitle: i18n.pages.hearingLoopPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: yesOrNoOption(answer),
        title: i18n.pages.hearingLoopPage.title,
        hint: i18n.pages.hearingLoopPage.text,
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
      const { isHearingLoopNeeded } = req.session.appeal;
      const answer = isHearingLoopNeeded || null;
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.hearingLoop);
      if (validation) {
        return res.render('templates/radio-question-page.njk', {
          previousPage: paths.awaitingCmaRequirements.stepFreeAccess,
          formAction:  paths.awaitingCmaRequirements.hearingLoop,
          pageTitle: i18n.pages.hearingLoopPage.pageTitle,
          saveAndContinue: true,
          question: {
            options: yesOrNoOption(answer),
            title: i18n.pages.hearingLoopPage.title,
            hint: i18n.pages.hearingLoopPage.text,
            name: 'answer'
          },
          errors: validation,
          errorList: Object.values(validation)
        });
      }
      req.session.appeal.isHearingLoopNeeded = req.body.answer;
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.accessNeeds);

    } catch (error) {
      next(error);
    }
  };
}

function setupAccessNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.accessNeeds,middleware, getAccessNeeds);
  router.get(paths.awaitingCmaRequirements.needInterpreter,middleware, getNeedInterpreterPage);
  router.get(paths.awaitingCmaRequirements.stepFreeAccess ,middleware, getStepFreeAccessPage);
  router.get(paths.awaitingCmaRequirements.hearingLoop,middleware, getHearingLoopPage);
  router.get(paths.awaitingCmaRequirements.additionalLanguage,middleware, getAdditionalLanguage);
  router.post(paths.awaitingCmaRequirements.needInterpreter,middleware, postNeedInterpreterPage(updateAppealService));
  router.post(paths.awaitingCmaRequirements.additionalLanguage,middleware, postAdditionalLanguage(updateAppealService));
  router.post(paths.awaitingCmaRequirements.hearingLoop,middleware, postHearingLoopPage(updateAppealService));
  router.post(paths.awaitingCmaRequirements.stepFreeAccess,middleware, postStepFreeAccessPage(updateAppealService));
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
