import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { dayMonthYearFormat } from '../../../utils/date-utils';
import { getHearingStartDate, postHearingRequirementsYesNoHandler, setCheckedAttributeToQuestion } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.title;
const formAction = paths.submitHearingRequirements.hearingDatesToAvoidQuestion;

function getQuestion(appeal: Appeal) {
  const present = _.has(appeal, 'hearingRequirements.datesToAvoid.isDateCannotAttend') || null;
  const question = {
    name: 'answer',
    title: i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.question,
    hint: i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.description,
    options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
  };

  if (present) {
    const isDateCannotAttendAnswered = appeal.hearingRequirements.datesToAvoid.isDateCannotAttend;
    setCheckedAttributeToQuestion(question, isDateCannotAttendAnswered);
  }
  return question;
}

function getDatesToAvoidQuestion(req: Request, res: Response, next: NextFunction) {

  const startDate = getHearingStartDate(req.session.appeal.directions);
  const availableHearingDates = {
    from: moment(startDate).format(dayMonthYearFormat),
    to: moment(startDate).add(6, 'week').format(dayMonthYearFormat)
  };
  const question = getQuestion(req.session.appeal);
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
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.datesToAvoid.datesToAvoidAnswerRequired;
      const startDate = getHearingStartDate(req.session.appeal.directions);
      const availableHearingDates = {
        from: moment(startDate).format(dayMonthYearFormat),
        to: moment(startDate).add(6, 'week').format(dayMonthYearFormat)
      };
      const question = getQuestion(req.session.appeal);
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
              isDateCannotAttend: false,
              dates: []
            };
          } else {
            req.session.appeal.hearingRequirements = {};
            req.session.appeal.hearingRequirements.datesToAvoid = {
              ...req.session.appeal.hearingRequirements.datesToAvoid,
              isDateCannotAttend: false,
              dates: []
            };
          }
          await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
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
