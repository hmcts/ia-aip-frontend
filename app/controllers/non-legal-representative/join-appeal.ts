import { AxiosResponse } from 'axios';
import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import CcdSystemService, { PipCaseSummary, PipValidation } from '../../service/ccd-system-service';
import UpdateAppealService from '../../service/update-appeal-service';
import Logger, { getLogLabel } from '../../utils/logger';
import { addSummaryRow } from '../../utils/summary-list';
import { formatCaseId } from '../../utils/utils';
import { createStructuredError, joinAppealValidation } from '../../utils/validations/fields-validations';

const logger = new Logger();
const logLabel = getLogLabel(__filename);

function getJoinAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('non-legal-rep/join-appeal.njk', {
      previousPage: paths.common.overview
    });
  } catch (error) {
    next(error);
  }
}

function postJoinAppeal(ccdSystemService: CcdSystemService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationErrors = joinAppealValidation(req.body);
      if (validationErrors) {
        return res.render('non-legal-rep/join-appeal.njk', {
          caseReference: req.body['caseReference'],
          joinAppealAccessCode: req.body['joinAppealAccessCode'],
          errorList: Object.values(validationErrors),
          errors: validationErrors,
          // TODO - this should go back to the case list once that is implemented rather than the base page
          previousPage: '/'
        });
      }
      const caseReferenceWithoutDashes: string = req.body['caseReference']?.replaceAll('-', '')?.replaceAll(' ', '');
      const pipValidation: PipValidation = await ccdSystemService.joinAppealPipValidation(
        caseReferenceWithoutDashes,
        req.body['joinAppealAccessCode']
      );
      if (pipValidation.accessValidated) {
        Object.assign(req.session, { joinAppealPipValidation: pipValidation });
        res.redirect(paths.nonLegalRep.joinAppealConfirmDetails);
        return;
      }
      const pipError: ValidationError = getPipError(pipValidation, req.body['caseReference']);
      const errors: object = {};
      errors[pipError.key] = pipError;
      return res.render('non-legal-rep/join-appeal.njk', {
        caseReference: req.body['caseReference'],
        joinAppealAccessCode: req.body['joinAppealAccessCode'],
        errors: errors,
        errorList: Object.values(errors),
        previousPage: paths.common.overview
      });
    } catch (error) {
      next(error);
    }
  };
}

function createPipAccessCodeError(message: string, caseReferenceGiven: string): ValidationError {
  return createStructuredError('joinAppealAccessCode', message.replace('{{ caseReference }}', caseReferenceGiven));
}

function getPipError(pipValidation: PipValidation, caseReferenceGiven: string): ValidationError {
  if (!pipValidation.caseIdValid) {
    return createStructuredError('caseReference', i18n.pages.joinAppeal.enterCaseReference.error);
  }
  if (!pipValidation.doesPinExist) {
    return createPipAccessCodeError(i18n.pages.joinAppeal.enterAccessCode.pinNotExistError, caseReferenceGiven);
  }
  if (!pipValidation.pinValid) {
    return createPipAccessCodeError(i18n.pages.joinAppeal.enterAccessCode.pinInvalidError, caseReferenceGiven);
  }
  if (!pipValidation.codeUnused) {
    return createPipAccessCodeError(i18n.pages.joinAppeal.enterAccessCode.pinUsedError, caseReferenceGiven);
  }
  if (!pipValidation.codeNotExpired) {
    return createPipAccessCodeError(i18n.pages.joinAppeal.enterAccessCode.pinExpiredError, caseReferenceGiven);
  }
  return createPipAccessCodeError(i18n.pages.joinAppeal.enterAccessCode.pinGenericError, caseReferenceGiven);
}

function getJoinAppealConfirmDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const details: PipCaseSummary = req.session.joinAppealPipValidation.caseSummary;
    return res.render('non-legal-rep/join-appeal-confirm-details.njk', {
      previousPage: paths.nonLegalRep.joinAppeal,
      caseDetails: [
        addSummaryRow(
          i18n.pages.joinAppeal.confirmDetails.fieldReferenceNumber,
          [formatCaseId(details.referenceNumber)]
        ),
        addSummaryRow(
          i18n.pages.joinAppeal.confirmDetails.fieldAppealReference,
          [details.appealReference]
        ),
        addSummaryRow(
          i18n.pages.joinAppeal.confirmDetails.fieldName,
          [details.name]
        ),
      ]
    });
  } catch (error) {
    next(error);
  }
}

function postJoinAppealConfirmDetails(updateAppealService: UpdateAppealService, ccdSystemService: CcdSystemService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId: string = req.session.joinAppealPipValidation.caseSummary.referenceNumber;
      const appellantId: string = req.idam.userDetails.uid;
      const response: AxiosResponse<CcdCaseDetails> = await ccdSystemService.getCaseById(caseId);
      const updatedCaseDetails: CcdCaseDetails = {
        ...response.data,
        case_data: {
          ...response.data.case_data,
          nlrDetails: {
            ...response.data.case_data.nlrDetails,
            idamId: appellantId
          }
        }
      };
      const eventResponse: CcdCaseDetails = await updateAppealService.submitEventByCaseDetails(Events.JOIN_APPEAL_CONFIRMATION, updatedCaseDetails);
      if (eventResponse.error && eventResponse.error.length > 0) {
        logger.exception(`Error returned from CCD when confirming join appeal for case id - '${caseId}', error - '${eventResponse.message}'`, logLabel);

        return res.render('non-legal-rep/join-appeal-confirm-details.njk', {
          previousPage: paths.nonLegalRep.joinAppeal,
          caseDetails: [
            addSummaryRow(
              i18n.pages.joinAppeal.confirmDetails.fieldReferenceNumber,
              [formatCaseId(req.session.joinAppealPipValidation.caseSummary.referenceNumber)]
            ),
            addSummaryRow(
              i18n.pages.joinAppeal.confirmDetails.fieldAppealReference,
              [req.session.joinAppealPipValidation.caseSummary.appealReference]
            ),
            addSummaryRow(
              i18n.pages.joinAppeal.confirmDetails.fieldName,
              [req.session.joinAppealPipValidation.caseSummary.name]
            ),
          ],
          errorList: [createStructuredError(i18n.pages.joinAppeal.confirmDetails.confirmButtonId, i18n.pages.joinAppeal.confirmDetails.error)]
        });
      }
      return res.redirect(paths.nonLegalRep.joinAppealConfirmation);
    } catch (error) {
      next(error);
    }
  };
}

function getJoinAppealConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.joinAppeal.confirmation.title,
      whatNextContent: i18n.pages.joinAppeal.confirmation.whatNextContent,
      appellantName: req.session?.joinAppealPipValidation?.caseSummary?.name
    });
  } catch (e) {
    next(e);
  }
}

function setupJoinAppealControllers(middleware: Middleware[], updateAppealService: UpdateAppealService, ccdSystemService: CcdSystemService): Router {
  const router = Router();
  router.get(paths.nonLegalRep.joinAppeal, middleware, getJoinAppeal);
  router.post(paths.nonLegalRep.joinAppeal, middleware, postJoinAppeal(ccdSystemService));
  router.get(paths.nonLegalRep.joinAppealConfirmDetails, middleware, getJoinAppealConfirmDetails);
  router.post(paths.nonLegalRep.joinAppealConfirmDetails, middleware, postJoinAppealConfirmDetails(updateAppealService, ccdSystemService));
  router.get(paths.nonLegalRep.joinAppealConfirmation, middleware, getJoinAppealConfirmation);
  return router;
}

export {
  setupJoinAppealControllers,
  getJoinAppeal,
  postJoinAppeal,
  getJoinAppealConfirmDetails,
  postJoinAppealConfirmDetails,
  getJoinAppealConfirmation
};
