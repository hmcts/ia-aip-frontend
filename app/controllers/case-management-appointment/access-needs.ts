import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { isoLanguages } from '../../data/isoLanguages';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { selectedRequiredValidation, yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

const yesOrNoOption = (answer: string) => [
  { text: 'No', value: 'no', checked: answer === 'no' },
  { text: 'Yes', value: 'yes', checked: answer === 'yes' }
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
    const { cmaRequirements } = req.session.appeal;
    const answer = cmaRequirements && cmaRequirements.isInterpreterServicesNeeded || null;
    return res.render('case-management-appointment/need-interpreter.njk', {
      list: yesOrNoOption(answer),
      previousPage: paths.awaitingCmaRequirements.accessNeeds
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
      const validation = yesOrNoRequiredValidation(req.body,i18n.validationErrors.selectInterpreter);
      if (validation) {
        return res.render('case-management-appointment/need-interpreter.njk', {
          list: yesOrNoOption(answer),
          errors: validation,
          errorList: Object.values(validation),
          previousPage:  paths.awaitingCmaRequirements.accessNeeds
        });
      }
      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        isInterpreterServicesNeeded: req.body.answer
      };
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
      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        interpreterLanguage: {
          language: req.body.language,
          dialect: req.body.dialect
        }
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
    const { cmaRequirements } = req.session.appeal;
    const backButton = cmaRequirements.isInterpreterServicesNeeded === 'yes' ? paths.awaitingCmaRequirements.additionalLanguage : paths.awaitingCmaRequirements.needInterpreter;
    const answer = cmaRequirements && cmaRequirements.isHearingRoomNeeded || null;
    return res.render('case-management-appointment/step-free-access.njk', {
      previousPage: backButton,
      list: yesOrNoOption(answer)

    });
  } catch (error) {
    next(error);
  }
}

function postStepFreeAccessPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cmaRequirements } = req.session.appeal;
      const backButton = cmaRequirements.isInterpreterServicesNeeded === 'yes' ? paths.awaitingCmaRequirements.additionalLanguage : paths.awaitingCmaRequirements.needInterpreter;
      const answer = cmaRequirements && cmaRequirements.isHearingRoomNeeded || null;
      const validation = yesOrNoRequiredValidation(req.body,i18n.validationErrors.stepFreeAccess);
      if (validation) {
        return res.render('case-management-appointment/step-free-access.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: backButton,
          list: yesOrNoOption(answer)

        });
      }

      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        isHearingRoomNeeded: req.body.answer
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.hearingLoop);

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
      previousPage: paths.awaitingCmaRequirements.stepFreeAccess,
      list: yesOrNoOption(answer)
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
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.hearingLoop);
      if (validation) {
        return res.render('case-management-appointment/hearing-loop.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.awaitingCmaRequirements.stepFreeAccess,
          list: yesOrNoOption(answer)

        });
      }
      req.session.appeal.cmaRequirements = {
        ...req.session.appeal.cmaRequirements,
        isHearingLoopNeeded: req.body.answer
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      await updateAppealService.submitEvent(Events.SUBMIT_CMA_REQUIREMENTS, req);
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
