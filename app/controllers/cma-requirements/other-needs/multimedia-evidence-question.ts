import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = paths.awaitingCmaRequirements.otherNeeds;
const pageTitle = i18n.pages.cmaRequirements.otherNeedsSection.multimediaEvidence.title;
const formAction = paths.awaitingCmaRequirements.otherNeedsMultimediaEvidenceQuestion;
const question = {
  title: i18n.pages.cmaRequirements.otherNeedsSection.multimediaEvidence.question,
  description: i18n.pages.cmaRequirements.otherNeedsSection.multimediaEvidence.description,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getMultimediaEvidenceQuestion(req: Request, res: Response, next: NextFunction) {
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

function postMultimediaEvidenceQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.multimediaEvidenceAnswerRequired;

    const pageContent = {
      previousPage,
      pageTitle,
      formAction,
      question
    };

    const onSuccess = async (answer: boolean) => {
      if (answer) {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          multimediaEvidence: true
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion);
      } else {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          multimediaEvidence: false
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment);
      }
    };

    return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}

function setupMultimediaEvidenceQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsMultimediaEvidenceQuestion, middleware, getMultimediaEvidenceQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsMultimediaEvidenceQuestion, middleware, postMultimediaEvidenceQuestion(updateAppealService));

  return router;
}

export {
  setupMultimediaEvidenceQuestionController,
  getMultimediaEvidenceQuestion,
  postMultimediaEvidenceQuestion
};
