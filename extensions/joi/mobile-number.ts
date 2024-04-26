const phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;
const phoneNumberType = require('google-libphonenumber').PhoneNumberType;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

/**
 * Adds an extension to use joi.mobilePhoneNumber() to validate mobile phone numbers only
 * @param joi the joi instance to be extended
 * Usage: const joi = Joi.extend(MobilePhoneNumberExtension);
 * key: joi.mobilePhoneNumber()
 * In the event of failures the following errors are returned:
 * string.empty : if string supplied was empty
 * string.mobilePhoneNumber.invalid.string : if string supplied was invalid
 * string.mobilePhoneNumber.invalid.mobile: if the string supplied was not a mobile phone
 */
module.exports = joi => {
  return ({
    base: joi.string(),
    type: 'mobilePhoneNumber',
    messages: {
      'string.mobilePhoneNumber.invalid.string': '"{{#label}}" did not seem to be a valid phone number',
      'string.mobilePhoneNumber.invalid.mobile': '"{{#label}}" did not seem to be a valid mobile phone number'
    },
    rules: {
      defaultCountry: {
        alias: 'defaultCountries',
        method(country) {
          return this.$_setFlag('defaultCountry', country);
        }
      },
      format: {
        method(format) {
          return this.$_setFlag('format', format);
        }
      }
    },
    validate(value, { schema, error }) {

      /**
       * Supported formatting types
       */
      const supportedTypes = {
        e164: phoneNumberFormat.E164,
        international: phoneNumberFormat.INTERNATIONAL,
        national: phoneNumberFormat.NATIONAL,
        rfc3966: phoneNumberFormat.RFC3966
      };

      /**
       * In the case where the parameters aren't provided it will default to use this values
       */
      const defaults = {
        country: 'GB',
        format: 'e164'
      };

      const defaultCountry = schema.$_getFlag('defaultCountry') || '';
      const formatName = schema.$_getFlag('format') || defaults.format;

      try {
        if (!value.match(new RegExp(/^[+\d][^+]*\d$/))) {
          throw new Error('The string supplied did not begin with a \'+\' or a digit');
        }

        const format = supportedTypes[formatName];
        if (format === undefined) {
          throw new Error('Invalid format value: must be one of [e164, international, national, rfc3966]');
        }
        let mobilePhoneNumber = phoneUtil.parse(value, defaults.country);
        if (defaultCountry === defaults.country) {
          if (!phoneUtil.isValidNumberForRegion(mobilePhoneNumber, defaults.country) ||
              value.slice(0,2) === '44' || value.slice(0,4) === '0044') {
            throw new Error('The string supplied did not seem to be a UK phone number');
          }
        } else {
          try {
            if (!phoneUtil.isValidNumber(mobilePhoneNumber)) {
              mobilePhoneNumber = phoneUtil.parse(value, defaultCountry);
              if (!phoneUtil.isValidNumber(mobilePhoneNumber)) {
                throw new Error('The string supplied did not seem to be a phone number');
              }
            }
          } catch {
            throw new Error('The string supplied did not seem to be a phone number');
          }
        }

        if (![phoneNumberType.MOBILE, phoneNumberType.FIXED_LINE_OR_MOBILE].includes(phoneUtil.getNumberType(mobilePhoneNumber))) {
          throw new Error('The phone supplied did not seem to be a valid mobile phone number');
        }

        return { value: phoneUtil.format(mobilePhoneNumber, format) };

      } catch (err) {
        const knownErrors = [
          {
            error: 'string.mobilePhoneNumber.invalid.string',
            errorMessages: [ 'The string supplied did not seem to be a phone number', 'The string supplied did not seem to be a UK phone number', 'Phone number too short after IDD', 'The string supplied did not begin with a \'+\' or a digit' ]
          },
          {
            error: 'string.mobilePhoneNumber.invalid.mobile',
            errorMessages: [ 'The phone supplied did not seem to be a valid mobile phone number' ]
          }
        ];

        const errorList = [];
        knownErrors.forEach(knownErr => {
          if (knownErr.errorMessages.includes(err.message)) {
            errorList.push(error(knownErr.error));
          }
        });

        if (errorList.length) {
          return { value, errors: errorList };
        }
        throw err;
      }
    }
  });
};
