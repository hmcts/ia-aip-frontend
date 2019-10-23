import Joi from '@hapi/joi';

function enterDateValidation(obj: object) {
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

export {
    enterDateValidation
};
