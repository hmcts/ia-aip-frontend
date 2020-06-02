import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
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

function postBringMultimediaEquipmentQuestion(req: Request, res: Response, next: NextFunction) {

  const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.bringEquipmentAnswerRequired;

  const pageContent = {
    previousPage,
    pageTitle,
    formAction,
    question
  };

  const onSuccess = (answer: boolean) => {
    if (answer) {
      req.session.appeal.cmaRequirements.otherNeeds = {
        ...req.session.appeal.cmaRequirements.otherNeeds,
        bringOwnMultimediaEquipment: true
      };

      // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

      return res.redirect(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment);
    } else {
      req.session.appeal.cmaRequirements.otherNeeds = {
        ...req.session.appeal.cmaRequirements.otherNeeds,
        bringOwnMultimediaEquipment: false
      };

      // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

      return res.redirect(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason);
    }
  };

  return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
}

function setupBringMultimediaEquipmentQuestionController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion, middleware, getBringMultimediaEquipmentQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion, middleware, postBringMultimediaEquipmentQuestion);

  return router;
}

export {
  setupBringMultimediaEquipmentQuestionController,
  getBringMultimediaEquipmentQuestion,
  postBringMultimediaEquipmentQuestion
};
