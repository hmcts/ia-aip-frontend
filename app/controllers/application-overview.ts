import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { countryList } from '../data/country-list';
import { paths } from '../paths';
import { getAppealApplicationHistory, getAppealApplicationNextStep } from '../utils/application-state-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';
import { addSummaryRowNoChange, Delimiter } from '../utils/summary-list';

const getAppealApplicationData = (getStateObj: string, req: Request) => {
  const history = req.session.appeal.history;
  let arr = [];
  for (let i = 0; i < history.length; i++) {
    if (history[i].id === getStateObj) {
      arr.push(history[i]);
      return arr;
    }
  }
};

const formatDate = (date: string) => {
  return moment(date).format('DD MMM YYYY');
};

const formatDateLongDate = (date: string) => {
  return moment(date).format('DD MMMM YYYY');
};

function checkIfValueIsInHistory(req: Request, keyFromHistory: string) {
  return !!keyFromHistory;
}

function getApplicationOverview(req: Request, res: Response, next: NextFunction) {
  const appealData = getAppealApplicationData('submitAppeal', req);
  try {
    const isPartiallySaved = _.has(req.query, 'saved');
    const loggedInUserFullName = `${req.idam.userDetails.forename} ${req.idam.userDetails.surname}`;
    const stages = buildProgressBarStages(req.session.appeal.appealStatus);
    return res.render('application-overview.njk', {
      name: loggedInUserFullName,
      applicationNextStep: getAppealApplicationNextStep(req),
      history: getAppealApplicationHistory(),
      stages,
      saved: isPartiallySaved,
      links: i18n.pages.overviewPage.timeLine,
      date: formatDate(appealData[0].data.appealSubmissionDate)
    });
  } catch (e) {
    next(e);
  }
}

function setupAnswers(req: Request): Array<any> {
  const array = [];
  const appealData = getAppealApplicationData('submitAppeal', req);
  const { data } = appealData[0];
  const appealTypeNames: string[] = data.appealType.split(',').map(appealType => {
    return i18n.appealTypes[appealType].name;
  });
  if (checkIfValueIsInHistory(req,data.homeOfficeReferenceNumber)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber,[data.homeOfficeReferenceNumber]));
  }
  if (checkIfValueIsInHistory(req,data.homeOfficeDecisionDate)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.dateLetterSent,[formatDateLongDate(data.homeOfficeDecisionDate)]));
  }
  if (checkIfValueIsInHistory(req,data.appellantNameForDisplay)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.name,[data.appellantNameForDisplay]));
  }
  if (checkIfValueIsInHistory(req,data.appellantDateOfBirth)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.dob,[formatDateLongDate(data.appellantDateOfBirth)]));
  }
  if (checkIfValueIsInHistory(req,data.appellantNationalities[0].value.code)) {
    const nation = countryList.find(country => country.value === appealData[0].data.appellantNationalities[0].value.code).name;
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.nationality,[nation]));
  }
  if (checkIfValueIsInHistory(req,data.appellantAddress)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.addressDetails,[...Object.values(data.appellantAddress)],Delimiter.BREAK_LINE));
  }
  if (checkIfValueIsInHistory(req,data.subscriptions[0].value)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.contactDetails,[data.subscriptions[0].value.email ,data.subscriptions[0].value.mobileNumber],Delimiter.BREAK_LINE));
  }
  if (checkIfValueIsInHistory(req,data.appealType)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.appealType,[appealTypeNames]));
  }
  if (checkIfValueIsInHistory(req,data.applicationOutOfTimeExplanation)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.appealLate,[data.applicationOutOfTimeExplanation]));
  }
  return array;
}

function getHomeOfficeDetails(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('home-office-details.njk', {
      previousPage: paths.overview,
      data: setupAnswers(req)
    });
  } catch (e) {
    next(e);
  }
}

function setupApplicationOverviewController(): Router {
  const router = Router();
  router.get(paths.overview, getApplicationOverview);
  router.get(paths.homeOffice.homeOfficeDetails, getHomeOfficeDetails);

  return router;
}

export {
  setupApplicationOverviewController,
  getApplicationOverview,
  getHomeOfficeDetails
};
