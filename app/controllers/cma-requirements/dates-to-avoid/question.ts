import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { postCmaRequirementsYesNoHandler } from '../common';

const previousPage = paths.awaitingCmaRequirements.taskList;
const pageTitle = i18n.pages.cmaRequirements.datesToAvoidSection.questionPage.title;
const formAction = paths.awaitingCmaRequirements.datesToAvoidQuestion;
const question = {
  title: i18n.pages.cmaRequirements.datesToAvoidSection.questionPage.question,
  description: i18n.pages.cmaRequirements.datesToAvoidSection.questionPage.description,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

function getDatesToAvoidQuestion(req: Request, res: Response, next: NextFunction) {
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

function postDatesToAvoidQuestion(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.datesToAvoid.datesToAvoidAnswerRequired;

      const pageContent = {
        previousPage,
        pageTitle,
        formAction,
        question,
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        if (answer) {
          req.session.appeal.cmaRequirements.datesToAvoid = {
            ...req.session.appeal.cmaRequirements.datesToAvoid,
            isDateCannotAttend: true
          };

          await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
          return res.redirect(paths.awaitingCmaRequirements.datesToAvoidEnterDate);
        } else {
          req.session.appeal.cmaRequirements.datesToAvoid = {
            ...req.session.appeal.cmaRequirements.datesToAvoid,
            isDateCannotAttend: false
          };

          await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
          return res.redirect(paths.awaitingCmaRequirements.taskList);
        }
      };

      return postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupDatesToAvoidQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.datesToAvoidQuestion, middleware, getDatesToAvoidQuestion);
  router.post(paths.awaitingCmaRequirements.datesToAvoidQuestion, middleware, postDatesToAvoidQuestion(updateAppealService));

  return router;
}

export {
  setupDatesToAvoidQuestionController,
  getDatesToAvoidQuestion,
  postDatesToAvoidQuestion
};
