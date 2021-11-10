import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { postHearingRequirementsYesNoHandler } from './common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.hearingRequirements.witnessesSection.witnessOutsideUk.title;
const formAction = paths.submitHearingRequirements.witnessOutsideUK;
const question = {
  title: i18n.pages.hearingRequirements.witnessesSection.witnessOutsideUk.title,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getWitnessesOutsideUkQuestion(req: Request, res: Response, next: NextFunction) {
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

function postWitnessesOutsideUkQuestion() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.witnessesSection.witnessesOutsideUKRequired;
      const pageContent = {
        previousPage,
        pageTitle,
        formAction,
        question,
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        // req.session.appeal.hearingRequirements.witnessesOnHearing = answer;
        return res.redirect(paths.submitHearingRequirements.taskList);
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupWitnessesOutsideUkQuestionController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.witnessOutsideUK, middleware, getWitnessesOutsideUkQuestion);
  router.post(paths.submitHearingRequirements.witnessOutsideUK, middleware, postWitnessesOutsideUkQuestion());

  return router;
}

export {
    setupWitnessesOutsideUkQuestionController,
    getWitnessesOutsideUkQuestion,
    postWitnessesOutsideUkQuestion
};
