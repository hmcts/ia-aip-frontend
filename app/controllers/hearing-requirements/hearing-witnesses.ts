import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { postHearingRequirementsYesNoHandler } from './common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.hearingRequirements.witnessesSection.hearingWitnesses.title;
const formAction = paths.submitHearingRequirements.witnesses;
const question = {
  name: 'answer',
  title: i18n.pages.hearingRequirements.witnessesSection.hearingWitnesses.title,
  hint: i18n.pages.hearingRequirements.witnessesSection.hearingWitnesses.text,
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

function postWitnessesOnHearingQuestion(updateAppealService: UpdateAppealService) {
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
        req.session.appeal.hearingRequirements.witnessesOnHearing = answer;

        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        if (answer) {
          return res.redirect(paths.submitHearingRequirements.hearingWitnessNames);
        } else {
          return res.redirect(paths.submitHearingRequirements.witnessOutsideUK);
        }
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupWitnessesOnHearingQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.witnesses, middleware, getWitnessesOnHearingQuestion);
  router.post(paths.submitHearingRequirements.witnesses, middleware, postWitnessesOnHearingQuestion(updateAppealService));

  return router;
}

export {
    setupWitnessesOnHearingQuestionController,
    getWitnessesOnHearingQuestion,
    postWitnessesOnHearingQuestion
};
