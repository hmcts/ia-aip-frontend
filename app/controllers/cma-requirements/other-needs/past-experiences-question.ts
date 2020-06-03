import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.cmaRequirements.otherNeedsSection.pastExperiences.title;
const formAction = paths.awaitingCmaRequirements.otherNeedsPastExperiences;
const question = {
  title: i18n.pages.cmaRequirements.otherNeedsSection.pastExperiences.question,
  description: i18n.pages.cmaRequirements.otherNeedsSection.pastExperiences.description,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getPastExperiencesQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('templates/radio-question-page.njk', {
      previousPage,
      pageTitle,
      formAction,
      question
    });
  } catch (e) {
    next(e);
  }
}

function postPastExperiencesQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.pastExperiencesAnswerRequired;

    const pageContent = {
      previousPage,
      pageTitle,
      formAction,
      question
    };

    const onSuccess = (answer: boolean) => {
      if (answer) {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          pastExperiences: true
        };

        // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

        return res.redirect(paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons);
      } else {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          pastExperiences: false
        };

        // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

        return res.redirect(paths.awaitingCmaRequirements.otherNeedsAnythingElse);
      }
    };

    return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}
function setupPastExperiencesQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsPastExperiences, middleware, getPastExperiencesQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsPastExperiences, middleware, postPastExperiencesQuestion(updateAppealService));

  return router;
}

export {
  setupPastExperiencesQuestionController,
  getPastExperiencesQuestion,
  postPastExperiencesQuestion
};
