import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { postHearingRequirementsYesNoHandler } from './common';

const previousPage = paths.submitHearingRequirements.hearingWitnessNames;
const pageTitle = i18n.pages.hearingRequirements.witnessesSection.witnessOutsideUk.title;
const formAction = paths.submitHearingRequirements.witnessOutsideUK;
const yesOrNoOption = (answer: boolean) => [
  { text: 'Yes', value: 'yes', checked: answer === true },
  { text: 'No', value: 'no', checked: answer === false }
];

function getWitnessesOutsideUkQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const answer = req.session.appeal.hearingRequirements.witnessesOutsideUK;
    const question = {
      name: 'answer',
      title: i18n.pages.hearingRequirements.witnessesSection.witnessOutsideUk.title,
      hint: i18n.pages.hearingRequirements.witnessesSection.witnessOutsideUk.text,
      options: yesOrNoOption(answer)
    };
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

function postWitnessesOutsideUkQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.witnessesSection.witnessesOutsideUKRequired;
      const pageContent = {
        previousPage: previousPage,
        pageTitle: pageTitle,
        formAction: formAction,
        question: {
          name: 'answer',
          title: i18n.pages.hearingRequirements.witnessesSection.witnessOutsideUk.title,
          hint: i18n.pages.hearingRequirements.witnessesSection.witnessOutsideUk.text,
          options: yesOrNoOption(null)
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.hearingRequirements.witnessesOutsideUK = answer;
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.submitHearingRequirements.taskList);
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupWitnessesOutsideUkQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.witnessOutsideUK, middleware, getWitnessesOutsideUkQuestion);
  router.post(paths.submitHearingRequirements.witnessOutsideUK, middleware, postWitnessesOutsideUkQuestion(updateAppealService));

  return router;
}

export {
    setupWitnessesOutsideUkQuestionController,
    getWitnessesOutsideUkQuestion,
    postWitnessesOutsideUkQuestion
};
