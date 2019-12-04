import Joi from '@hapi/joi';
import { expect } from '../../utils/testUtils';

const MobilePhoneNumberExtension = require('../../../extensions/joi/mobile-number');

describe('Joi MobilePhoneNumber Extension', () => {
  it('extends', () => {
    const customJoi = Joi.extend(MobilePhoneNumberExtension);
    expect(customJoi.mobilePhoneNumber).to.be.instanceOf(Function);

  });

  describe('scenarios', () => {
    const joi = Joi.extend(MobilePhoneNumberExtension);
    const schema = joi.mobilePhoneNumber();
    it('failures validation ', () => {

      expect(schema.validate('').error).to.be.instanceOf(Error);
      expect(schema.validate(' ').error).to.be.instanceOf(Error);
      expect(schema.validate('1').error).to.be.instanceOf(Error);
      expect(schema.validate('aa').error).to.be.instanceOf(Error);
      expect(schema.validate(1).error).to.be.instanceOf(Error);
      expect(schema.validate(123456).error).to.be.instanceOf(Error);
      expect(schema.validate(null).error).to.be.instanceOf(Error);
      expect(schema.validate({}).error).to.be.instanceOf(Error);
      expect(schema.validate('123').error).to.be.instanceOf(Error);
      expect(schema.validate('494322456').error).to.be.instanceOf(Error);
      expect(schema.validate('011 69 37 83').error).to.be.instanceOf(Error);
      expect(schema.validate('01632 960 002').error).to.be.instanceOf(Error);
      expect(schema.validate('+44 808 157 0192').error).to.be.instanceOf(Error);
      expect(schema.validate('0044 808 157 0192').error).to.be.instanceOf(Error);
    });

    it('passes validation', () => {

      const testNumbers = [
        '+32 494 32 24 56',
        '+32494322456',
        '0032 494 32 24 56',
        '0032494322456',
        '+4407123456789',
        '+44 07123 456 789',
        '00447123456789',
        '0044 7123 456 789',
        '07123456789',
        '07123 456 789'
      ];

      const validationResults = testNumbers.map(numb => {
        return schema.validate(numb).error;
      });

      validationResults.forEach(result => {
        expect(result).to.be.undefined;
      });

      expect(schema.validate(undefined).error).to.be.undefined;

    });
  });

  describe('validates and throws error type', () => {
    const joi = Joi.extend(MobilePhoneNumberExtension);

    it('string.empty - when string provided was empty', () => {
      const schema = joi.mobilePhoneNumber();
      expect(schema.validate('').error.details[0].type).to.be.eq('string.empty');
    });

    it('string.mobilePhoneNumber.invalid.string - when string provided was not a valid phone', () => {
      const testNumbers = [
        '123',
        ' ',
        '.',
        'aa',
        '1a1234567890'
      ];

      const schema = joi.mobilePhoneNumber();
      const validationResults = testNumbers.map(numb => {
        return schema.validate(numb).error;
      });

      validationResults.forEach(result => {
        expect(result.details[0].type).to.be.eq('string.mobilePhoneNumber.invalid.string');
      });
    });

    it('string.mobilePhoneNumber.invalid.mobile - when string provided was not a mobile phone', () => {
      const testNumbers = [
        '08081570192',
        '0808 157 0192',
        '00448081570192',
        '0044 808 157 0192',
        '+448081570192',
        '+44 808 157 0192',
        '1234567890'
      ];

      const schema = joi.mobilePhoneNumber();
      const validationResults = testNumbers.map(numb => {
        return schema.validate(numb).error;
      });

      validationResults.forEach(result => {
        expect(result.details[0].type).to.be.eq('string.mobilePhoneNumber.invalid.mobile');
      });
    });
  });

  describe('formats input', () => {
    const joi = Joi.extend(MobilePhoneNumberExtension);
    let schema;

    it('formats by default', () => {
      schema = joi.mobilePhoneNumber();
      expect(schema.validate('07123456789').value).to.be.eq('+447123456789');
    });

    describe('e164', () => {

      it('formats when format is specified', () => {
        schema = joi.mobilePhoneNumber().format('e164');
        expect(schema.validate('07123456789').value).to.be.eq('+447123456789');
      });

      it('formats when format is specified and country', () => {
        schema = joi.mobilePhoneNumber().format('e164').defaultCountry('BE');
        expect(schema.validate('494322456').value).to.be.eq('+32494322456');
      });
    });

    describe('international', () => {

      it('formats when format is specified', () => {
        schema = joi.mobilePhoneNumber().format('international');
        expect(schema.validate('07123456789').value).to.be.eq('+44 7123 456789');
      });

      it('formats when format is specified and country', () => {
        schema = joi.mobilePhoneNumber().format('international').defaultCountry('BE');
        expect(schema.validate('494322456').value).to.be.eq('+32 494 32 24 56');
      });
    });

    describe('national', () => {
      it('formats when format is specified', () => {
        schema = joi.mobilePhoneNumber().format('national');
        expect(schema.validate('07123456789').value).to.be.eq('07123 456789');
      });

      it('formats when format is specified and country', () => {
        schema = joi.mobilePhoneNumber().format('national').defaultCountry('BE');
        expect(schema.validate('494322456').value).to.be.eq('0494 32 24 56');
      });
    });

    describe('rfc3966', () => {

      it('formats when format is specified', () => {
        schema = joi.mobilePhoneNumber().format('rfc3966');
        expect(schema.validate('07123456789').value).to.be.eq('tel:+44-7123-456789');
      });

      it('formats when format is specified and country', () => {
        schema = joi.mobilePhoneNumber().format('rfc3966').defaultCountry('BE');
        expect(schema.validate('494322456').value).to.be.eq('tel:+32-494-32-24-56');
      });

    });

    describe('errors', () => {
      it('errors on wrong format options', () => {
        const joi = Joi.extend(MobilePhoneNumberExtension);
        schema = joi.mobilePhoneNumber().format('something');
        expect(() => schema.validate('494322456'))
          .to.throw('Invalid format value: must be one of [e164, international, national, rfc3966]');
      });
    });
  });
});
