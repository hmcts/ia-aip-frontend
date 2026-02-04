import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postHearingRequirementsYesNoHandler, setCheckedAttributeToQuestion } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.hearingRequirements.otherNeedsSection.singleSexTypeHearing.title;
const formAction = paths.submitHearingRequirements.otherNeedsSingleSexTypeHearing;

function getQuestion(appeal: Appeal) {
  const present = _.has(appeal, 'hearingRequirements.otherNeeds.singleSexTypeAppointment') || null;
  const question = {
    name: 'answer',
    title: i18n.pages.hearingRequirements.otherNeedsSection.singleSexTypeHearing.question,
    options: [{ value: 'yes', text: 'All male' }, { value: 'no', text: 'All female' }]
  };

  if (present) {
    const singleSexTypeAppointment = appeal.hearingRequirements.otherNeeds.singleSexTypeAppointment;
    setCheckedAttributeToQuestion(question, singleSexTypeAppointment === 'All male');
  }
  return question;
}

function getSingleSexTypeHearingQuestion(req: Request, res: Response, next: NextFunction) {
  const question = getQuestion(req.session.appeal);
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

function postSingleSexTypeHearingQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.otherNeeds.singleSexTypeHearingRequired;
    const question = getQuestion(req.session.appeal);
    const pageContent = {
      previousPage,
      pageTitle,
      formAction,
      question,
      saveAndContinue: true
    };

    const onSuccess = async (answer: boolean) => {
      if (answer) {
        req.session.appeal.hearingRequirements.otherNeeds = {
          ...req.session.appeal.hearingRequirements.otherNeeds,
          singleSexTypeAppointment: 'All male'
        };
      } else {
        req.session.appeal.hearingRequirements.otherNeeds = {
          ...req.session.appeal.hearingRequirements.otherNeeds,
          singleSexTypeAppointment: 'All female'
        };
      }
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      if (answer) {
        return res.redirect(paths.submitHearingRequirements.otherNeedsAllMaleHearing);
      } else {
        return res.redirect(paths.submitHearingRequirements.otherNeedsAllFemaleHearing);
      }
    };

    return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}
function setupSingleSexTypeHearingQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeedsSingleSexTypeHearing, middleware, getSingleSexTypeHearingQuestion);
  router.post(paths.submitHearingRequirements.otherNeedsSingleSexTypeHearing, middleware, postSingleSexTypeHearingQuestion(updateAppealService));

  return router;
}

export {
  setupSingleSexTypeHearingQuestionController,
  getSingleSexTypeHearingQuestion,
  postSingleSexTypeHearingQuestion
};
