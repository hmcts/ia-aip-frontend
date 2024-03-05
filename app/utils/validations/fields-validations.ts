import Joi from 'joi';
import moment from 'moment';
import i18n from '../../../locale/en.json';
import { postcodeRegex } from '../regular-expressions';

const MobilePhoneNumberExtension = require('../../../extensions/joi/mobile-number');

/**
 * Creates a structured error  that follows the standard pattern to be rendered in views
 * @param id the key of the error this is used to build the href and to identify the error.
 * @param errorMsg the error message to display
 */
function createStructuredError(id: string, errorMsg: string) {
  return {
    key: id,
    text: errorMsg,
    href: `#${id}`
  };
}

/**
 * Uses Joi schema validation to validate and object and returns:
 * an object containing list of errors if errors were found
 * or null if no errors where found
 * @param obj the object to be validated
 * @param schema the schema to validate the object
 */
function validate(obj: object, schema: any, abortEarly: boolean = false): ValidationErrors | null {
  const result = schema.validate(obj, { abortEarly });
  if (result.error) {
    return result.error.details.reduce((acc, curr): ValidationError => {
      const key = curr.context.key || (curr.context.peers ? curr.context.peers.join('-') : curr.context.peers);
      const href = curr.context.key || (curr.context.peers ? curr.context.peers[0] : curr.context.peers);
      acc[key] = {
        key: key,
        text: curr.message,
        href: `#${href}`
      };
      return acc;
    }, {});
  }
  return null;
}

function textAreaValidation(text: string, theKey: string, errorMessage: string = null): ValidationErrors | null {
  const schema = Joi.object({
    [theKey]: Joi.string()
      .required()
      .trim()
      .messages({
        'any.required': errorMessage || i18n.validationErrors.emptyReasonAppealIsLate,
        'string.empty': errorMessage || i18n.validationErrors.emptyReasonAppealIsLate
      })
  });

  const objectToValidate = {
    [theKey]: text
  };
  return validate(objectToValidate, schema);
}

function dropdownValidation(text: string, theKey: string): ValidationErrors | null {
  const schema = Joi.object({
    [theKey]: Joi.string()
      .required()
      .messages({
        'any.required': i18n.validationErrors.address.required,
        'string.empty': i18n.validationErrors.address.required
      })
  });

  const objectToValidate = {
    [theKey]: text
  };
  return validate(objectToValidate, schema);
}

function homeOfficeNumberValidation(obj: object) {
  /**
   * Validates whether the Home Office reference number
   * Home Office references accept either UANs or CID references (zero padded on letters) in the validation reference.
   * UAN has the format of xxxx-xxxx-xxxx-xxxx.
   * CID reference has the format of xxxxxxxxx
   * A (CID) number with less than 9 digit will be padded with preceding zeros ( eg 123456 becomes 000123456).
   */

  let homeOfficeNumber = String(obj['homeOfficeRefNumber']);
  if (homeOfficeNumber.length > 0 && homeOfficeNumber.length < 9 && parseInt(homeOfficeNumber, 10)) {
    obj['homeOfficeRefNumber'] = homeOfficeNumber.padStart(9, '0'); // pad number with leading zeros
  }

  const schema = Joi.object({
    homeOfficeRefNumber: Joi.string().required().regex(/^(([0-9]{1,9})|([0-9]{4}\-[0-9]{4}\-[0-9]{4}\-[0-9]{4}))$/).messages({
      'string.empty': i18n.validationErrors.homeOfficeReference.required,
      'string.pattern.base': i18n.validationErrors.homeOfficeReference.invalid
    })
  }).unknown();
  return validate(obj, schema);
}

function dateLetterSentValidation(obj: object): boolean | ValidationErrors {
  return dateValidation(obj, i18n.validationErrors.dateLetterSent);
}

function dateLetterReceivedValidation(obj: object): boolean | ValidationErrors {
  return dateValidation(obj, i18n.validationErrors.dateLetterReceived);
}

