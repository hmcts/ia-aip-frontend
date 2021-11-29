import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postHearingRequirementsYesNoHandlerWithTemplate, setCheckedAttributeToQuestion } from '../common';

const previousPage = paths.submitHearingRequirements.otherNeeds;
const pageTitle = i18n.pages.hearingRequirements.otherNeedsSection.joinHearingByVideoCall.title;
const formAction = paths.submitHearingRequirements.otherNeedsVideoAppointment;

function getJoinHearingByVideoCallQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const question = getQuestion(req.session.appeal);
    return res.render('hearing-requirements/other-needs/join-hearing-by-videocall.njk', {
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
  const present = _.has(appeal, 'hearingRequirements.otherNeeds.remoteVideoCall') || null;
  const question = {
    name: 'answer',
    title: i18n.pages.hearingRequirements.otherNeedsSection.joinHearingByVideoCall.question,
    hint: i18n.pages.hearingRequirements.otherNeedsSection.joinHearingByVideoCall.description,
    options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
  };

  if (present) {
    const joinHearingByVideoCall = appeal.hearingRequirements.otherNeeds.remoteVideoCall;
    setCheckedAttributeToQuestion(question, joinHearingByVideoCall);
  }
  return question;
}

function postJoinHearingByVideoCallQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.otherNeeds.joinHearingByVideoCallRequired;
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
          remoteVideoCall: answer
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        if (answer) {
          return res.redirect(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion);
        } else {
          return res.redirect(paths.submitHearingRequirements.otherNeedsVideoAppointmentReason);
        }
      };

      return postHearingRequirementsYesNoHandlerWithTemplate(pageContent, onValidationErrorMessage, onSuccess, req, res, next, 'hearing-requirements/other-needs/join-hearing-by-videocall.njk');
    } catch (e) {
      next(e);
    }
  };
}
function setupJoinByVideoCallAppointmentQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeedsVideoAppointment, middleware, getJoinHearingByVideoCallQuestion);
  router.post(paths.submitHearingRequirements.otherNeedsVideoAppointment, middleware, postJoinHearingByVideoCallQuestion(updateAppealService));

  return router;
}

export {
  setupJoinByVideoCallAppointmentQuestionController,
  getJoinHearingByVideoCallQuestion,
  postJoinHearingByVideoCallQuestion
};
