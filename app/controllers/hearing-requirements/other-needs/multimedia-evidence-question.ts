import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postHearingRequirementsYesNoHandler, setCheckedAttributeToQuestion } from '../common';

const previousPage = paths.submitHearingRequirements.otherNeedsVideoAppointment;
const pageTitle = i18n.pages.hearingRequirements.otherNeedsSection.multimediaEvidence.title;
const formAction = paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion;
function getHearingMultimediaEvidenceQuestion(req: Request, res: Response, next: NextFunction) {
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
  const present = _.has(appeal, 'hearingRequirements.otherNeeds.multimediaEvidence') || null;
  const question = {
    name: 'answer',
    title: i18n.pages.hearingRequirements.otherNeedsSection.multimediaEvidence.question,
    hint: i18n.pages.hearingRequirements.otherNeedsSection.multimediaEvidence.description,
    options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
  };

  if (present) {
    const multimediaEvidenceAnswered = appeal.hearingRequirements.otherNeeds.multimediaEvidence;
    setCheckedAttributeToQuestion(question, multimediaEvidenceAnswered);
  }
  return question;
}

function postHearingMultimediaEvidenceQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.otherNeeds.multimediaEvidenceAnswerRequired;
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
          multimediaEvidence: answer
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.submitHearingRequirements.otherNeedsSingleSexHearingQuestion);
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupHearingMultimediaEvidenceQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion, middleware, getHearingMultimediaEvidenceQuestion);
  router.post(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion, middleware, postHearingMultimediaEvidenceQuestion(updateAppealService));

  return router;
}

export {
  setupHearingMultimediaEvidenceQuestionController,
  getHearingMultimediaEvidenceQuestion,
  postHearingMultimediaEvidenceQuestion
};
