import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import { start } from 'repl';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { dayMonthYearFormat } from '../../../utils/date-utils';
import { getHearingStartDate, postHearingRequirementsYesNoHandler } from '../common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const pageTitle = i18n.pages.hearingRequirements.datesToAvoidSection.addAnotherDateQuestion.title;
const formAction = paths.submitHearingRequirements.hearingDateToAvoidNew;
const question = {
  name: 'answer',
  title: i18n.pages.hearingRequirements.datesToAvoidSection.addAnotherDateQuestion.heading,
  options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
};

function getAddAnotherDateQuestionPage(req: Request, res: Response, next: NextFunction) {
  try {
    const startDate = getHearingStartDate(req.session.appeal.directions);
    const availableHearingDates = {
      from: moment(startDate).format(dayMonthYearFormat),
      to: moment(startDate).add(6, 'week').format(dayMonthYearFormat)
    };

    res.render('templates/radio-question-page.njk', {
      previousPage,
      pageTitle,
      formAction,
      question,
      availableHearingDates,
      saveAndContinueOnly: true

    });
  } catch (e) {
    next(e);
  }
}

function postAddAnotherDateQuestionPage(req: Request, res: Response, next: NextFunction) {
  const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.datesToAvoid.addAnotherDateAnswerRequired;
  const startDate = getHearingStartDate(req.session.appeal.directions);
  const availableHearingDates = {
    from: moment(startDate).format(dayMonthYearFormat),
    to: moment(startDate).add(6, 'week').format(dayMonthYearFormat)
  };

  const pageContent = {
    previousPage,
    pageTitle,
    formAction,
    question,
    availableHearingDates,
    saveAndContinueOnly: true
  };

  const onSuccess = (answer: boolean) => {
    if (answer) {
      return res.redirect(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate);
    } else {
      return res.redirect(paths.submitHearingRequirements.taskList);
    }
  };

  return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
}

function setupHearingDatesToAvoidAddAnotherDateController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.hearingDateToAvoidNew, middleware, getAddAnotherDateQuestionPage);
  router.post(paths.submitHearingRequirements.hearingDateToAvoidNew, middleware, postAddAnotherDateQuestionPage);

  return router;
}

export {
  setupHearingDatesToAvoidAddAnotherDateController,
  getAddAnotherDateQuestionPage,
  postAddAnotherDateQuestionPage
};