function dateLeftUkValidation(obj: object): boolean | ValidationErrors {
  return dateValidation(obj, i18n.validationErrors.dateLeftUk);
}

function dateOfBirthValidation(obj: object): boolean | ValidationErrors {
  return dateValidation(obj, i18n.validationErrors.dateOfBirth);
}

function dateValidation(obj: any, errors): boolean | ValidationErrors {
  const { year, month, day } = obj;
  const date = moment(`${year} ${month} ${day}`, 'YYYY MM DD').isValid() ?
    moment(`${year} ${month} ${day}`, 'YYYY MM DD').format('YYYY MM DD') : 'invalid Date';

  const toValidate = {
    ...obj,
    date
  };
  const schema = Joi.object({
    day: Joi.number().empty('').required().integer().min(1).max(31).messages({
      'any.required': errors.missing,
      'number.base': errors.incorrectFormat,
      'number.integer': errors.incorrectFormat,
      'number.min': errors.incorrectFormat,
      'number.max': errors.incorrectFormat
    }),
    month: Joi.number().empty('').required().integer().min(1).max(12).required().messages({
      'any.required': errors.missing,
      'number.base': errors.incorrectFormat,
      'number.integer': errors.incorrectFormat,
      'number.min': errors.incorrectFormat,
      'number.max': errors.incorrectFormat
    }),
    year: Joi.number().empty('').required().integer().min(1900).required().messages({
      'any.required': errors.missing,
      'number.base': errors.incorrectFormat,
      'number.integer': errors.incorrectFormat,
      'number.min': errors.incorrectFormat
    }),
    date: Joi.date().less('now').messages({
      'date.less': errors.inPast,
      'date.base': errors.incorrectFormat
    })
  }).unknown(true);

  return validate(toValidate, schema, true);
}

function DOBValidation(obj: any, errors): boolean | ValidationErrors {
  const { year, month, day } = obj;
  const date = moment(`${year} ${month} ${day}`, 'YYYY MM DD').isValid() ?
    moment(`${year} ${month} ${day}`, 'YYYY MM DD').format('YYYY MM DD') : 'invalid Date';

  const startDate = new Date();
  const numOfYears = 18;
  const cutOfDate = new Date(startDate);
  cutOfDate.setFullYear(cutOfDate.getFullYear() - numOfYears);
  const toValidate = {
    ...obj,
    date
  };
  const schema = Joi.object({
    date: Joi.date().less('now').max(cutOfDate).messages({
      'date.less': errors.inPast,
      'date.max': errors.underAge,
      'date.base': errors.incorrectFormat
    })
  }).unknown(true);

  return validate(toValidate, schema, true);
}
function appellantNamesValidation(obj: object) {
  const schema = Joi.object({
    givenNames: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.givenNames }),
    familyName: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.familyName })

  }).unknown();
  return validate(obj, schema);
}

function sponsorNamesValidation(obj: object) {
  const schema = Joi.object({
    sponsorGivenNames: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.sponsorGivenNames }),
    sponsorFamilyName: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.sponsorFamilyName })

  }).unknown();
  return validate(obj, schema);
}

function witnessNameValidation(obj: object) {
  const schema = Joi.object({
    witnessName: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.witnessName })
  }).unknown();
  return validate(obj, schema);
}

function witnessNamesValidation(obj: object) {
  const schema = Joi.object({
    witnessName: Joi.array().min(1).messages({ 'array.min': i18n.validationErrors.witnessName })
  }).unknown();
  return validate({ witnessName: obj }, schema);
}

function interpreterLanguagesValidation(obj: object) {
  const schema = Joi.object({
    language: Joi.array().min(1).messages({ 'array.min': i18n.validationErrors.hearingRequirements.accessNeeds.addLanguageDialect })
  }).unknown();
  return validate({ language: obj }, schema);
}

