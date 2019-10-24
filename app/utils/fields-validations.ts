import Joi from '@hapi/joi';
import i18n from '../../locale/en.json';

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

function dateOfBirthValidation(obj: object) {
  const schema = Joi.object({
    day: Joi.number().min(1).max(31).required().messages({ 'number.base': 'Please Enter a day', 'number.max': 'Needs to be a valid date.', 'number.min': 'Needs to be above 0.' }),
    month: Joi.number().min(1).max(12).required().messages({ 'number.base': 'Please Enter a month', 'number.max': 'Needs to be a valid date.', 'number.min': 'Needs to be above 0.' }),
    year: Joi.number().min(1111).max(2019).required().messages({ 'number.base': 'Please Enter a year', 'number.min': 'Needs to be above 0.', 'number.max': 'Needs to be a valid date.' })

  });
  const result = schema.validate(obj, { abortEarly: false });
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
        href: '#'
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

  }).xor('nationality','stateless').messages({ 'object.xor': 'Please select one option.' })
      .xor('nationality','stateless').messages({ 'object.missing': 'Please select a nationality.' });
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

export {
  homeOfficeNumberValidation,
    dateOfBirthValidation,
    appellantNamesValidation,
    nationalityValidation
};
