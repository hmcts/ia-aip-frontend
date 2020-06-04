import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointment.title;
const formAction = paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment;
const question = {
  title: i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointment.question,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getSingleSexAppointmentQuestion(req: Request, res: Response, next: NextFunction) {
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

function postSingleSexAppointmentQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.singleSexAppointmentRequired;

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
          singleSexAppointment: true
        };

        return res.redirect(paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment);
      } else {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          singleSexAppointment: false
        };

        return res.redirect(paths.awaitingCmaRequirements.otherNeedsPrivateAppointment);
      }
    };

    return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}
function setupSingleSexAppointmentQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment, middleware, getSingleSexAppointmentQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment, middleware, postSingleSexAppointmentQuestion(updateAppealService));

  return router;
}

export {
  setupSingleSexAppointmentQuestionController,
  getSingleSexAppointmentQuestion,
  postSingleSexAppointmentQuestion
};
