import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { Events } from '../service/ccd-service';
import UpdateAppealService from '../service/update-appeal-service';
import { statementOfTruthValidation } from '../utils/fields-validations';
import { addSummaryRow, Delimiter } from '../utils/summary-list';

function createSummaryRowsFrom(appealApplication: AppealApplication) {
  let appealTypes: string[] = !Array.isArray(appealApplication.appealType)
    ? [ appealApplication.appealType ] : appealApplication.appealType;

  const appealTypeNames: string[] = appealTypes.map(appealType => {
    return i18n.appealTypes[appealType].name;
  });

  return [
    addSummaryRow('homeOfficeRefNumber', [ appealApplication.homeOfficeRefNumber ], paths.homeOffice.details),
    addSummaryRow('dateLetterSent',
      [ appealApplication.dateLetterSent.day, moment.months(appealApplication.dateLetterSent.month - 1), appealApplication.dateLetterSent.year ],
      paths.homeOffice.letterSent,
      Delimiter.SPACE
    ),
    addSummaryRow('name',
      [ appealApplication.personalDetails.givenNames, appealApplication.personalDetails.familyName ],
      paths.personalDetails.name, Delimiter.SPACE),
    addSummaryRow('dob',
      [ appealApplication.personalDetails.dob.day, moment.months(appealApplication.personalDetails.dob.month - 1), appealApplication.personalDetails.dob.year ],
      paths.personalDetails.dob, Delimiter.SPACE),
    addSummaryRow('nationality',
      [ appealApplication.personalDetails.nationality ],
      paths.personalDetails.nationality),
    addSummaryRow('contactDetails',
      [ appealApplication.contactDetails.email, appealApplication.contactDetails.phone, ...Object.values(appealApplication.personalDetails.address) ],
      paths.contactDetails),
    addSummaryRow('appealType',
      [ appealTypeNames ],
      paths.typeOfAppeal)
  ];
}

function getCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const summaryRows = createSummaryRowsFrom(application);
    return res.render('appeal-application/check-and-send.njk', { summaryRows });
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
          errorList: Object.values(validationResult)
        });
      }
      await updateAppealService.submitEvent(Events.SUBMIT_APPEAL, req);
      return res.redirect(paths.confirmation);
    } catch (error) {
      next(error);
    }
  };
}

function setupCheckAndSendController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.checkAndSend, getCheckAndSend);
  router.post(paths.checkAndSend, postCheckAndSend(updateAppealService));
  return router;
}

export {
  setupCheckAndSendController,
  getCheckAndSend,
  postCheckAndSend
};
