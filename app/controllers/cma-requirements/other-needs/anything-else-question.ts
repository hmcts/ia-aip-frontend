import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.cmaRequirements.otherNeedsSection.anythingElse.title;
const formAction = paths.awaitingCmaRequirements.otherNeedsAnythingElse;
const question = {
  title: i18n.pages.cmaRequirements.otherNeedsSection.anythingElse.question,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getAnythingElseQuestion(req: Request, res: Response, next: NextFunction) {
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

function postAnythingElseQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.anythingElseAnswerRequired;

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
          anythingElse: true
        };
        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsAnythingElseReasons);
      } else {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          anythingElse: false
        };
        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.taskList);
      }
    };

    return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}
function setupAnythingElseQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsAnythingElse, middleware, getAnythingElseQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsAnythingElse, middleware, postAnythingElseQuestion(updateAppealService));

  return router;
}

export {
  setupAnythingElseQuestionController,
  getAnythingElseQuestion,
  postAnythingElseQuestion
};
