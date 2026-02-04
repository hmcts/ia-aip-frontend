import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postHearingRequirementsYesNoHandler, setCheckedAttributeToQuestion } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.hearingRequirements.otherNeedsSection.privateHearing.title;
const formAction = paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion;

function getPrivateHearingQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const question = getQuestion(req.session.appeal);
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

function getQuestion(appeal: Appeal) {
  const present = _.has(appeal, 'hearingRequirements.otherNeeds.privateAppointment') || null;
  const question = {
    name: 'answer',
    title: i18n.pages.hearingRequirements.otherNeedsSection.privateHearing.question,
    hint: i18n.pages.hearingRequirements.otherNeedsSection.privateHearing.description,
    options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
  };

  if (present) {
    const privateHearingAnswered = appeal.hearingRequirements.otherNeeds.privateAppointment;
    setCheckedAttributeToQuestion(question, privateHearingAnswered);
  }
  return question;
}

function postPrivateHearingQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.otherNeeds.privateAppointmentAnswerRequired;
      const question = getQuestion(req.session.appeal);
      const pageContent = {
        previousPage,
        pageTitle,
        formAction,
        question,
        saveAndContinue: true
      };
      const onSuccess = async (answer: boolean) => {
        req.session.appeal.hearingRequirements.otherNeeds = {
          ...req.session.appeal.hearingRequirements.otherNeeds,
          privateAppointment: answer
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        if (answer) {
          return res.redirect(paths.submitHearingRequirements.otherNeedsPrivateHearingReason);
        } else {
          return res.redirect(paths.submitHearingRequirements.otherNeedsHealthConditions);
        }
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}
function setupPrivateHearingQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion, middleware, getPrivateHearingQuestion);
  router.post(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion, middleware, postPrivateHearingQuestion(updateAppealService));

  return router;
}

export {
  getPrivateHearingQuestion,
  postPrivateHearingQuestion,
  setupPrivateHearingQuestionController
};