function contactDetailsValidation(obj: object) {
  const schema = Joi.object({
    selections: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.contactDetails.selectOneOption }),
    'email-value': Joi.alternatives().conditional(
      'selections', {
      is: Joi.string().regex(/email/),
      then: Joi.string().required().messages({ 'any.required': i18n.validationErrors.emailEmpty })
        .email({ minDomainSegments: 2, allowUnicode: false }).messages({
          'string.empty': i18n.validationErrors.emailEmpty,
          'string.email': i18n.validationErrors.emailFormat
        }),
      otherwise: Joi.any()
    }),
    'text-message-value': Joi.alternatives().conditional(
      'selections', {
      is: Joi.string().regex(/text-message/),
      then: Joi.extend(MobilePhoneNumberExtension).mobilePhoneNumber().format('e164')
        .messages({
          'string.empty': i18n.validationErrors.phoneEmpty,
          'string.mobilePhoneNumber.invalid.string': i18n.validationErrors.phoneFormat,
          'string.mobilePhoneNumber.invalid.mobile': i18n.validationErrors.phoneFormat
        }),
      otherwise: Joi.any()
    })
  }).unknown();

  return validate(obj, schema);
}

function nationalityValidation(obj: object) {
  const nationalitySchema = Joi.object({
    nationality: Joi.string().required().empty('').messages({
      'any.required': i18n.validationErrors.nationality.selectNationality
    })
  }).unknown(true);

  const statelessSchema = Joi.object({
    stateless: Joi.required().messages({
      'any.required': i18n.validationErrors.nationality.selectNationality
    })
  }).unknown(true);

  const schema = Joi.alternatives().try(nationalitySchema, statelessSchema).messages({
    'alternatives.match': i18n.validationErrors.nationality.selectNationality
  });

  return validate(obj, schema);
}

function postcodeValidation(obj: object): ValidationErrors | null {
  const schema = Joi.object({
    postcode: Joi.string().regex(postcodeRegex).messages({
      'string.empty': i18n.validationErrors.postcode.empty,
      'string.pattern.base': i18n.validationErrors.postcode.invalid
    })
  }).unknown();
  return validate(obj, schema);
}

/**
 * Validates an email address using Joi validation
 * @param obj containing the property 'email-value' to validate the email
 *  Joi validation will return:
 * 'string.empty': if email string is empty
 * 'string.email': if email address does not match format
 * @return ValidationError object if there are issues, null if no errors found
 */
function emailValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    'email-value': Joi.string()
      .required()
      .email({ minDomainSegments: 2, allowUnicode: false })
      .messages({
        'string.empty': i18n.validationErrors.emailEmpty,
        'string.email': i18n.validationErrors.emailFormat
      })
  }).unknown();

  return validate(obj, schema);
}

/**
 * Validates whether the statement of truth checkbox has been checked by checking for object existence
 * @param obj containing the property 'statement' to validate the existence
 * Joi validation will return:
 * 'any.required': if statement of truth object isn't present
 * @return ValidationError object if there are issues, null if no issues found
 */
function statementOfTruthValidation(obj: object): null | ValidationErrors {

  const schema = Joi.object({
    statement: Joi.required().messages({
      'any.required': i18n.validationErrors.acceptanceStatement
    })
  }).unknown();

  return validate(obj, schema);
}

function addressValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    ['address-line-1']: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.address.line1Required }),
    ['address-town']: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.address.townCityRequired }),
    ['address-county']: Joi.string().optional().empty(''),
    ['address-line-2']: Joi.string().optional().empty(''),
    ['address-postcode']: Joi.string().optional().empty('').regex(postcodeRegex).messages({
      'string.pattern.base': i18n.validationErrors.postcode.invalid
    })
  }).unknown();
  return validate(obj, schema);
}

function oocHrEeaValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    answer: Joi.string().required().messages({
      'any.required': i18n.validationErrors.oocHrEea
    })
  }).unknown();

  return validate(obj, schema);
}

function appellantInUkValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    answer: Joi.string().required().messages({
      'any.required': i18n.validationErrors.appellantInUk
    })
  }).unknown();

  return validate(obj, schema);
}

