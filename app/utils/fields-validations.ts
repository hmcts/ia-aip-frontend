import Joi from '@hapi/joi';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { postcodeRegex } from './regular-expressions';

/**
 * Uses Joi schema validation to validate and object and returns:
 * an object containing list of errors if errors were found
 * or null if no errors where found
 * @param obj the object to be validated
 * @param schema the schema to validate the object
 */
function validate(obj: object, schema: any): ValidationErrors | null {
  const result = schema.validate(obj, { abortEarly: false });
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

function dateValidation(obj: object, errors): boolean | ValidationErrors {
  const schema = Joi.object({
    day: Joi.number().empty('').required().integer().min(1).max(moment().date()).required().messages({
      'any.required': errors.missingDay,
      'number.base': errors.incorrectFormat,
      'number.integer': errors.incorrectFormat,
      'number.min': errors.incorrectFormat,
      'number.max': errors.inPast
    }),
    month: Joi.number().empty('').required().integer().min(1).max(moment().month() + 1).required().messages({
      'any.required': errors.missingMonth,
      'number.base': errors.incorrectFormat,
      'number.integer': errors.incorrectFormat,
      'number.min': errors.incorrectFormat,
      'number.max': errors.inPast
    }),
    year: Joi.number().empty('').required().integer().min(1).max(moment().year()).required().messages({
      'any.required': errors.missingYear,
      'number.base': errors.incorrectFormat,
      'number.integer': errors.incorrectFormat,
      'number.min': errors.incorrectFormat,
      'number.max': errors.inPast
    })
  });

  return validate(obj, schema);
}

function appellantNamesValidation(obj: object) {
  const schema = Joi.object({
    givenNames: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.givenNames }),
    familyName: Joi.string().required().messages({ 'string.empty': i18n.validationErrors.familyName })

  }).unknown();
  return validate(obj, schema);
}

function contactDetailsValidation(obj: object) {
  const phonePattern = new RegExp('^(?:0|\\+?44)(?:\\d\\s?){9,10}$');
  const schema = Joi.object({
    'email-value': Joi.string()
      .optional()
      .empty('')
      .email({ minDomainSegments: 2, tlds: { allow: [ 'com', 'net', 'co.uk' ] } })
      .messages({
        'string.empty': i18n.validationErrors.emailEmpty,
        'string.email': i18n.validationErrors.emailFormat
      }),
    'text-message-value': Joi.string()
      .optional()
      .empty('')
      .regex(phonePattern)
      .messages({
        'string.empty': i18n.validationErrors.phoneEmpty,
        'string.pattern.base': i18n.validationErrors.phoneFormat
      })
  }).or('email-value', 'text-message-value')
  .messages({
    'object.missing': i18n.validationErrors.contactDetails.selectOneOption
  })
  .unknown();

  return validate(obj, schema);
}

function nationalityValidation(obj: object) {
  const schema = Joi.object({
    statelessNationality: Joi.string().optional(),
    nationality: Joi.string().optional().empty('')
  }).xor('nationality', 'statelessNationality').messages({
    'object.xor': i18n.validationErrors.nationality.onlyOne,
    'object.missing': i18n.validationErrors.nationality.atLeastOne
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
 * Validates an email address using joi validation
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
      .email({ minDomainSegments: 2, tlds: { allow: [ 'com', 'net', 'co.uk' ] } })
      .messages({
        'string.empty': i18n.validationErrors.emailEmpty,
        'string.email': i18n.validationErrors.emailFormat
      })
  }).unknown();

  return validate(obj, schema);
}

/**
 * Validates a phone number using using joi validation with regex
 * @param obj containing the property 'text-message-value' to validate the phone number
 * @return
 * Joi validation will return:
 * 'string.empty': if phone number string is empty
 * 'string.pattern.base': if phone number does not match format
 * @return ValidationError object if there are issues, null if no issues found
 */
function phoneValidation(obj: object): null | ValidationErrors {
  const phonePattern = new RegExp('^(?:0|\\+?44)(?:\\d\\s?){9,10}$');
  const schema = Joi.object({
    'text-message-value': Joi.string()
      .required()
      .regex(phonePattern)
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
    ['address-town']: Joi.string().optional().empty(''),
    ['address-county']: Joi.string().optional().empty(''),
    ['address-line-2']: Joi.string().optional().empty(''),
    ['address-postcode']: Joi.string().regex(postcodeRegex).messages({
      'string.empty': i18n.validationErrors.address.postcodeRequired,
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
    'alternatives.match': i18n.validationErrors.atLeastOneOption,
    'any.required': i18n.validationErrors.required
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
  phoneValidation,
  textAreaValidation,
  statementOfTruthValidation,
  addressValidation,
  typeOfAppealValidation
};
