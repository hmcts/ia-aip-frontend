import Joi from '@hapi/joi';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { mobilePhoneRegex, postcodeRegex } from './regular-expressions';

const MobilePhoneNumberExtension = require('../../extensions/joi/mobile-number');

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

function textAreaValidation(text: string, theKey: string): ValidationErrors | null {
  const schema = Joi.object({
    [theKey]: Joi.string()
      .required()
      .min(3)
      .messages({
        'any.required': i18n.validationErrors.required,
        'string.empty': i18n.validationErrors.empty,
        'string.min': i18n.validationErrors.stringMin
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
  const schema = Joi.object({
    homeOfficeRefNumber: Joi.string().required().regex(/^[A-Za-z][0-9]{6}[0-9]?(|\/[0-9][0-9]?[0-9]?)$/).messages({
      'string.empty': i18n.validationErrors.homeOfficeReference.required,
      'string.pattern.base': i18n.validationErrors.homeOfficeReference.invalid
    })
  }).unknown();
  return validate(obj, schema);
}

function dateLetterSentValidation(obj: object): boolean | ValidationErrors {
  return dateValidation(obj, i18n.validationErrors.dateLetterSent);
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
  });

  return validate(toValidate, schema, true);
}

function appellantNamesValidation(obj: object) {
  const schema = Joi.object({
    givenNames: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.givenNames }),
    familyName: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.familyName })

  }).unknown();
  return validate(obj, schema);
}

function contactDetailsValidation(obj: object) {
  const schema = Joi.object({
    'selections': Joi.alternatives()
      .try(
        Joi.array()
          .items(
            Joi.string().valid('email', 'text-message')
          ),
        Joi.string().valid('email', 'text-message'))
      .required()
      .messages({
        'any.required': i18n.validationErrors.contactDetails.selectOneOption
      }),
    'email-value': Joi.when('selections', {
      is: Joi.alternatives()
        .try(Joi.array().items(Joi.string().valid('email'), Joi.string().valid('text-message')),
          Joi.string().valid('email')).required(),
      then: Joi.string()
        .optional()
        .email({ minDomainSegments: 2, allowUnicode: false })
        .messages({
          'string.empty': i18n.validationErrors.emailEmpty,
          'string.email': i18n.validationErrors.emailFormat
        }),
      otherwise: Joi.strip()
    }),
    'text-message-value': Joi.when('selections', {
      is: Joi.alternatives()
        .try(
          Joi.array().items(Joi.string().valid('email'), Joi.string().valid('text-message')),
          Joi.string().valid('text-message')).required(),
      then: Joi.extend(MobilePhoneNumberExtension).mobilePhoneNumber().format('e164')
        .optional()
        .messages({
          'string.empty': i18n.validationErrors.phoneEmpty,
          'string.mobilePhoneNumber.invalid.string': i18n.validationErrors.phoneFormat,
          'string.mobilePhoneNumber.invalid.mobile': i18n.validationErrors.phoneFormat
        }),
      otherwise: Joi.strip()
    })
  }).unknown();

  return validate(obj, schema);
}

function nationalityValidation(obj: object) {
  const schema = Joi.object({
    nationality: Joi.string().required().empty('').messages({
      'any.required': i18n.validationErrors.nationality.selectNationality
    })
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
 * Validates a phone number using using Joi validation with regex
 * @param obj containing the property 'text-message-value' to validate the phone number
 * @return
 * Joi validation will return:
 * 'string.empty': if phone number string is empty
 * 'string.pattern.base': if phone number does not match format
 * @return ValidationError object if there are issues, null if no issues found
 */
function mobilePhoneValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    'text-message-value': Joi.string()
      .required()
      .regex(mobilePhoneRegex)
      .messages({
        'string.empty': i18n.validationErrors.phoneEmpty,
        'string.pattern.base': i18n.validationErrors.phoneFormat
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
  });
  return validate(obj, schema);
}

function typeOfAppealValidation(obj: object): null | ValidationErrors {
  const schema = Joi.alternatives().try(
    Joi.object({
      appealType: Joi.array().items(Joi.string()).required()
    }).unknown(),
    Joi.object({
      appealType: Joi.string().required()
    }).unknown()
  ).messages({
    'alternatives.match': i18n.validationErrors.atLeastOneTypeOfAppeal,
    'any.required': i18n.validationErrors.required
  });

  return validate(obj, schema);
}

function homeOfficeDecisionValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    ['moreDetail']: Joi.string().required().messages({ 'string.empty':  i18n.validationErrors.homeOfficeDecision.required })
  });
  return validate(obj, schema);
}

export {
  contactDetailsValidation,
  homeOfficeNumberValidation,
  dateValidation,
  dateLetterSentValidation,
  dateOfBirthValidation,
  dropdownValidation,
  appellantNamesValidation,
  postcodeValidation,
  nationalityValidation,
  emailValidation,
  mobilePhoneValidation,
  textAreaValidation,
  statementOfTruthValidation,
  addressValidation,
  typeOfAppealValidation,
  homeOfficeDecisionValidation
};