function gwfReferenceNumberValidation(obj: object): null | ValidationErrors {
  /**
   * Validates the Global Web Form (GWF) reference number
   * GWF reference has the format of GWF12345678
   */

  const schema = Joi.object({
    gwfReferenceNumber: Joi.string().required().regex(/^[a-zA-Z]+\d{8}/).messages({
      'string.empty': i18n.validationErrors.gwfReference.required,
      'string.pattern.base': i18n.validationErrors.gwfReference.invalid
    })
  }).unknown();
  return validate(obj, schema);
}

function typeOfAppealValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    appealType: Joi.string().required().messages({
      'any.required': i18n.validationErrors.selectAnAppealType
    })
  }).unknown();

  return validate(obj, schema);
}

function payNowValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    answer: Joi.string().required().messages({
      'any.required': i18n.validationErrors.payNow
    })
  }).unknown();

  return validate(obj, schema);
}

function decisionTypeValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    answer: Joi.string().required().messages({
      'any.required': i18n.validationErrors.decisionType
    })
  }).unknown();

  return validate(obj, schema);
}

function reasonForAppealDecisionValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    applicationReason: Joi.string().required()
      .messages({ 'string.empty': i18n.validationErrors.reasonForAppeal.required })
  }).unknown();
  return validate(obj, schema);
}

function yesOrNoRequiredValidation(obj: object, errorMessage: string) {
  const schema = Joi.object({
    answer: Joi.string().required().messages({ 'any.required': errorMessage })
  }).unknown();
  return validate(obj, schema);
}

function selectedRequiredValidation(obj: object, errorMessage: string) {
  const schema = Joi.object({
    language: Joi.string().required().messages({ 'string.empty': errorMessage })
  }).unknown();
  return validate(obj, schema);
}

function selectedRequiredValidationDialect(obj: object, errorMessage: string) {
  const schema = Joi.object({
    dialect: Joi.string().required().messages({ 'string.empty': errorMessage })
  }).unknown();
  return validate(obj, schema);
}

function askForMoreTimeValidation(obj: object) {
  const schema = Joi.object({
    askForMoreTime: Joi.string().required().messages({
      'string.empty': i18n.validationErrors.askForMoreTime
    })
  }).unknown();
  return validate(obj, schema);
}

function hasSponsorValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    answer: Joi.string().required().messages({
      'any.required': i18n.validationErrors.hasSponsor
    })
  }).unknown();

  return validate(obj, schema);
}

function sponsorAddressValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    ['address-line-1']: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.sponsorAddress.line1Required }),
    ['address-town']: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.sponsorAddress.townCityRequired }),
    ['address-county']: Joi.string().optional().empty(''),
    ['address-line-2']: Joi.string().optional().empty(''),
    ['address-postcode']: Joi.string().optional().regex(postcodeRegex).messages({
          'string.pattern.base': i18n.validationErrors.postcode.invalid,
          'string.empty': i18n.validationErrors.sponsorAddress.postcodeRequired
    })
  }).unknown();
  return validate(obj, schema);
}

function sponsorContactDetailsValidation(obj: object) {
  const schema = Joi.object({
    selections: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.sponsorContactDetails.selectOneOption }),
    'email-value': Joi.alternatives().conditional(
        'selections', {
          is: Joi.string().regex(/email/),
          then: Joi.string().required().messages({ 'any.required': i18n.validationErrors.emailEmpty })
              .email({ minDomainSegments: 2, allowUnicode: false }).messages({
                'string.empty': i18n.validationErrors.emailEmpty,
                'string.email': i18n.validationErrors.emailFormat
              }),
          otherwise: Joi.any()
        }),
    'text-message-value': Joi.alternatives().conditional(
        'selections', {
          is: Joi.string().regex(/text-message/),
          then: Joi.extend(MobilePhoneNumberExtension).mobilePhoneNumber().format('e164')
              .messages({
                'string.empty': i18n.validationErrors.phoneEmpty,
                'string.mobilePhoneNumber.invalid.string': i18n.validationErrors.phoneFormat,
                'string.mobilePhoneNumber.invalid.mobile': i18n.validationErrors.phoneFormat
              }),
          otherwise: Joi.any()
        })
  }).unknown();

  return validate(obj, schema);
}

function sponsorAuthorisationValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    answer: Joi.string().required().messages({
      'any.required': i18n.validationErrors.sponsorAuthorisation
    })
  }).unknown();

  return validate(obj, schema);
}

function isDateInRange(dateFrom: string, dateTo: string, obj,dateMissingErrMsg: string): boolean | ValidationErrors {
  const errorMessage = `Enter a date between ${dateFrom} and ${dateTo}`;
  const { year, month, day } = obj;
  const date = moment(`${year} ${month} ${day}`, 'YYYY MM DD').isValid() ?
    moment(`${year} ${month} ${day}`, 'YYYY MM DD').format('YYYY MM DD') : 'invalid Date';

  const toValidate = {
    ...obj,
    date
  };

  const schema = Joi.object({
    day: Joi.number().empty('').required().integer().min(1).max(31).messages({
      'any.required': dateMissingErrMsg,
      'number.base': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat,
      'number.integer': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat,
      'number.min': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat,
      'number.max': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat
    }),
    month: Joi.number().empty('').required().integer().min(1).max(12).required().messages({
      'any.required': dateMissingErrMsg,
      'number.base': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat,
      'number.integer': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat,
      'number.min': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat,
      'number.max': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat
    }),
    year: Joi.number().empty('').required().integer().min(1900).required().messages({
      'any.required': dateMissingErrMsg,
      'number.base': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat,
      'number.integer': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat,
      'number.min': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat
    }),
    date: Joi.date().required().min(dateFrom).max(dateTo).messages({
      'any.required': dateMissingErrMsg,
      'date.min': errorMessage,
      'date.max': errorMessage,
      'date.base': i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat
    })
  }).unknown(true);

  return validate(toValidate, schema, true);
}

function remissionOptionsValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    answer: Joi.string().required().messages({
      'any.required': i18n.validationErrors.remissionOptions
    })
  }).unknown();

  return validate(obj, schema);
}

function asylumSupportValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    asylumSupportRefNumber: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.asylumSupport })
  }).unknown();
  return validate(obj, schema);
}

function helpWithFeesValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    answer: Joi.string().required().messages({
      'any.required': i18n.validationErrors.helpWithFees
    })
  }).unknown();

  return validate(obj, schema);
}

function helpWithFeesRefNumberValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    helpWithFeesRefNumber: Joi.string().required().regex(/^(HWF|hwf).*$/).messages({
      'string.empty': i18n.validationErrors.helpWithFeesRefNumber.required,
      'string.pattern.base': i18n.validationErrors.helpWithFeesRefNumber.invalid
    })
  }).unknown();
  return validate(obj, schema);
}

export {
  createStructuredError,
  contactDetailsValidation,
  payNowValidation,
  homeOfficeNumberValidation,
  dateValidation,
  dateLetterSentValidation,
  dateLetterReceivedValidation,
  dateLeftUkValidation,
  dateOfBirthValidation,
  dropdownValidation,
  appellantNamesValidation,
  witnessNamesValidation,
  witnessNameValidation,
  postcodeValidation,
  nationalityValidation,
  emailValidation,
  textAreaValidation,
  statementOfTruthValidation,
  addressValidation,
  typeOfAppealValidation,
  oocHrEeaValidation,
  appellantInUkValidation,
  reasonForAppealDecisionValidation,
  yesOrNoRequiredValidation,
  DOBValidation,
  askForMoreTimeValidation,
  selectedRequiredValidation,
  isDateInRange,
  decisionTypeValidation,
  interpreterLanguagesValidation,
  hasSponsorValidation,
  sponsorNamesValidation,
  sponsorAddressValidation,
  sponsorContactDetailsValidation,
  sponsorAuthorisationValidation,
  gwfReferenceNumberValidation,
  selectedRequiredValidationDialect,
  remissionOptionsValidation,
  asylumSupportValidation,
  helpWithFeesValidation,
  helpWithFeesRefNumberValidation
};
