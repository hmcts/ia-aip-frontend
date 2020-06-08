import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment;
const pageTitle = i18n.pages.cmaRequirements.otherNeedsSection.singleSexTypeAppointment.title;
const formAction = paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment;
const question = {
  title: i18n.pages.cmaRequirements.otherNeedsSection.singleSexTypeAppointment.question,
  options: [ { value: 'yes', text: 'All male' }, { value: 'no', text: 'All female' } ]
};

enum SexType {
  ALL_MALE = 'All-male',
  ALL_FEMALE = 'All-female'
}

function getSingleSexTypeAppointmentQuestion(req: Request, res: Response, next: NextFunction) {
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

function postSingleSexTypeAppointmentQuestion(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.singleSexTypeAppointmentRequired;

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
          singleSexTypeAppointment: SexType.ALL_MALE
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsAllMaleAppointment);
      } else {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          singleSexTypeAppointment: SexType.ALL_FEMALE
        };
        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return res.redirect(paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment);
      }
    };

    return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
  };
}
function setupSingleSexTypeAppointmentQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment, middleware, getSingleSexTypeAppointmentQuestion);
  router.post(paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment, middleware, postSingleSexTypeAppointmentQuestion(updateAppealService));

  return router;
}

export {
  SexType,
  setupSingleSexTypeAppointmentQuestionController,
  getSingleSexTypeAppointmentQuestion,
  postSingleSexTypeAppointmentQuestion
};
