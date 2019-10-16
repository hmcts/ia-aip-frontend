import joi from 'joi';

export const testSchema: Object = {
  name: joi.string(),
  mobileNumber: joi.number()
};
