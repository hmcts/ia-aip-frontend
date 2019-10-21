import Joi from '@hapi/joi';
import i18n from '../../locale/en.json';

function homeOfficeNumberValidation(reference: string) {
  const schema = Joi
    .string()
    .required()
    .regex(/^[a-zA-Z]{1}[0-9]{7}$/)
    .messages({
      'string.empty': i18n.fieldsValidations.empty,
      'string.pattern.base': i18n.fieldsValidations.homeOfficeRef
    });
  const result = schema.validate(reference);
  if (result.error) {
    return result.error.details[0].message;
  }
  return false;
}

export {
  homeOfficeNumberValidation
};
