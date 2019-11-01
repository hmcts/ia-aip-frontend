import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import { createDummyAppealApplication } from '../data/dummy';
import { paths } from '../paths';
import { statementOfTruthValidation } from '../utils/fields-validations';
import { addSummaryRow, Delimiter } from '../utils/summary-list';

function createSummaryRowsFrom(appealApplication: AppealApplication) {
  return [
    addSummaryRow('homeOfficeRefNumber', [ appealApplication.homeOfficeRefNumber ], '/href'),
    addSummaryRow('dateLetterSent',
      [ appealApplication.dateLetterSent.day, moment.months(appealApplication.dateLetterSent.month - 1), appealApplication.dateLetterSent.year ],
      paths.homeOffice.letterSent, Delimiter.SPACE
    ),
    addSummaryRow('name',
      [ appealApplication.personalDetails.firstName, appealApplication.personalDetails.lastName ],
      paths.personalDetails.name, Delimiter.SPACE),
    addSummaryRow('dob',
      [ appealApplication.personalDetails.dob.day, moment.months(appealApplication.personalDetails.dob.month - 1), appealApplication.personalDetails.dob.year ],
      paths.personalDetails.dob, Delimiter.SPACE),
    addSummaryRow('nationality',
      [ appealApplication.personalDetails.nationality ],
      paths.personalDetails.nationality),
    addSummaryRow('contactDetails',
      [ appealApplication.contactDetails.email, appealApplication.contactDetails.phone, ...Object.values(appealApplication.contactDetails.address) ],
      paths.contactDetails),
    addSummaryRow('appealType',
      [ appealApplication.appealType ],
      paths.typeOfAppeal)
  ];
}

function getCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Remove dummy data
    const appealApplication = createDummyAppealApplication() || req.session.appealApplication;
    const summaryRows = createSummaryRowsFrom(appealApplication.appealApplication);
    return res.render('appeal-application/check-and-send.njk', { summaryRows: summaryRows });
  } catch (error) {
    next(error);
  }
}

function postCheckAndSend(req: Request, res: Response, next: NextFunction) {
  const request = req.body;
  try {
    const appealApplication = createDummyAppealApplication() || req.session.appealApplication;
    const summaryRows = createSummaryRowsFrom(appealApplication.appealApplication);
    const validationResult = statementOfTruthValidation(request);
    if (validationResult) {
      return res.render('appeal-application/check-and-send.njk', {
        summaryRows: summaryRows,
        error: validationResult,
        errorList: Object.values(validationResult)
      });
    }
    // TODO: send out application
    return res.redirect(paths.devNextPage);
  } catch (error) {
    next(error);
  }
}

function setupCheckAndSendController(): Router {
  const router = Router();
  router.get(paths.checkAndSend, getCheckAndSend);
  router.post(paths.checkAndSend, postCheckAndSend);
  return router;
}

export {
  setupCheckAndSendController,
  getCheckAndSend,
  postCheckAndSend
};
