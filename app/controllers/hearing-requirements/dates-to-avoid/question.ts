import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { dayMonthYearFormat } from '../../../utils/date-utils';
import { postHearingRequirementsYesNoHandler } from '../common';

const previousPage = paths.submitHearingRequirements.taskList;
const pageTitle = i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.title;
const formAction = paths.submitHearingRequirements.hearingDatesToAvoidQuestion;
const question = {
  title: i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.question,
  hint: i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.description,
  options: [ { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' } ]
};

const availableHearingDates = {
  from: moment().add(2, 'week').format(dayMonthYearFormat),
  to: moment().add(12, 'week').format(dayMonthYearFormat)
};

function getDatesToAvoidQuestion(req: Request, res: Response, next: NextFunction) {

  try {
    return res.render('templates/radio-question-page.njk', {
      previousPage,
      pageTitle,
      formAction,
      question,
      availableHearingDates,
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
        availableHearingDates,
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        if (answer) {
          if (req.session.appeal.hearingRequirements) {
            req.session.appeal.hearingRequirements.datesToAvoid = {
              ...req.session.appeal.hearingRequirements.datesToAvoid,
              isDateCannotAttend: true
            };
          } else {
            req.session.appeal.hearingRequirements = {};
            req.session.appeal.hearingRequirements.datesToAvoid = {
              ...req.session.appeal.hearingRequirements.datesToAvoid,
              isDateCannotAttend: true
            };
          }
          await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
          return res.redirect(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate);
        } else {
          if (req.session.appeal.hearingRequirements) {
            req.session.appeal.hearingRequirements.datesToAvoid = {
              ...req.session.appeal.hearingRequirements.datesToAvoid,
              isDateCannotAttend: false
            };
          } else {
            req.session.appeal.hearingRequirements = {};
            req.session.appeal.hearingRequirements.datesToAvoid = {
              ...req.session.appeal.hearingRequirements.datesToAvoid,
              isDateCannotAttend: false
            };
          }
          await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
          // await updateAppealService.submitEvent(Events.SUBMIT, req);
          return res.redirect(paths.submitHearingRequirements.taskList);
        }
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupHearingDatesToAvoidQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.hearingDatesToAvoidQuestion, middleware, getDatesToAvoidQuestion);
  router.post(paths.submitHearingRequirements.hearingDatesToAvoidQuestion, middleware, postDatesToAvoidQuestion(updateAppealService));

  return router;
}

export {
  setupHearingDatesToAvoidQuestionController,
  getDatesToAvoidQuestion,
  postDatesToAvoidQuestion
};
