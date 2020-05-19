import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import i18n from '../../../locale/en.json';
import { countryList } from '../../data/country-list';
import { Events } from '../../data/events';
import { appealOutOfTimeMiddleware } from '../../middleware/outOfTime-middleware';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { formatTextForCYA } from '../../utils/utils';
import { statementOfTruthValidation } from '../../utils/validations/fields-validations';

function createSummaryRowsFrom(appealApplication: AppealApplication) {
  const appealTypeNames: string[] = appealApplication.appealType.split(',').map(appealType => {
    return i18n.appealTypes[appealType].name;
  });
  const nationality = countryList.find(country => country.value === appealApplication.personalDetails.nationality);
  const editParameter = '?edit';
  const rows = [
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber,
      [ appealApplication.homeOfficeRefNumber ],
      paths.appealStarted.details + editParameter
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.dateLetterSent,
      [ appealApplication.dateLetterSent.day, moment.months(appealApplication.dateLetterSent.month - 1), appealApplication.dateLetterSent.year ],
      paths.appealStarted.letterSent + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.name,
      [ appealApplication.personalDetails.givenNames, appealApplication.personalDetails.familyName ],
      paths.appealStarted.name + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.dob,
      [ appealApplication.personalDetails.dob.day, moment.months(appealApplication.personalDetails.dob.month - 1), appealApplication.personalDetails.dob.year ],
      paths.appealStarted.dob + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.nationality,
      [ nationality.name ],
      paths.appealStarted.nationality + editParameter
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.addressDetails,
      [ ...Object.values(appealApplication.personalDetails.address) ],
      paths.appealStarted.enterAddress + editParameter,
      Delimiter.BREAK_LINE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.contactDetails,
      [ appealApplication.contactDetails.email, appealApplication.contactDetails.phone ],
      paths.appealStarted.contactDetails + editParameter,
      Delimiter.BREAK_LINE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.appealType,
      [ appealTypeNames ],
      paths.appealStarted.typeOfAppeal + editParameter
    )
  ];

  if (appealApplication.isAppealLate) {
    const lateAppealValue = [ formatTextForCYA(appealApplication.lateAppeal.reason) ];
    if (appealApplication.lateAppeal.evidence) {
      const urlHtml = `<p class="govuk-!-font-weight-bold">${i18n.pages.checkYourAnswers.rowTitles.supportingEvidence}</p><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.detailsViewers.document}/${appealApplication.lateAppeal.evidence.fileId}'>${appealApplication.lateAppeal.evidence.name}</a>`;
      lateAppealValue.push(urlHtml);
    }
    const lateAppealRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealLate, lateAppealValue, paths.appealStarted.appealLate);
    rows.push(lateAppealRow);
  }
  return rows;
}

function getCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const summaryRows = createSummaryRowsFrom(application);
    return res.render('appeal-application/check-and-send.njk', {
      summaryRows,
      previousPage: paths.appealStarted.taskList
    });
  } catch (error) {
    next(error);
  }
}

function postCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const request = req.body;
    try {
      const { application } = req.session.appeal;
      const summaryRows = createSummaryRowsFrom(application);
      const validationResult = statementOfTruthValidation(request);
      if (validationResult) {
        return res.render('appeal-application/check-and-send.njk', {
          summaryRows: summaryRows,
          error: validationResult,
          errorList: Object.values(validationResult),
          previousPage: paths.appealStarted.taskList
        });
      }
      const updatedAppeal = await updateAppealService.submitEvent(Events.SUBMIT_APPEAL, req);
      req.session.appeal.appealStatus = updatedAppeal.state;
      req.session.appeal.appealReferenceNumber = updatedAppeal.case_data.appealReferenceNumber;
      return res.redirect(paths.appealSubmitted.confirmation);
    } catch (error) {
      next(error);
    }
  };
}

function setupCheckAndSendController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.checkAndSend, middleware, appealOutOfTimeMiddleware, getCheckAndSend);
  router.post(paths.appealStarted.checkAndSend, middleware, postCheckAndSend(updateAppealService));
  return router;
}

export {
  createSummaryRowsFrom,
  setupCheckAndSendController,
  getCheckAndSend,
  postCheckAndSend
};
