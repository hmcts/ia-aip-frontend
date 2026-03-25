import { Request, Response } from 'express';
import {
  ErrorCode,
  getAddNonLegalRepresentative,
  getCheckAndSend,
  getInviteToCreateAccount,
  getInviteToCreateAccountConfirmation,
  getInviteToJoinAppealConfirmation,
  getNlrAddress,
  getNlrName,
  getNlrPhoneNumber,
  getProvideNlrDetailsConfirmation,
  postCheckAndSend,
  postInviteToCreateAccount,
  postInviteToJoinAppeal,
  postNlrAddress,
  postNlrName,
  postNlrPhoneNumber,
  getSamePerson, 
  postSamePerson,
  setupNonLegalRepresentativeControllers
} from '../../../../app/controllers/non-legal-representative/add-non-legal-representative';
import { Events } from '../../../../app/data/events';
import { isJourneyAllowedMiddleware } from '../../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { createStructuredError } from '../../../../app/utils/validations/fields-validations';
import i18n from '../../../../locale/en.json';
import { buildExpectedRequiredError, expect, sinon } from '../../../utils/testUtils';

describe('Add non-legal representative controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let submitEventRefactoredStub: sinon.SinonStub;
  let validateMidEventStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  const error = new Error('some error');
  let throwStub: sinon.SinonStub;
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
          nlrDetails: {},
          application: {},
          documentMap: []
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
    throwStub = sandbox.stub().throws(error);
    submitEventRefactoredStub = sandbox.stub();
    validateMidEventStub = sandbox.stub();
    updateAppealService = {
      submitEventRefactored: submitEventRefactoredStub,
      mapToCCDCaseNlrDetails: sandbox.stub(),
      validateMidEvent: validateMidEventStub
    };

    redirectStub = sandbox.stub();
    renderStub = sandbox.stub();
    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub,
      locals: {}
    } as Partial<Response>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getAddNonLegalRepresentative', () => {
    it('should render add-non-legal-representative with no error code', () => {
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/add-non-legal-representative.njk', {
        previousPage: paths.common.overview
      });
    });

    it('should render add-non-legal-representative with error for stepTwoNoEmailProvided', () => {
      req.query.errorCode = ErrorCode.stepTwoNoEmailProvided;
      const expectedError = {
        'provideNlrDetails': {
          key: 'provideNlrDetails',
          text: i18n.pages.addNonLegalRepresentative.noEmailProvidedError,
          href: '#provideNlrDetails'
        }
      };
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/add-non-legal-representative.njk', {
        previousPage: paths.common.overview,
        shouldProvideEmailDirectionStepTwoShow: true,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should render add-non-legal-representative with error for stepThreeNoEmailProvided', () => {
      req.query.errorCode = ErrorCode.stepThreeNoEmailProvided;
      const expectedError = {
        'inviteJoinAppeal': {
          key: 'inviteJoinAppeal',
          text: i18n.pages.addNonLegalRepresentative.noEmailProvidedError,
          href: '#inviteJoinAppeal'
        }
      };
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/add-non-legal-representative.njk', {
        previousPage: paths.common.overview,
        shouldProvideEmailDirectionStepThreeShow: true,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should render add-non-legal-representative with error for stepThreeNoDetailsProvided', () => {
      req.query.errorCode = ErrorCode.stepThreeNoDetailsProvided;
      const expectedError = {
        'inviteJoinAppeal': {
          key: 'inviteJoinAppeal',
          text: i18n.pages.addNonLegalRepresentative.noDetailsProvidedError,
          href: '#inviteJoinAppeal'
        }
      };
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/add-non-legal-representative.njk', {
        previousPage: paths.common.overview,
        shouldNoDetailsProvidedStepThreeShow: true,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should render add-non-legal-representative with error for stepThreeUserNotExisting', () => {
      req.query.errorCode = ErrorCode.stepThreeUserNotExisting;
      const expectedError = {
        'inviteJoinAppeal': {
          key: 'inviteJoinAppeal',
          text: i18n.pages.addNonLegalRepresentative.userNotExistsError,
          href: '#inviteJoinAppeal'
        }
      };
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/add-non-legal-representative.njk', {
        previousPage: paths.common.overview,
        shouldUserNotExistStepThreeShow: true,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should render add-non-legal-representative with error for stepTwoNoEmailProvided', () => {
      req.query.errorCode = 'someRandomErrorCode';
      const expectedError = {
        'provideNlrDetails': {
          key: 'provideNlrDetails',
          text: i18n.pages.addNonLegalRepresentative.unknownError,
          href: '#provideNlrDetails'
        }
      };
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/add-non-legal-representative.njk', {
        previousPage: paths.common.overview,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAddNonLegalRepresentative(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToCreateAccount', () => {
    it('should render provide-email-create-account', () => {
      getInviteToCreateAccount(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-create-account.njk', {
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getInviteToCreateAccount(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postInviteToCreateAccount', () => {
    it('should render provide-email-create-account with correct errors if email is empty', async () => {
      req.body = {
        'email-value': ''
      };
      const expectedValidationError = {
        'email-value': {
          key: 'email-value',
          href: '#email-value',
          text: i18n.validationErrors.emailEmpty
        }
      };
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-create-account.njk', {
        nlrEmail: '',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render provide-email-create-account with correct errors if email validation fails', async () => {
      req.body = {
        'email-value': 'something that is not an email'
      };
      const expectedValidationError = {
        'email-value': {
          key: 'email-value',
          href: '#email-value',
          text: i18n.validationErrors.emailFormat
        }
      };
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/provide-email-create-account.njk', {
        nlrEmail: 'something that is not an email',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should redirect to inviteToCreateAccountConfirmation if validation and event succeeds', async () => {
      req.body = {
        'email-value': 'test@test.com'
      };
      const expectedAppeal = {
        ...req.session.appeal,
        nlrDetails: { emailAddress: 'test@test.com' },
        application: { ...req.session.appeal.application, hasNonLegalRep: 'Yes' }
      };
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitEventRefactoredStub).to.be.calledOnceWith(Events.SEND_INVITE_TO_NON_LEGAL_REP, expectedAppeal, 'idamUID', 'atoken');
      expect(res.redirect).to.be.calledOnceWith(paths.nonLegalRep.inviteToCreateAccountConfirmation);
    });

    it('should catch a validation error and redirect with error', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });

    it('should catch event submission error and redirect with error', async () => {
      req.body = {
        'email-value': 'test@test.com'
      };
      const error = new Error('the error');
      submitEventRefactoredStub.throws(error);
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToCreateAccountConfirmation', () => {
    it('should render confirmation-page', () => {
      getInviteToCreateAccountConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToCreateAccount.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToCreateAccount.confirmation.whatNextListItems,
        nlrEmail: undefined,
        backToAddNlr: true
      });
    });

    it('should render confirmation-page with nlrEmail', () => {
      req.session.appeal.nlrDetails.emailAddress = 'someEmail';
      getInviteToCreateAccountConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToCreateAccount.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToCreateAccount.confirmation.whatNextListItems,
        nlrEmail: 'someEmail',
        backToAddNlr: true
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getInviteToCreateAccountConfirmation(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getNlrName', () => {
    it('should redirect to add nlr with errorCode if no email', () => {
      getNlrName(req as Request, res as Response, next);
      expect(res.redirect).to.be.calledWithMatch(ErrorCode.stepTwoNoEmailProvided);
    });

    it('should render name.njk', () => {
      req.query.edit = '';
      req.session.appeal.nlrDetails.emailAddress = 'someEmail';
      getNlrName(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.nonLegalRep.provideNlrName,
        nlrGivenNames: undefined,
        nlrFamilyName: undefined,
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render name.njk with names if present', () => {
      req.session.appeal.nlrDetails.givenNames = 'someGivenName';
      req.session.appeal.nlrDetails.familyName = 'someFamilyName';
      req.session.appeal.nlrDetails.emailAddress = 'someEmail';
      getNlrName(req as Request, res as Response, next);

      expect(renderStub.calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.nonLegalRep.provideNlrName,
        nlrGivenNames: 'someGivenName',
        nlrFamilyName: 'someFamilyName',
        previousPage: paths.nonLegalRep.addNonLegalRep
      })).to.equal(true);
    });

    it('should catch an error and call next with error', async () => {
      res.redirect = throwStub;
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
        postAction: paths.nonLegalRep.provideNlrName,
        nlrGivenNames: undefined,
        nlrFamilyName: undefined,
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
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
        postAction: paths.nonLegalRep.provideNlrName,
        nlrGivenNames: 'someGivenName',
        nlrFamilyName: '',
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
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
        postAction: paths.nonLegalRep.provideNlrName,
        nlrGivenNames: '',
        nlrFamilyName: '',
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
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
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrAddress);
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
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend);
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
        postAction: paths.nonLegalRep.provideNlrAddress,
        address: undefined,
        previousPage: paths.nonLegalRep.provideNlrName
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
        postAction: paths.nonLegalRep.provideNlrAddress,
        address: expectedAddress,
        previousPage: paths.nonLegalRep.provideNlrName
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
        postAction: paths.nonLegalRep.provideNlrAddress,
        nlrAddress: {
          line1: undefined,
          line2: undefined,
          city: undefined,
          county: undefined,
          postcode: undefined
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.provideNlrName
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
        postAction: paths.nonLegalRep.provideNlrAddress,
        nlrAddress: {
          line1: '',
          line2: undefined,
          city: '',
          county: undefined,
          postcode: ''
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.provideNlrName
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
        postAction: paths.nonLegalRep.provideNlrAddress,
        nlrAddress: {
          line1: 'line1',
          line2: undefined,
          city: 'town',
          county: undefined,
          postcode: 'someBadPostcode'
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.provideNlrName
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
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrPhoneNumber);
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
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrAddress()(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getNlrPhoneNumber', () => {
    it('should render contact-details.njk', () => {
      req.query.edit = '';
      getNlrPhoneNumber(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        postAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: undefined,
        previousPage: paths.nonLegalRep.provideNlrAddress
      });
    });

    it('should render contact-details.njk with contact details if present', () => {
      req.session.appeal.nlrDetails.emailAddress = 'emailAddress';
      req.session.appeal.nlrDetails.phoneNumber = 'phoneNumber';
      getNlrPhoneNumber(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        postAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: 'phoneNumber',
        previousPage: paths.nonLegalRep.provideNlrAddress
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getNlrAddress(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postNlrPhoneNumber', () => {
    it('should render with error if validation fails required', async () => {
      await postNlrPhoneNumber()(req as Request, res as Response, next);

      const expectedError = {
        'phoneNumber': buildExpectedRequiredError('phoneNumber')
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        postAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.provideNlrAddress
      });
    });

    it('should render with error if validation fails empty', async () => {
      req.body['phoneNumber'] = '';
      await postNlrPhoneNumber()(req as Request, res as Response, next);

      const expectedError = {
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.phoneEmpty)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        postAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: '',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.provideNlrAddress
      });
    });

    it('should render with error if validation fails invalid format', async () => {
      req.body['phoneNumber'] = 'invalid';
      await postNlrPhoneNumber()(req as Request, res as Response, next);

      const expectedError = {
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.ukPhoneFormat)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        postAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: 'invalid',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.provideNlrAddress
      });
    });

    it('should update req.session.appeal and redirect to CYA if validation passes', async () => {
      req.body['phoneNumber'] = '07827297000';
      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal(undefined);
      await postNlrPhoneNumber()(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal('07827297000');
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend);
    });


    it('should update req.session.appeal and redirect to isSamePerson if validation passes and hasSponsor', async () => {
      req.body['phoneNumber'] = '07827297000';
      req.session.appeal.application.hasSponsor = 'Yes';
      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal(undefined);
      await postNlrPhoneNumber()(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal('07827297000');
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrIsSamePerson);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrAddress()(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getSamePerson', () => {
    it('should render is-same-person.njk', () => {
      req.query.edit = '';
      getSamePerson(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
        isSponsorSameAsNlr: undefined
      });
    });

    it('should render is-same-person.njk with field', () => {
      req.session.appeal.application.isSponsorSameAsNlr = 'something';

      getSamePerson(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
        isSponsorSameAsNlr: 'something'
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getSamePerson(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postSamePerson', () => {
    it('should render with error if validation fails required', async () => {
      await postSamePerson()(req as Request, res as Response, next);

      const expectedError = {
        'isSponsorSameAsNlr': createStructuredError('isSponsorSameAsNlr', i18n.validationErrors.isSponsorSameAsNlr)
      };
      expect(renderStub).calledWith('appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
        isSponsorSameAsNlr: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should update req.session.appeal and redirect to provideNlrDetailsCheckAndSend', async () => {
      req.body.isSponsorSameAsNlr = 'No';
      expect(req.session.appeal.application.isSponsorSameAsNlr).to.equal(undefined);

      await postSamePerson()(req as Request, res as Response, next);
      expect(req.session.appeal.application.isSponsorSameAsNlr).to.equal('No');
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postSamePerson()(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
  
  describe('getCheckAndSend', () => {
    it('should render check and send page without evidence', () => {
      getCheckAndSend(req as Request, res as Response, next);

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.inviteNlrToJoinAppeal.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': ' ' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-phone-number?edit',
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

      getCheckAndSend(req as Request, res as Response, next);

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.inviteNlrToJoinAppeal.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': 'someGivenNames someFamilyName' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': 'someLine1<br>someLine2<br>someCity<br>someCounty<br>somePostcode' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': 'somePhoneNumber' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-phone-number?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's phone number"
              }]
            }
          }]
        }],
        noSaveForLater: true
      });
    });

    it('should render check and send page with isSponsorSameAsNlr if hasSponsor', () => {
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
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';

      getCheckAndSend(req as Request, res as Response, next);

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.inviteNlrToJoinAppeal.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.provideNlrIsSamePerson,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': 'someGivenNames someFamilyName' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': 'someLine1<br>someLine2<br>someCity<br>someCounty<br>somePostcode' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': 'somePhoneNumber' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-phone-number?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's phone number"
              }]
            }
          }, {
            'key': { 'text': 'Is your sponsor the same as your non-legal representative?' },
            'value': { 'html': 'Yes' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/is-same-person-as-sponsor?edit',
                'text': 'Change',
                'visuallyHiddenText': 'Is your sponsor the same as your non-legal representative?'
              }]
            }
          }]
        }],
        noSaveForLater: true
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getCheckAndSend(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postCheckAndSend', () => {
    it('should render check and send page with error if missing fields', async () => {
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
        pageTitle: i18n.pages.provideNlrDetails.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': ' ' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-phone-number?edit',
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

      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'addressLine1': createStructuredError('addressLine1', i18n.validationErrors.nlrDetails.addressLine1),
        'addressTownCity': createStructuredError('addressTownCity', i18n.validationErrors.nlrDetails.addressTownCity),
        'addressPostcode': createStructuredError('addressPostcode', i18n.validationErrors.nlrDetails.addressPostcode)
      };

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.provideNlrDetails.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's name" },
            'value': { 'html': 'givenNames familyName' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-name?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's name"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's address" },
            'value': { 'html': '' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-address?edit',
                'text': 'Change',
                'visuallyHiddenText': "Non-legal representative's address"
              }]
            }
          }, {
            'key': { 'text': "Non-legal representative's phone number" },
            'value': { 'html': 'phoneNumber' },
            'actions': {
              'items': [{
                'href': '/add-non-legal-rep/provide-phone-number?edit',
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
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub).calledWith(Events.PROVIDE_NON_LEGAL_REP_DETAILS, req.session.appeal, 'idamUID', 'atoken');
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrDetailsConfirmation);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getProvideNlrDetailsConfirmation', () => {
    it('should render confirmation-page.njk', () => {
      getProvideNlrDetailsConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledOnceWith('templates/confirmation-page.njk', {
        title: i18n.pages.provideNlrDetails.confirmation.title,
        whatNextContent: i18n.pages.provideNlrDetails.confirmation.whatNextContent,
        backToAddNlr: true
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getProvideNlrDetailsConfirmation(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postInviteToJoinAppeal', () => {
    it('should redirect to add nlr with error if no email', async () => {
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub).calledWithMatch(ErrorCode.stepThreeNoEmailProvided);
    });

    it('should redirect to add nlr with error if any missing nlr details', async () => {
      req.session.appeal.nlrDetails.emailAddress = 'someEmailAddress';
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub).calledWithMatch(ErrorCode.stepThreeNoDetailsProvided);
    });

    it('should redirect to add nlr with error if mid event validation fails', async () => {
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
      updateAppealService.validateMidEvent = validateMidEventStub.returns(['some issue']);
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(validateMidEventStub).calledWith(Events.SEND_PIP_TO_NON_LEGAL_REP, ['sendPipToNonLegalRepsendPipToNonLegalRep'], req.session.appeal, sinon.match.any, 'idamUID', 'atoken');
      expect(redirectStub).calledWithMatch(ErrorCode.stepThreeUserNotExisting);
    });

    it('should redirect to inviteToJoinAppealConfirmation if mid event validation passes', async () => {
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
      updateAppealService.validateMidEvent = validateMidEventStub.returns([]);
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(validateMidEventStub).calledWith(Events.SEND_PIP_TO_NON_LEGAL_REP, ['sendPipToNonLegalRepsendPipToNonLegalRep'], req.session.appeal, sinon.match.any, 'idamUID', 'atoken');
      expect(submitEventRefactoredStub).calledWith(Events.SEND_PIP_TO_NON_LEGAL_REP, req.session.appeal, 'idamUID', 'atoken');
      expect(redirectStub).calledWith(paths.nonLegalRep.inviteToJoinAppealConfirmation);
    });

    it('should catch an error and call next with error', async () => {
      res.redirect = throwStub;
      await postInviteToJoinAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToJoinAppealConfirmation', () => {
    it('should render confirmation-page', () => {
      getInviteToJoinAppealConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToJoinAppeal.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToJoinAppeal.confirmation.whatNextListItems,
        nlrEmail: undefined
      });
    });

    it('should render confirmation-page with nlrEmail', () => {
      req.session = {
        appeal: {
          nlrDetails: { emailAddress: 'someEmail' }
        } as Appeal
      } as any;
      getInviteToJoinAppealConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToJoinAppeal.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToJoinAppeal.confirmation.whatNextListItems,
        nlrEmail: 'someEmail'
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getInviteToJoinAppealConfirmation(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('setupNonLegalRepresentativeControllers', () => {
    it('should return the correct routers', () => {
      const express = require('express');
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [isJourneyAllowedMiddleware];

      setupNonLegalRepresentativeControllers(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.nonLegalRep.addNonLegalRep, middleware, getAddNonLegalRepresentative)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToCreateAccount, middleware, getInviteToCreateAccount)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.inviteToCreateAccount, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToCreateAccountConfirmation, middleware, getInviteToCreateAccountConfirmation)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrName, middleware, getNlrName)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrName, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrAddress, middleware, getNlrAddress)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrAddress, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrPhoneNumber, middleware, getNlrPhoneNumber)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrPhoneNumber, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend, middleware, getCheckAndSend)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrDetailsConfirmation, middleware, getProvideNlrDetailsConfirmation)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.inviteToJoinAppeal, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToJoinAppealConfirmation, middleware, getInviteToJoinAppealConfirmation)).to.equal(true);
    });
  });
});
