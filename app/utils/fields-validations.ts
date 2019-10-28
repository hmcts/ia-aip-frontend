import Joi from '@hapi/joi';
import moment from 'moment';
import i18n from '../../locale/en.json';

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

interface ValidationError {
  key: string;
  text: string;
  href: string;
}

interface ValidationErrors {
  [key: string]: ValidationError;
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
    year: Joi.number().min(1111).max(2019).required().messages({
      'number.base': 'Please Enter a year',
      'number.min': 'Needs to be above 0.',
      'number.max': 'Needs to be a valid date.'
    })
  });

  const result = schema.validate(obj, { abortEarly: false });
  if (result.error) {
    const errors: ValidationErrors =
      result.error.details.reduce((acc, curr): ValidationError => {
        acc[curr.context.key] = {
          key: curr.context.key,
          text: curr.message,
          href: `#${curr.context.key}`
        };
        return acc;
      }, {});
    return errors;
  }
  return false;
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

/**
 * Validates an email address using joi validation
 * @param obj containing the property 'email-value' to validate the email
 * @return
 * 'string.empty': if email string is empty
 * 'string.email': if email address does not match format
 * 'null': if no errors were found
 */
function emailValidation(obj: object): null | ValidationErrors {
  const schema = Joi.object({
        'email-value': Joi.string()
            .required()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'co.uk'] } })
            .messages({
                'string.empty': i18n.validationErrors.emailEmpty,
                'string.email': i18n.validationErrors.emailFormat
            })
    }).unknown();

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

/**
 * Validates a phone number using using joi validation with regex
 * @param obj containing the property 'text-message-value' to validate the phone number
 * @return
 * 'string.empty': if phone number string is empty
 * 'string.pattern.base': if phone number does not match format
 * 'null': if no errors were found
 */
function phoneValidation(obj: object) {
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

function postcodeValidation(obj: object) {
  const postcodeRegex = /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;

  const schema = Joi.object({
    postcode: Joi.string().regex(postcodeRegex).messages({ 'string.empty': 'Enter your postcode', 'string.pattern.base': 'Enter a valid postcode' })
  });
  const result = schema.validate(obj, { abortEarly: true, allowUnknown: true });
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

export {
  homeOfficeNumberValidation,
  dateValidation,
  appellantNamesValidation,
  postcodeValidation,
  nationalityValidation,
  emailValidation,
  phoneValidation,
  textAreaValidation
};
