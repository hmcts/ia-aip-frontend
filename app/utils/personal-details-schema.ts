import Joi from '@hapi/joi';

function enterDetailsValidation(obj: object) {
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

export {
  enterDetailsValidation
};
