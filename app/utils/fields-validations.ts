import Joi from '@hapi/joi';
import moment from 'moment';
import i18n from '../../locale/en.json';

/**
 * Uses Joi schema validation to validate and object and returns:
 * an object containing list of errors if errors were found
 * or null if no errors where found
 * @param obj the object to be validated
 * @param schema the schema to validate the object
 */
function validate(obj: object, schema: any): ValidationErrors {
  const result = schema.validate(obj, { abortEarly: false });
  if (result.error) {
    return result.error.details.reduce((acc, curr): ValidationError => {
      acc[curr.context.key] = {
        key: curr.context.key,
        text: curr.message,
        href: `#${curr.context.key}`
      };
      return acc;
    }, {});
  }
  return null;
}

function textAreaValidation(text: string, theKey: string): boolean | ValidationErrors {
  const schema = Joi
    .string()
    .required()
    .min(3)
    .messages({
      'any.required': i18n.validationErrors.required,
      'string.empty': i18n.validationErrors.empty,
      'string.min': i18n.validationErrors.stringMin
    });
  const result = schema.validate(text);
  if (result.error) {
    const error: ValidationErrors = {
      [theKey]: {
        key: theKey,
        text: result.error.details[0].message,
        href: `#${theKey}`
      }
    };

    return error;
  }
  return false;
}

function homeOfficeNumberValidation(reference: string) {
  const schema = Joi
    .string()
    .required()
    .regex(/^[a-zA-Z]{1}[0-9]{7}$/)
    .messages({
      'string.empty': i18n.validationErrors.empty,
      'string.pattern.base': i18n.validationErrors.homeOfficeRef
    });
  const result = schema.validate(reference);
  if (result.error) {
    return result.error.details[0].message;
  }
  return false;
}

function dateValidation(obj: object): boolean | ValidationErrors {
  const schema = Joi.object({
    day: Joi.number().min(1).max(31).required().messages({
      'number.base': 'Please Enter a day',
      'number.max': 'Needs to be a valid date.',
      'number.min': 'Needs to be above 0.'
    }),
    month: Joi.number().min(1).max(12).required().messages({
      'number.base': 'Please Enter a month',
      'number.max': 'Needs to be a valid date.',
      'number.min': 'Needs to be above 0.'
    }),
    year: Joi.number().min(1111).max(moment().year()).required().messages({
      'number.base': 'Please Enter a year',
      'number.min': 'Needs to be above 0.',
      'number.max': 'Needs to be a valid date.'
    })
  });

  return validate(obj, schema);
}

function appellantNamesValidation(obj: object) {
  const schema = Joi.object({
    givenNames: Joi.string().required().messages({ 'string.empty': 'Please Enter Given Names' }),
    familyName: Joi.string().required().messages({ 'string.empty': 'Please Enter Family Name' })

  });
  const result = schema.validate(obj, { abortEarly: false });
  if (result.error) {
    const errors: Array<object> = [];
    result.error.details.map(error => {
      errors.push({
        text: error.message,
        href: `#${error.context.key}`
      });
    });
    return errors;
  }
  return false;
}

function nationalityValidation(obj: object) {
  const schema = Joi.object({
    stateless: Joi.string().optional(),
    nationality: Joi.string().optional().empty('')

  }).xor('nationality', 'stateless').messages({ 'object.xor': 'Please select one option.' })
    .xor('nationality', 'stateless').messages({ 'object.missing': 'Please select a nationality.' });
  const result = schema.validate(obj, { abortEarly: true });
  if (result.error) {
    const errors: Array<object> = [];
    result.error.details.map(error => {
      errors.push({
        text: error.message,
        href: '#'
      });
    });
    return errors;
  }
  return false;
}

function postcodeValidation(obj: object): ValidationErrors | null {
  const postcodeRegex = /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;

  const schema = Joi.object({
    postcode: Joi.string().regex(postcodeRegex).messages({
      'string.empty': 'Enter your postcode',
      'string.pattern.base': 'Enter a valid postcode'
    })
  });
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
    ['address-line-1']: Joi.string().required().messages({ 'string.empty': 'Enter a building number and street name.' }),
    ['address-town']: Joi.string().required().messages({ 'string.empty': 'Enter Town or City.' }),
    ['address-county']: Joi.string().required().messages({ 'string.empty': 'Enter a County.' }),
    ['address-line-2']: Joi.string().optional().empty(''),
    ['address-postcode']: Joi.string().optional().empty('')
  });
  return validate(obj, schema);
}

function selectPostcodeValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
    dropdown: Joi.string().required().messages({ 'string.empty': 'Select a address' })

  });
  return validate(obj, schema);
}

export {
  homeOfficeNumberValidation,
  dateValidation,
  appellantNamesValidation,
  postcodeValidation,
  nationalityValidation,
  emailValidation,
  phoneValidation,
  textAreaValidation,
  statementOfTruthValidation,
  addressValidation,
  selectPostcodeValidation
};
