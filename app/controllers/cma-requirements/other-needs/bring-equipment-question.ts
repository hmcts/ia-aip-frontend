import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = paths.awaitingCmaRequirements.otherNeeds;
const pageTitle = i18n.pages.cmaRequirements.otherNeedsSection.bringEquipment.title;
const formAction = paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion;
const question = {
  title: i18n.pages.cmaRequirements.otherNeedsSection.bringEquipment.question,
  description: i18n.pages.cmaRequirements.otherNeedsSection.bringEquipment.description,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getBringMultimediaEquipmentQuestion(req: Request, res: Response, next: NextFunction) {
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

function postBringMultimediaEquipmentQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.bringEquipmentAnswerRequired;

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
          bringOwnMultimediaEquipment: true
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment);
      } else {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          bringOwnMultimediaEquipment: false
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason);
      }
    };

    return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}

function setupBringMultimediaEquipmentQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion, middleware, getBringMultimediaEquipmentQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion, middleware, postBringMultimediaEquipmentQuestion(updateAppealService));

  return router;
}

export {
  setupBringMultimediaEquipmentQuestionController,
  getBringMultimediaEquipmentQuestion,
  postBringMultimediaEquipmentQuestion
};
