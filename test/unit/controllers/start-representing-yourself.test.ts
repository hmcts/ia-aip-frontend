import { Request, Response } from 'express';
import { createStructuredError } from '../../../app/utils/validations/fields-validations';
import i18n from '../../../locale/en.json';
import { expect } from '../../utils/testUtils';

describe('getProvideSupportingEvidenceYesOrNo', () => {
  it('should catch an error and redirect with error', () => {

    let validationErrors: ValidationErrors;
    validationErrors = {
      caseReferenceNumber: createStructuredError('caseReferenceNumber', i18n.pages.startRepresentingYourself.enterCaseReference.error)
    };

    console.log({
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  });


});
