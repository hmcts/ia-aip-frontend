import {
  appellantNamesValidation,
  askForMoreTimeValidation,
  contactDetailsValidation,
  dateValidation,
  DOBValidation,
  emailValidation,
  homeOfficeNumberValidation,
  isDateInRange,
  reasonForAppealDecisionValidation,
  selectedRequiredValidation,
  statementOfTruthValidation,
  textAreaValidation,
  yesOrNoRequiredValidation
} from '../../../../app/utils/validations/fields-validations';
import i18n from '../../../../locale/en.json';
import { expect } from '../../../utils/testUtils';

describe('fields-validations', () => {
  function createError(fieldName, errorMessage) {
    return {
      href: `#${fieldName}`,
      key: fieldName,
      text: errorMessage
    };
  }

  describe('homeOfficeNumberValidation', () => {
    it('should validate a UAN', () => {
      const validations = homeOfficeNumberValidation({ homeOfficeRefNumber: '1212-0099-0089-1080' });
      expect(validations).to.equal(null);
    });

    it('should validate a 9 digit CID reference', () => {
      const validations = homeOfficeNumberValidation({ homeOfficeRefNumber: '121210801' });
      expect(validations).to.equal(null);
    });

    it('should validate an 8 digit CID reference', () => {
      const validations = homeOfficeNumberValidation({ homeOfficeRefNumber: '12121080' });
      expect(validations).to.equal(null);
    });

    it('should fail validation and return empty warning message', () => {
      const validations = homeOfficeNumberValidation({ homeOfficeRefNumber: '' });

      expect(validations).to.deep.equal({
        homeOfficeRefNumber: {
          href: '#homeOfficeRefNumber',
          key: 'homeOfficeRefNumber',
          text: 'Enter the Home Office reference number'
        }
      });
    });
  });

  describe('dateValidation', () => {
    const errors = { ...i18n.validationErrors.dateLetterSent };

    it('should validate', () => {
      const validDate = { day: '1', month: '1', year: '2000' };
      const validations = dateValidation(validDate, errors);
      expect(validations).to.deep.equal(null);
    });

    it('fields cannot be empty', () => {
      let notValidDate = { day: '', month: '', year: '' };
      let validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal({
        day: createError('day', errors.missing)
      });

      notValidDate = { day: '1', month: '', year: '' };
      validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal({
        month: createError('month', errors.missing)
      });

      notValidDate = { day: '1', month: '1', year: '' };
      validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal({
        year: createError('year', errors.missing)
      });
    });

    it('fields must be numbers', () => {
      const notValidDate = { day: 'a', month: 'b', year: 'c' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat)
        });
    });

    it('fields must be integers', () => {
      const notValidDate = { day: '1.1', month: '2.2', year: '1000.1' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat)
        });
    });

    it('fields must greater than 0', () => {
      // not sure how we can do this for day and month
      const notValidDate = { day: '0', month: '0', year: '0' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat)
        });
    });

    it('fields must be in past', () => {
      const notValidDate = { day: '1', month: '1', year: '5000' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          date: createError('date', errors.inPast)
        });
    });

    it('can have fields that are not part of date', () => {
      const validDate = { day: '1', month: '1', year: '2000', saveAndContiune: 'saveAndContiune' };
      const validations = dateValidation(validDate, errors);
      expect(validations).to.deep.equal(null);
    });

    it('date is empty ', () => {
      const notValidDate = { day: '44', month: '22', year: '9999' };
      const validations = DOBValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          date: createError('date', errors.incorrectFormat)
        });
    });
  });

  describe('appellantNameValidation', () => {
    it('should validate a name', () => {
      const validationResult = appellantNamesValidation({ givenNames: 'givenNames', familyName: 'familyName' });
      expect(validationResult).to.equal(null);
    });

    it('should fail validation when given names is blank', () => {
      const validationResult = appellantNamesValidation({ givenNames: '', familyName: 'familyName' });
      expect(validationResult).to.deep.equal({
        givenNames: {
          href: '#givenNames',
          key: 'givenNames',
          text: 'Enter your given name or names'
        }
      });
    });

    it('should fail validation when family names is blank', () => {
      const validationResult = appellantNamesValidation({ givenNames: 'givenName', familyName: '' });
      expect(validationResult).to.deep.equal({
        familyName: {
          href: '#familyName',
          key: 'familyName',
          text: 'Enter your family name or names'
        }
      });
    });
  });

  describe('emailValidation', () => {
    it('should validate an email Address', () => {
      const object = { 'email-value': 'alejandro@exmple.net' };
      const validationResult = emailValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail email validation and return "string.empty" type', () => {
      const object = { 'email-value': '' };
      const validationResult = emailValidation(object);
      const expectedResponse = {
        'email-value': {
          'key': 'email-value',
          'text': 'Enter an email address',
          'href': '#email-value'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });

    it('should fail email validation and return "string.format" type', () => {
      const object = { 'email-value': 'thisisnotanemailexample.net' };
      const validationResult = emailValidation(object);

      const expectedResponse = {
        'email-value': {
          'key': 'email-value',
          'text': 'Enter an email address in the correct format, like name@example.com',
          'href': '#email-value'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });

    it('should fail email validation and return "string.format" type on unicode emails', () => {
      const object = { 'email-value': 'あいうえお@domain.com' };
      const validationResult = emailValidation(object);

      const expectedResponse = {
        'email-value': {
          'key': 'email-value',
          'text': 'Enter an email address in the correct format, like name@example.com',
          'href': '#email-value'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });
  });

  describe('textAreaValidation', () => {
    it('should validate', () => {
      const text: string = 'Some text here.';
      const key: string = 'aKey';
      const validations = textAreaValidation(text, key);

      expect(validations).to.equal(null);
    });

    it('should fail validation', () => {
      const text: string = '';
      const key: string = 'aKey';
      const validations = textAreaValidation(text, key);

      expect(validations).to.deep.equal(
        {
          [key]: {
            href: '#aKey',
            key: 'aKey',
            text: i18n.validationErrors.emptyReasonAppealIsLate
          }
        }
      );
    });
  });

  describe('statementOfTruthValidation', () => {
    it('should validate if statement present', () => {
      const object = { 'statement': 'acceptance' };
      const validationResult = statementOfTruthValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail validation and return "any.required" type', () => {
      const object = {};
      const validationResult = statementOfTruthValidation(object);
      const expectedResponse = {
        statement: {
          href: '#statement',
          key: 'statement',
          text: 'Select if you believe the information you have given is true.'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });

  });

  describe('contactDetailsValidation', () => {
    function testContactDetailsValidation(object, key, message) {
      const validationResult = contactDetailsValidation(object);
      const expectedResponse = {};
      expectedResponse[key] = {
        'href': `#${key}`,
        'key': key,
        'text': message
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    }

    it('should fail validation if no type of contact details found', () => {
      testContactDetailsValidation({ selections: '' }, 'selections', 'Select at least one of the contact options');
    });

    it('should fail validation if no email entered', () => {
      testContactDetailsValidation({ selections: 'email' }, 'email-value', 'Enter an email address');
      testContactDetailsValidation({ selections: 'email', 'email-value': '' }, 'email-value', 'Enter an email address');
    });

    it('should fail validation if email not in correct format', () => {
      testContactDetailsValidation(
        { selections: 'email', 'email-value': 'not an email' },
        'email-value',
        'Enter an email address in the correct format, like name@example.com'
      );
    });

    it('should pass validation when an email is entered', () => {
      const validationResult = contactDetailsValidation({ selections: 'email', 'email-value': 'foo@bar.com' });
      expect(validationResult).to.equal(null);
    });

    it('should fail validation if no mobile phone number entered entered', () => {
      testContactDetailsValidation({
        selections: 'text-message',
        'text-message-value': ''
      }, 'text-message-value', 'Enter a phone number');
    });

    it('should fail validation if mobile phone number not incorrect format', () => {
      testContactDetailsValidation({
        selections: 'text-message',
        'text-message-value': 'qwerty'
      }, 'text-message-value', 'Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999');
    });

    it('should fail validation if mobile phone number not a mobile phone number', () => {
      testContactDetailsValidation({
        selections: 'text-message',
        'text-message-value': '01277222222'
      }, 'text-message-value', 'Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999');
    });

    it('should pass validation when a mobile phone number is entered', () => {
      const validationResult = contactDetailsValidation({
        selections: 'text-message',
        'text-message-value': '07899999999'
      });
      expect(validationResult).to.equal(null);
    });

    it('should pass validation when an email and mobile phone number is entered', () => {
      const validationResult = contactDetailsValidation({
        selections: 'email,text-message',
        'email-value': 'foo@bar.com',
        'text-message-value': '07899999999'
      });
      expect(validationResult).to.equal(null);
    });

    it('should pass validation when an invalid email entered but only text-message selected', () => {
      const validationResult = contactDetailsValidation({
        selections: 'text-message',
        'email-value': 'invalid',
        'text-message-value': '07899999999'
      });
      expect(validationResult).to.equal(null);
    });

    it('should pass validation when an invalid mobile number entered but only email selected', () => {
      const validationResult = contactDetailsValidation({
        selections: 'email',
        'email-value': 'foo@bar.com',
        'text-message-value': 'invalid'
      });
      expect(validationResult).to.equal(null);
    });

    it('should fail validation when an email and mobile phone number are not entered', () => {
      const validationResult = contactDetailsValidation({
        selections: 'email,text-message',
        'email-value': '',
        'text-message-value': ''
      });
      expect(validationResult).to.deep.equal({
        'email-value': {
          'href': '#email-value',
          'key': 'email-value',
          'text': 'Enter an email address'
        },
        'text-message-value': {
          'href': '#text-message-value',
          'key': 'text-message-value',
          'text': 'Enter a phone number'
        }
      });
    });

    describe('yesOrNoRequiredValidation', () => {
      it('no error if yes selected', () => {
        const validationResult = yesOrNoRequiredValidation({ answer: 'yes' }, 'error message');

        expect(validationResult).to.deep.equal(null);
      });

      it('error if yes on no not selected', () => {
        const validationResult = yesOrNoRequiredValidation({}, 'error message');
        const expectedResponse = {};
        expectedResponse['answer'] = {
          'href': '#answer',
          'key': 'answer',
          'text': 'error message'
        };
        expect(validationResult).to.deep.equal(expectedResponse);
      });
    });
  });

  describe('reasonForAppealDecisionValidation', () => {
    it('should validate if statement present', () => {
      const object = { 'applicationReason': 'some reason text here' };
      const validationResult = reasonForAppealDecisionValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail validation and return "string.empty" type', () => {
      const object = { 'applicationReason': '' };
      const validationResult = reasonForAppealDecisionValidation(object);
      const expectedResponse = {

        applicationReason: {
          href: '#applicationReason',
          key: 'applicationReason',
          text: 'Enter the reasons you think the Home Office decision is wrong'
        }

      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });
  });

  describe('reasonForAppealDecisionValidation', () => {
    it('should validate if statement present', () => {
      const object = { 'applicationReason': 'some reason text here' };
      const validationResult = reasonForAppealDecisionValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail validation and return "string.empty" type', () => {
      const object = { 'applicationReason': '' };
      const validationResult = reasonForAppealDecisionValidation(object);
      const expectedResponse = {

        applicationReason: {
          href: '#applicationReason',
          key: 'applicationReason',
          text: 'Enter the reasons you think the Home Office decision is wrong'
        }

      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });

    it('should fail validation and return "string.empty" type ask for more time', () => {
      const object = { 'askForMoreTime': '' };
      const validationResult = askForMoreTimeValidation(object);
      const expectedResponse = {

        askForMoreTime: {
          href: '#askForMoreTime',
          key: 'askForMoreTime',
          text: 'Enter how much time you need and why you need it'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });

    it('should fail validation and return "string.empty" ', () => {
      const object = { 'language': '' };
      const validationResult = selectedRequiredValidation(object, 'test');
      const expectedResponse = {

        language: {
          href: '#language',
          key: 'language',
          text: 'test'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });
  });

  describe('isDateInRange', () => {

    it('should validate', () => {
      const validDate = { day: '1', month: '1', year: '2020' };
      const validations = isDateInRange('1-1-2019', '1-1-2021', validDate);
      expect(validations).to.deep.equal(null);
    });

    it('fields cannot be empty', () => {
      let notValidDate = { day: '', month: '', year: '' };
      let validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);

      const expectedError = i18n.validationErrors.cmaRequirements.datesToAvoid.date.missing;
      expect(validations).to.deep.equal({
        day: createError('day', expectedError)
      });

      notValidDate = { day: '1', month: '', year: '' };
      validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);

      expect(validations).to.deep.equal({
        month: createError('month', expectedError)
      });

      notValidDate = { day: '1', month: '1', year: '' };
      validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);

      expect(validations).to.deep.equal({
        year: createError('year', expectedError)
      });
    });

    it('fields must be numbers', () => {
      let notValidDate = { day: 'a', month: 'b', year: 'c' };
      const expectedError = i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat;
      let validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);

      expect(validations).to.deep.equal(
        {
          day: createError('day', expectedError)
        });

      notValidDate = { day: '2', month: 'b', year: 'c' };
      validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);

      expect(validations).to.deep.equal(
        {
          month: createError('month', expectedError)
        });

      notValidDate = { day: '2', month: '1', year: 'c' };
      validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);

      expect(validations).to.deep.equal(
        {
          year: createError('year', expectedError)
        });
    });

    it('fields must be integers', () => {
      const notValidDate = { day: '1.1', month: '2.2', year: '1000.1' };
      const validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);
      const expectedError = i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat;

      expect(validations).to.deep.equal(
        {
          day: createError('day', expectedError)
        });
    });

    it('fields must greater than 0', () => {
      // not sure how we can do this for day and month
      const notValidDate = { day: '0', month: '0', year: '0' };
      const validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);
      const expectedError = i18n.validationErrors.cmaRequirements.datesToAvoid.date.incorrectFormat;

      expect(validations).to.deep.equal(
        {
          day: createError('day', expectedError)
        });
    });

    it('date must be within range', () => {
      let notValidDate = { day: '1', month: '1', year: '2022' };
      let validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);
      let expectedError = 'Enter a date between 1-1-2019 and 1-1-2021';

      expect(validations).to.deep.equal(
        {
          date: createError('date', expectedError)
        });

      notValidDate = { day: '1', month: '1', year: '2018' };
      validations = isDateInRange('1-1-2019', '1-1-2021', notValidDate);
      expectedError = 'Enter a date between 1-1-2019 and 1-1-2021';

      expect(validations).to.deep.equal(
        {
          date: createError('date', expectedError)
        });

      const validDate = { day: '1', month: '6', year: '2020' };
      validations = isDateInRange('1-1-2019', '1-1-2021', validDate);

      expect(validations).to.deep.equal(null);

    });
  });
});
