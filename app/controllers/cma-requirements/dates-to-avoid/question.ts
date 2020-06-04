import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = paths.awaitingCmaRequirements.taskList;
const pageTitle = i18n.pages.cmaRequirements.datesToAvoidSection.questionPage.title;
const formAction = paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate;
const question = {
  title: i18n.pages.cmaRequirements.datesToAvoidSection.questionPage.question,
  description: i18n.pages.cmaRequirements.datesToAvoidSection.questionPage.description,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getDatesToAvoidQuestion(req: Request, res: Response, next: NextFunction) {
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

function postDatesToAvoidQuestion(req: Request, res: Response, next: NextFunction) {

  const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.datesToAvoid.datesToAvoidAnswerRequired;

  const pageContent = {
    previousPage,
    pageTitle,
    formAction,
    question
  };

  const onSuccess = (answer: boolean) => {
    if (answer) {
      return res.redirect(paths.awaitingCmaRequirements.datesToAvoidEnterDate);
    } else {
      return res.redirect(paths.awaitingCmaRequirements.taskList);
    }
  };

  return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
}

function setupDatesToAvoidQuestionController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.datesToAvoidQuestion, middleware, getDatesToAvoidQuestion);
  router.post(paths.awaitingCmaRequirements.datesToAvoidQuestion, middleware, postDatesToAvoidQuestion);

  return router;
}

export {
  setupDatesToAvoidQuestionController,
  getDatesToAvoidQuestion,
  postDatesToAvoidQuestion
};
