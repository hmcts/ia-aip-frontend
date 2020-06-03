import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.cmaRequirements.otherNeedsSection.privateAppointment.title;
const formAction = paths.awaitingCmaRequirements.otherNeedsPrivateAppointment;
const question = {
  title: i18n.pages.cmaRequirements.otherNeedsSection.privateAppointment.question,
  description: i18n.pages.cmaRequirements.otherNeedsSection.privateAppointment.description,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getPrivateAppointmentQuestion(req: Request, res: Response, next: NextFunction) {
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

function postPrivateAppointmentQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.privateAppointmentAnswerRequired;

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
          privateAppointment: true
        };

        // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

        return res.redirect(paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason);
      } else {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          privateAppointment: false
        };

        // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

        return res.redirect(paths.awaitingCmaRequirements.otherNeedsMentalHealth);
      }
    };

    return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}
function setupPrivateAppointmentQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsPrivateAppointment, middleware, getPrivateAppointmentQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsPrivateAppointment, middleware, postPrivateAppointmentQuestion(updateAppealService));

  return router;
}

export {
  setupPrivateAppointmentQuestionController,
  getPrivateAppointmentQuestion,
  postPrivateAppointmentQuestion
};
