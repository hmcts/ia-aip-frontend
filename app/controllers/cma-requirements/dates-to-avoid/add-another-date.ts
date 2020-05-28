import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = paths.awaitingCmaRequirements.datesToAvoidReason;
const pageTitle = i18n.pages.cmaRequirements.datesToAvoidSection.addAnotherDateQuestion.title;
const formAction = paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate;
const question = {
  title: i18n.pages.cmaRequirements.datesToAvoidSection.addAnotherDateQuestion.heading,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getAddAnotherDateQuestionPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/radio-question-page.njk', {
      previousPage,
      pageTitle,
      formAction,
      question
    });
  } catch (e) {
    next(e);
  }
}

function postAddAnotherDateQuestionPage(req: Request, res: Response, next: NextFunction) {

  const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.datesToAvoid.addAnotherDateAnswerRequired;

  const pageContent = {
    previousPage,
    pageTitle,
    formAction,
    question
  };

  return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, req, res, next);
}

function setupDatesToAvoidAddAnotherDateController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate, middleware, getAddAnotherDateQuestionPage);
  router.post(paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate, middleware, postAddAnotherDateQuestionPage);

  return router;
}

export {
  setupDatesToAvoidAddAnotherDateController,
  getAddAnotherDateQuestionPage,
  postAddAnotherDateQuestionPage
};
