import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.cmaRequirements.otherNeedsSection.healthConditions.title;
const formAction = paths.awaitingCmaRequirements.otherNeedsHealthConditions;
const question = {
  title: i18n.pages.cmaRequirements.otherNeedsSection.healthConditions.question,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getHealthConditionsQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('templates/radio-question-page.njk', {
      previousPage,
      pageTitle,
      formAction,
      question,
      saveAndContinue: true
    });
  } catch (e) {
    next(e);
  }
}

function postHealthConditionsQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.healthConditionsAnswerRequired;

    const pageContent = {
      previousPage,
      pageTitle,
      formAction,
      question,
      saveAndContinue: true
    };

    const onSuccess = async (answer: boolean) => {
      if (answer) {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          healthConditions: true
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason);
      } else {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          healthConditions: false
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsPastExperiences);
      }
    };

    return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}
function setupHealthConditionsQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsHealthConditions, middleware, getHealthConditionsQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsHealthConditions, middleware, postHealthConditionsQuestion(updateAppealService));

  return router;
}

export {
  setupHealthConditionsQuestionController,
  getHealthConditionsQuestion,
  postHealthConditionsQuestion
};
