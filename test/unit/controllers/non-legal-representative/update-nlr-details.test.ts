import { Request, Response } from 'express';
import {
  getNlrAddress,
  getNlrContactDetails,
  getNlrName,
  getUpdateNlrDetailsCheckAndSend,
  getUpdateNlrDetailsConfirmation,
  postNlrAddress,
  postNlrContactDetails,
  postNlrName,
  postUpdateNlrDetailsCheckAndSend,
  setupNlrUpdatePhoneNumberControllers,
} from '../../../../app/controllers/non-legal-representative/update-nlr-details';
import { Events } from '../../../../app/data/events';
import { isJourneyAllowedMiddleware } from '../../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { createStructuredError } from '../../../../app/utils/validations/fields-validations';
import i18n from '../../../../locale/en.json';
import { buildExpectedRequiredError, expect, sinon } from '../../../utils/testUtils';

describe('Update phone number controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  const error = new Error('some error message');
  let throwStub: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          application: {},
          nlrDetails: {}
        }
      }
    } as Partial<Request>;
    redirectStub = sandbox.stub();
    renderStub = sandbox.stub();
    throwStub = sandbox.stub().throws(error);
    res = {
      render: renderStub,
      redirect: redirectStub,
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getNlrName', () => {
    it('should render name.njk', () => {
      req.query.edit = '';
      getNlrName(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.nonLegalRep.updateName,
        nlrGivenNames: undefined,
        nlrFamilyName: undefined,
        previousPage: paths.common.overview
      });
    });

    it('should render name.njk with names if present', () => {
      req.session.appeal.nlrDetails.givenNames = 'someGivenName';
      req.session.appeal.nlrDetails.familyName = 'someFamilyName';
      getNlrName(req as Request, res as Response, next);

      expect(renderStub.calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.nonLegalRep.updateName,
        nlrGivenNames: 'someGivenName',
        nlrFamilyName: 'someFamilyName',
        previousPage: paths.common.overview
      })).to.equal(true);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getNlrName(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postNlrName', () => {
    it('should render with error if validation fails required', async () => {
      await postNlrName()(req as Request, res as Response, next);

      const expectedError = {
        'nlrGivenNames': buildExpectedRequiredError('nlrGivenNames'),
        'nlrFamilyName': buildExpectedRequiredError('nlrFamilyName')
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.nonLegalRep.updateName,
        nlrGivenNames: undefined,
        nlrFamilyName: undefined,
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.common.overview
      });
    });

    it('should render with error if validation fails one name', async () => {
      req.body.nlrGivenNames = 'someGivenName';
      req.body.nlrFamilyName = '';
      await postNlrName()(req as Request, res as Response, next);

      const expectedError = {
        'nlrFamilyName': createStructuredError('nlrFamilyName', i18n.validationErrors.nlrFamilyName)
      };

      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.nonLegalRep.updateName,
        nlrGivenNames: 'someGivenName',
        nlrFamilyName: '',
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.common.overview
      });
    });

    it('should render with error if validation fails both names', async () => {
      req.body.nlrGivenNames = '';
      req.body.nlrFamilyName = '';
      await postNlrName()(req as Request, res as Response, next);

      const expectedError = {
        'nlrGivenNames': createStructuredError('nlrGivenNames', i18n.validationErrors.nlrGivenNames),
        'nlrFamilyName': createStructuredError('nlrFamilyName', i18n.validationErrors.nlrFamilyName)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.nonLegalRep.updateName,
        nlrGivenNames: '',
        nlrFamilyName: '',
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.common.overview
      });
    });

    it('should update req.session.appeal and redirect to address if validation passes', async () => {
      req.body.nlrGivenNames = 'someGivenName';
      req.body.nlrFamilyName = 'someFamilyName';
      expect(req.session.appeal.nlrDetails.givenNames).to.equal(undefined);
      expect(req.session.appeal.nlrDetails.familyName).to.equal(undefined);

      await postNlrName()(req as Request, res as Response, next);
      expect(req.session.appeal.nlrDetails.givenNames).to.equal('someGivenName');
      expect(req.session.appeal.nlrDetails.familyName).to.equal('someFamilyName');
      expect(redirectStub).calledWith(paths.nonLegalRep.updateAddress);
    });

    it('should redirect to CYA if validation passes and isEdit true', async () => {
      req.body.nlrGivenNames = 'someGivenName';
      req.body.nlrFamilyName = 'someFamilyName';
      req.session.appeal.application.isEdit = true;
      expect(req.session.appeal.nlrDetails.givenNames).to.equal(undefined);
      expect(req.session.appeal.nlrDetails.familyName).to.equal(undefined);

      await postNlrName()(req as Request, res as Response, next);
      expect(req.session.appeal.nlrDetails.givenNames).to.equal('someGivenName');
      expect(req.session.appeal.nlrDetails.familyName).to.equal('someFamilyName');
      expect(redirectStub).calledWith(paths.nonLegalRep.updateDetailsCheckAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrName()(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getNlrAddress', () => {
    it('should render address.njk', () => {
      req.query.edit = '';
      getNlrAddress(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.nonLegalRep.updateAddress,
        address: undefined,
        previousPage: paths.nonLegalRep.updateName
      });
    });

    it('should render address.njk with address if present', () => {
      const expectedAddress: Address = {
        line1: 'line1',
        city: 'city',
        postcode: 'postcode'
      };

      req.session.appeal.nlrDetails.address = expectedAddress;
      getNlrAddress(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.nonLegalRep.updateAddress,
        address: expectedAddress,
        previousPage: paths.nonLegalRep.updateName
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getNlrAddress(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postNlrAddress', () => {
    it('should render with error if validation fails required', async () => {
      await postNlrAddress()(req as Request, res as Response, next);

      const expectedError = {
        'address-line-1': buildExpectedRequiredError('address-line-1'),
        'address-town': buildExpectedRequiredError('address-town'),
        'address-postcode': buildExpectedRequiredError('address-postcode')
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.nonLegalRep.updateAddress,
        nlrAddress: {
          line1: undefined,
          line2: undefined,
          city: undefined,
          county: undefined,
          postcode: undefined
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.updateName
      });
    });

    it('should render with error if validation fails empty', async () => {
      req.body['address-line-1'] = '';
      req.body['address-town'] = '';
      req.body['address-postcode'] = '';
      await postNlrAddress()(req as Request, res as Response, next);

      const expectedError = {
        'address-line-1': createStructuredError('address-line-1', i18n.validationErrors.nlrAddress.line1Required),
        'address-town': createStructuredError('address-town', i18n.validationErrors.nlrAddress.townCityRequired),
        'address-postcode': createStructuredError('address-postcode', i18n.validationErrors.nlrAddress.postcodeRequired)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.nonLegalRep.updateAddress,
        nlrAddress: {
          line1: '',
          line2: undefined,
          city: '',
          county: undefined,
          postcode: ''
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.updateName
      });
    });

    it('should render with error if postcode validation fails invalid', async () => {
      req.body['address-line-1'] = 'line1';
      req.body['address-town'] = 'town';
      req.body['address-postcode'] = 'someBadPostcode';
      await postNlrAddress()(req as Request, res as Response, next);

      const expectedError = {
        'address-postcode': {
          key: 'address-postcode',
          text: i18n.validationErrors.postcode.invalid,
          href: '#address-postcode'
        }
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.nonLegalRep.updateAddress,
        nlrAddress: {
          line1: 'line1',
          line2: undefined,
          city: 'town',
          county: undefined,
          postcode: 'someBadPostcode'
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.updateName
      });
    });

    it('should update req.session.appeal and redirect to contact details if validation passes and isEdit true', async () => {
      req.body['address-line-1'] = 'line1';
      req.body['address-town'] = 'town';
      req.body['address-postcode'] = 'SW1A 2AA';
      expect(req.session.appeal.nlrDetails.address).to.equal(undefined);
      await postNlrAddress()(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.address).to.deep.equal({
        line1: 'line1',
        line2: undefined,
        city: 'town',
        county: undefined,
        postcode: 'SW1A 2AA'
      });
      expect(redirectStub).calledWith(paths.nonLegalRep.updateContactDetails);
    });

    it('should update req.session.appeal and redirect to CYA if validation passes and isEdit true', async () => {
      req.body['address-line-1'] = 'line1';
      req.body['address-line-2'] = 'line2';
      req.body['address-town'] = 'town';
      req.body['address-county'] = 'county';
      req.body['address-postcode'] = 'SW1A 2AA';
      req.session.appeal.application.isEdit = true;
      expect(req.session.appeal.nlrDetails.address).to.equal(undefined);
      await postNlrAddress()(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.address).to.deep.equal({
        line1: 'line1',
        line2: 'line2',
        city: 'town',
        county: 'county',
        postcode: 'SW1A 2AA'
      });
      expect(redirectStub).calledWith(paths.nonLegalRep.updateDetailsCheckAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrAddress()(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getNlrContactDetails', () => {
    it('should render contact-details.njk', () => {
      req.query.edit = '';
      getNlrContactDetails(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        showEmail: true,
        postAction: paths.nonLegalRep.updateContactDetails,
        emailAddress: undefined,
        phoneNumber: undefined,
        previousPage: paths.nonLegalRep.updateAddress,
        saveForLater: false
      });
    });

    it('should render contact-details.njk with contact details if present', () => {
      req.session.appeal.nlrDetails.emailAddress = 'emailAddress';
      req.session.appeal.nlrDetails.phoneNumber = 'phoneNumber';
      getNlrContactDetails(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        showEmail: true,
        postAction: paths.nonLegalRep.updateContactDetails,
        emailAddress: 'emailAddress',
        phoneNumber: 'phoneNumber',
        previousPage: paths.nonLegalRep.updateAddress,
        saveForLater: false
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getNlrAddress(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postNlrContactDetails', () => {
    it('should render with error if validation fails required', async () => {
      await postNlrContactDetails()(req as Request, res as Response, next);

      const expectedError = {
        'emailAddress': buildExpectedRequiredError('emailAddress'),
        'phoneNumber': buildExpectedRequiredError('phoneNumber')
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        showEmail: true,
        postAction: paths.nonLegalRep.updateContactDetails,
        emailAddress: undefined,
        phoneNumber: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.updateAddress
      });
    });

    it('should render with error if validation fails empty', async () => {
      req.body['emailAddress'] = '';
      req.body['phoneNumber'] = '';
      await postNlrContactDetails()(req as Request, res as Response, next);

      const expectedError = {
        'emailAddress': createStructuredError('emailAddress', i18n.validationErrors.emailEmpty),
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.phoneEmpty)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        showEmail: true,
        postAction: paths.nonLegalRep.updateContactDetails,
        emailAddress: '',
        phoneNumber: '',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.updateAddress
      });
    });

    it('should render with error if validation fails invalid format', async () => {
      req.body['emailAddress'] = 'invalid';
      req.body['phoneNumber'] = 'invalid';
      await postNlrContactDetails()(req as Request, res as Response, next);

      const expectedError = {
        'emailAddress': createStructuredError('emailAddress', i18n.validationErrors.emailFormat),
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.phoneFormat)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        showEmail: true,
        postAction: paths.nonLegalRep.updateContactDetails,
        emailAddress: 'invalid',
        phoneNumber: 'invalid',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.updateAddress
      });
    });

    it('should update req.session.appeal and redirect to CYA if validation passes', async () => {
      req.body['emailAddress'] = 'test@test.com';
      req.body['phoneNumber'] = '07827297000';
      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal(undefined);
      expect(req.session.appeal.nlrDetails.emailAddress).to.equal(undefined);
      await postNlrContactDetails()(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal('07827297000');
      expect(req.session.appeal.nlrDetails.emailAddress).to.equal('test@test.com');
      expect(redirectStub).calledWith(paths.nonLegalRep.updateDetailsCheckAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrAddress()(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getUpdateNlrDetailsCheckAndSend', () => {
    it('should render check and send page without evidence', () => {
      getUpdateNlrDetailsCheckAndSend(req as Request, res as Response, next);

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.inviteNlrToJoinAppeal.title,
        formAction: paths.nonLegalRep.updateDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.updateContactDetails,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': ' ' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/contact-details?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's email"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/contact-details?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's phone number"
              }]
            }
          }]
        }],
        noSaveForLater: true
      });
    });

    it('should render check and send page with evidence', () => {
      req.session.appeal.nlrDetails = {
        givenNames: 'someGivenNames',
        familyName: 'someFamilyName',
        phoneNumber: 'somePhoneNumber',
        emailAddress: 'someEmailAddress',
        address: {
          line1: 'someLine1',
          line2: 'someLine2',
          city: 'someCity',
          county: 'someCounty',
          postcode: 'somePostcode',
        }
      };

      getUpdateNlrDetailsCheckAndSend(req as Request, res as Response, next);

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.inviteNlrToJoinAppeal.title,
        formAction: paths.nonLegalRep.updateDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.updateContactDetails,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': 'someGivenNames someFamilyName' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': 'someLine1<br>someLine2<br>someCity<br>someCounty<br>somePostcode' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': 'someEmailAddress' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/contact-details?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's email"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': 'somePhoneNumber' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/contact-details?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's phone number"
              }]
            }
          }]
        }],
        noSaveForLater: true
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getUpdateNlrDetailsCheckAndSend(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postUpdateNlrDetailsCheckAndSend', () => {
    it('should render check and send page with error if missing fields', async () => {
      await postUpdateNlrDetailsCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'givenNames': createStructuredError('givenNames', i18n.validationErrors.nlrDetails.givenNames),
        'familyName': createStructuredError('familyName', i18n.validationErrors.nlrDetails.familyName),
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.nlrDetails.phoneNumber),
        'address': createStructuredError('address', i18n.validationErrors.nlrDetails.address),
        'addressLine1': createStructuredError('addressLine1', i18n.validationErrors.nlrDetails.addressLine1),
        'addressTownCity': createStructuredError('addressTownCity', i18n.validationErrors.nlrDetails.addressTownCity),
        'addressPostcode': createStructuredError('addressPostcode', i18n.validationErrors.nlrDetails.addressPostcode)
      };

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.updateNlrDetails.title,
        formAction: paths.nonLegalRep.updateDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.updateContactDetails,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': ' ' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/contact-details?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's email"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/contact-details?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's phone number"
              }]
            }
          }]
        }],
        errorList: Object.values(expectedError),
        noSaveForLater: true
      });
    });

    it('should render check and send page with error if missing address fields', async () => {
      req.session.appeal.nlrDetails = {
        givenNames: 'givenNames',
        familyName: 'familyName',
        phoneNumber: 'phoneNumber',
        emailAddress: 'emailAddress',
        address: {}
      };

      await postUpdateNlrDetailsCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'addressLine1': createStructuredError('addressLine1', i18n.validationErrors.nlrDetails.addressLine1),
        'addressTownCity': createStructuredError('addressTownCity', i18n.validationErrors.nlrDetails.addressTownCity),
        'addressPostcode': createStructuredError('addressPostcode', i18n.validationErrors.nlrDetails.addressPostcode)
      };

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.updateNlrDetails.title,
        formAction: paths.nonLegalRep.updateDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.updateContactDetails,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': 'givenNames familyName' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': 'emailAddress' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/contact-details?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's email"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': 'phoneNumber' },
            'actions': {
              'items': [{
                'href': '/update-nlr-details/contact-details?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's phone number"
              }]
            }
          }]
        }],
        errorList: Object.values(expectedError),
        noSaveForLater: true
      });
    });

    it('should redirect to confirmation page if validation passes', async () => {
      req.session.appeal.nlrDetails = {
        givenNames: 'someGivenNames',
        familyName: 'someFamilyName',
        phoneNumber: 'somePhoneNumber',
        emailAddress: 'someEmailAddress',
        address: {
          line1: 'someLine1',
          line2: 'someLine2',
          city: 'someCity',
          county: 'someCounty',
          postcode: 'somePostcode',
        }
      };
      const submitStub = sandbox.stub().resolves();
      updateAppealService = {
        submitEventRefactored: submitStub
      };
      await postUpdateNlrDetailsCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub).calledWith(Events.PROVIDE_NON_LEGAL_REP_DETAILS, req.session.appeal, 'idamUID', 'atoken');
      expect(redirectStub).calledWith(paths.nonLegalRep.updateDetailsConfirmation);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postUpdateNlrDetailsCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getUpdateNlrDetailsConfirmation', () => {
    it('should render confirmation-page.njk', () => {
      getUpdateNlrDetailsConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledOnceWith('templates/confirmation-page.njk', {
        title: i18n.pages.updateNlrDetails.confirmation.title,
        whatHappensNextContent: i18n.pages.updateNlrDetails.confirmation.title,
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getUpdateNlrDetailsConfirmation(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('setupNlrUpdatePhoneNumberControllers', () => {
    it('should return the correct routers', () => {
      const express = require('express');
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [isJourneyAllowedMiddleware];

      setupNlrUpdatePhoneNumberControllers(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateName, middleware, getNlrName)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updateName, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateAddress, middleware, getNlrAddress)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updateAddress, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateContactDetails, middleware, getNlrContactDetails)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updateContactDetails, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateDetailsCheckAndSend, middleware, getUpdateNlrDetailsCheckAndSend)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updateDetailsCheckAndSend, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateDetailsConfirmation, middleware, getUpdateNlrDetailsConfirmation)).to.equal(true);
    });
  });
});
