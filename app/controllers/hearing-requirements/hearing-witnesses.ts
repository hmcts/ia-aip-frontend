import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { postHearingRequirementsYesNoHandler } from './common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.hearingRequirements.witnessesSection.hearingWitnesses.title;
const formAction = paths.submitHearingRequirements.witnesses;
const question = {
  title: i18n.pages.hearingRequirements.witnessesSection.hearingWitnesses.title,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getWitnessesOnHearingQuestion(req: Request, res: Response, next: NextFunction) {
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

function postWitnessesOnHearingQuestion() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.witnessesSection.witnessesOnHearingRequired;
      const pageContent = {
        previousPage,
        pageTitle,
        formAction,
        question,
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        console.log('answer::' + answer);
        if (answer) {
          // req.session.appeal.hearingRequirements.witnessesOnHearing = true;
          return res.redirect(paths.submitHearingRequirements.hearingWitnessNames);
        } else {
          // req.session.appeal.hearingRequirements.witnessesOnHearing = false;
          return res.redirect(paths.submitHearingRequirements.witnessOutsideUK);
        }
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupWitnessesOnHearingQuestionController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.witnesses, middleware, getWitnessesOnHearingQuestion);
  router.post(paths.submitHearingRequirements.witnesses, middleware, postWitnessesOnHearingQuestion());

  return router;
}

export {
    setupWitnessesOnHearingQuestionController,
    getWitnessesOnHearingQuestion,
    postWitnessesOnHearingQuestion
};
