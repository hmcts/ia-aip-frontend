import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { isoLanguages } from '../../data/isoLanguages';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { selectedRequiredValidation, yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

const list = (answer: string) => [
  { text: 'No', value: 'no', checked: answer === 'no' },
  { text: 'Yes', value: 'yes', checked: answer === 'yes' }
];

function getAccessNeeds(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-management-appointment/access-needs-page.njk', {
      previousPage: paths.appealStarted.taskList
    });
  } catch (error) {
    next(error);
  }
}

function getNeedInterpreterPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { cmaRequirements } = req.session.appeal;
    const answer = cmaRequirements && cmaRequirements.isInterpreterServicesNeeded || null;
    return res.render('case-management-appointment/need-interpreter.njk', {
      list: list(answer),
      previousPage: paths.caseManagementAppointment.accessNeeds
    });
  } catch (error) {
    next(error);
  }
}
function postNeedInterpreterPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cmaRequirements } = req.session.appeal;
      const answer = cmaRequirements && cmaRequirements.isInterpreterServicesNeeded || null;
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = yesOrNoRequiredValidation(req.body,i18n.validationErrors.selectInterpreter);
      if (validation) {
        return res.render('case-management-appointment/need-interpreter.njk', {
          list: list(answer),
          errors: validation,
          errorList: Object.values(validation),
          previousPage:  paths.caseManagementAppointment.accessNeeds
        });
      }
      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        isInterpreterServicesNeeded: req.body.answer
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.caseManagementAppointment.additionalLanguage);

    } catch (error) {
      next(error);
    }
  };
}

function getAdditionalLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-management-appointment/additional-language.njk', {
      previousPage: paths.caseManagementAppointment.needInterpreter,
      items: isoLanguages
    });
  } catch (error) {
    next(error);
  }
}

function postAdditionalLanguage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cmaRequirements } = req.session.appeal;
      const answer = cmaRequirements && cmaRequirements.isInterpreterServicesNeeded || null;
      if (!shouldValidateWhenSaveForLater(req.body, ['language','dialect'])) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = selectedRequiredValidation(req.body,i18n.validationErrors.addLanguage);
      if (validation) {
        return res.render('case-management-appointment/additional-language.njk', {
          items: isoLanguages,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.taskList
        });
      }
      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        interpreterLanguage: {
          language: req.body.language,
          dialect: req.body.dialect
        }
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.caseManagementAppointment.stepFreeAccess);

    } catch (error) {
      next(error);
    }
  };
}

function getStepFreeAccessPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { cmaRequirements } = req.session.appeal;
    const answer = cmaRequirements && cmaRequirements.isHearingRoomNeeded || null;
    return res.render('case-management-appointment/step-free-access.njk', {
      previousPage: paths.appealStarted.taskList,
      list: list(answer)

    });
  } catch (error) {
    next(error);
  }
}

function postStepFreeAccessPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cmaRequirements } = req.session.appeal;
      const answer = cmaRequirements && cmaRequirements.isHearingRoomNeeded || null;
      if (!shouldValidateWhenSaveForLater(req.body, 'stepFreeAccess')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = yesOrNoRequiredValidation(req.body,i18n.validationErrors.stepFreeAccess);
      if (validation) {
        return res.render('case-management-appointment/step-free-access.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.caseManagementAppointment.additionalLanguage,
          list: list(answer)

        });
      }

      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        isHearingRoomNeeded: req.body.answer
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.caseManagementAppointment.hearingLoop);

    } catch (error) {
      next(error);
    }
  };
}

function getHearingLoopPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { cmaRequirements } = req.session.appeal;
    const answer = cmaRequirements && cmaRequirements.isHearingLoopNeeded || null;
    return res.render('case-management-appointment/hearing-loop.njk', {
      previousPage: paths.caseManagementAppointment.stepFreeAccess,
      list: list(answer)
    });
  } catch (error) {
    next(error);
  }
}

function postHearingLoopPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cmaRequirements } = req.session.appeal;
      const answer = cmaRequirements && cmaRequirements.isHearingLoopNeeded || null;
      if (!shouldValidateWhenSaveForLater(req.body, 'hearingLoop')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.hearingLoop);
      if (validation) {
        return res.render('case-management-appointment/hearing-loop.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.caseManagementAppointment.stepFreeAccess,
          list: list(answer)

        });
      }
      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        isHearingLoopNeeded: req.body.answer
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      await updateAppealService.submitEvent(Events.SUBMIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.caseManagementAppointment.accessNeeds);

    } catch (error) {
      next(error);
    }
  };
}

function setupAccessNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.caseManagementAppointment.accessNeeds, getAccessNeeds);
  router.get(paths.caseManagementAppointment.needInterpreter, getNeedInterpreterPage);
  router.get(paths.caseManagementAppointment.stepFreeAccess , getStepFreeAccessPage);
  router.get(paths.caseManagementAppointment.hearingLoop, getHearingLoopPage);
  router.get(paths.caseManagementAppointment.additionalLanguage, getAdditionalLanguage);
  router.post(paths.caseManagementAppointment.needInterpreter, postNeedInterpreterPage(updateAppealService));
  router.post(paths.caseManagementAppointment.additionalLanguage, postAdditionalLanguage(updateAppealService));
  router.post(paths.caseManagementAppointment.hearingLoop, postHearingLoopPage(updateAppealService));
  router.post(paths.caseManagementAppointment.stepFreeAccess, postStepFreeAccessPage(updateAppealService));
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
