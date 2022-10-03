import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import CcdSystemService from '../service/ccd-system-service';
import { formatDate } from '../utils/date-utils';
import { addSummaryRow } from '../utils/summary-list';
import { formatCaseId } from '../utils/utils';
import { createStructuredError } from '../utils/validations/fields-validations';

function getStartRepresentingYourself(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('start-representing-yourself/start-representing-yourself.njk', {
      nextPage: paths.startRepresentingYourself.enterCaseNumber
    });
  } catch (e) {
    next(e);
  }
}

function getEnterCaseReference(req: Request, res: Response, next: NextFunction) {
  try {
    let validationErrors: ValidationErrors;

    if (req.query.error) {
      if (req.query.error === 'caseReferenceNumber') {
        validationErrors = {
          caseReferenceNumber: createStructuredError('caseReferenceNumber', i18n.pages.startRepresentingYourself.enterCaseReference.error)
        };
      }
      if (req.query.error === 'pipValidationFailed') {
        validationErrors = {
          pipValidationFailed: createStructuredError('pipValidationFailed', i18n.pages.startRepresentingYourself.pipValidationFailed)
        };
      }
    }

    let caseReferenceNumber = '';
    if (req.session.startRepresentingYourself) {
      caseReferenceNumber = formatCaseId(req.session.startRepresentingYourself.id);
    }

    res.render('start-representing-yourself/enter-case-reference.njk', {
      previousPage: paths.startRepresentingYourself.start,
      caseReferenceNumber: caseReferenceNumber,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  } catch (e) {
    next(e);
  }
}

function postEnterCaseReference(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.body['caseReferenceNumber'];
    if (!validCaseReferenceNumber(id)) {
      res.redirect(paths.startRepresentingYourself.enterCaseNumber + '?error=caseReferenceNumber');
      return;
    }

    Object.assign(req.session, {
      startRepresentingYourself: {
        id: id.replace(/-/g, '')
      }
    });

    res.redirect(paths.startRepresentingYourself.enterSecurityCode);
  } catch (error) {
    next(error);
  }
}

function validCaseReferenceNumber(value: string): boolean {
  const CASE_REFERENCE_NUMBER_REGEX = /^\d{16}$/;
  const CASE_REFERENCE_NUMBER_WITH_DASHES_REGEX = /^\d{4}\-\d{4}\-\d{4}\-\d{4}$/;
  return value && (CASE_REFERENCE_NUMBER_REGEX.test(value) || CASE_REFERENCE_NUMBER_WITH_DASHES_REGEX.test(value));
}

function getEnterSecurityCode(req: Request, res: Response, next: NextFunction) {
  try {
    let validationErrors: ValidationErrors;

    if (req.query.error) {
      if (req.query.error === 'accessCode') {
        validationErrors = {
          accessCode: createStructuredError('accessCode', i18n.pages.startRepresentingYourself.enterSecurityCode.error)
        };
      }
    }

    res.render('start-representing-yourself/enter-security-code.njk', {
      previousPage: paths.startRepresentingYourself.enterCaseNumber,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  } catch (e) {
    next(e);
  }
}

function postValidateAccess(ccdSystemService: CcdSystemService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.session.startRepresentingYourself.id === undefined) {
        res.redirect(paths.startRepresentingYourself.enterCaseNumber + '?error=caseReferenceNumber');
        return;
      }

      const accessCode = req.body['accessCode'];
      if (!validAccessCode(accessCode)) {
        res.redirect(paths.startRepresentingYourself.enterSecurityCode + '?error=accessCode');
        return;
      }

      const caseId = req.session.startRepresentingYourself.id;
      const pipValidation = await ccdSystemService.pipValidation(caseId, accessCode);

      if (pipValidation.accessValidated) {
        Object.assign(req.session.startRepresentingYourself, pipValidation);
        res.redirect(paths.startRepresentingYourself.confirmDetails);
        return;
      }

      res.redirect(paths.startRepresentingYourself.enterCaseNumber + '?error=pipValidationFailed');
    } catch (error) {
      next(error);
    }
  };
}

function validAccessCode(value: string): boolean {
  const ACCESS_CODE_REGEX = /^[A-Z\d]{12}$/;
  return value && ACCESS_CODE_REGEX.test(value);
}

function getConfirmCaseDetails(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.startRepresentingYourself.accessValidated) {
      res.redirect(paths.startRepresentingYourself.enterCaseNumber + '?error=caseReferenceNumber');
    }
    const details = req.session.startRepresentingYourself.caseSummary;
    res.render('start-representing-yourself/confirm-case-details.njk', {
      previousPage: paths.startRepresentingYourself.enterSecurityCode,
      caseDetails: [
        addSummaryRow(
          i18n.pages.startRepresentingYourself.confirmDetails.fieldName,
          [ details.name ]
        ),
        addSummaryRow(
          i18n.pages.startRepresentingYourself.confirmDetails.fieldDateOfBirth,
          [ formatDate(details.dateOfBirth) ]
        ),
        addSummaryRow(
          i18n.pages.startRepresentingYourself.confirmDetails.fieldReferenceNumber,
          [ formatCaseId(details.referenceNumber) ]
        )
      ]
    });
  } catch (error) {
    next(error);
  }
}

function postConfirmCaseDetails(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.startRepresentingYourself.accessValidated) {
      res.redirect(paths.startRepresentingYourself.enterCaseNumber + '?error=caseReferenceNumber');
    }
    req.session.startRepresentingYourself.detailsConfirmed = true;
    res.redirect(paths.common.login);
  } catch (error) {
    next(error);
  }
}

function setupStartRepresentingMyselfControllers(ccdSystemService: CcdSystemService): Router {
  const router = Router();
  router.get(paths.startRepresentingYourself.start, getStartRepresentingYourself);
  router.get(paths.startRepresentingYourself.enterCaseNumber, getEnterCaseReference);
  router.post(paths.startRepresentingYourself.enterCaseNumber, postEnterCaseReference);
  router.get(paths.startRepresentingYourself.enterSecurityCode, getEnterSecurityCode);
  router.post(paths.startRepresentingYourself.enterSecurityCode, postValidateAccess(ccdSystemService));
  router.get(paths.startRepresentingYourself.confirmDetails, getConfirmCaseDetails);
  router.post(paths.startRepresentingYourself.confirmDetails, postConfirmCaseDetails);
  return router;
}

export {
  setupStartRepresentingMyselfControllers,
  getStartRepresentingYourself,
  getEnterCaseReference,
  postEnterCaseReference,
  getEnterSecurityCode,
  postValidateAccess,
  getConfirmCaseDetails,
  postConfirmCaseDetails
};
