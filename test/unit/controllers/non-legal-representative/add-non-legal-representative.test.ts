import { Request, Response } from 'express';
import {
  getAddAnotherNonLegalRepresentative,
  getCheckAndSend,
  getInviteToCreateAccount,
  getInviteToCreateAccountConfirmation,
  getInviteToJoinAppealConfirmation,
  getNlrAddress,
  getNlrName,
  getNlrPhoneNumber,
  getSamePerson,
  getTaskList,
  postAddAnotherNonLegalRepresentative,
  postCheckAndSend,
  postInviteToCreateAccount,
  postNlrAddress,
  postNlrName,
  postNlrPhoneNumber,
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
  let mapStub: sinon.SinonStub;
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
    mapStub = sandbox.stub();
    validateMidEventStub = sandbox.stub();
    updateAppealService = {
      submitEventRefactored: submitEventRefactoredStub,
      mapToCCDCaseNlrDetails: mapStub,
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

  describe('getTaskList', () => {
    it('should render add-non-legal-representative task list correctly empty', () => {
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', true, false)]),
        createSection('stepTwo', [
          createTask('provideNlrName', false, false),
          createTask('provideNlrAddress', false, false),
          createTask('provideNlrPhone', false, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with email', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail'
      };
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('provideNlrName', true, false),
          createTask('provideNlrAddress', true, false),
          createTask('provideNlrPhone', true, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with names', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        givenNames: 'someEmail',
        familyName: 'familyName'
      };
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('provideNlrName', false, true),
          createTask('provideNlrAddress', true, false),
          createTask('provideNlrPhone', true, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with address', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        address: 'something'
      };
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('provideNlrName', true, false),
          createTask('provideNlrAddress', false, true),
          createTask('provideNlrPhone', true, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with addressUK no sponsor', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        addressUk: { line1: 'line1', city: 'city', postcode: 'postcode' },
      };
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('provideNlrName', true, false),
          createTask('provideNlrAddress', true, false),
          createTask('provideNlrPhone', true, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with phone', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        phoneNumber: 'something'
      };
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('provideNlrName', true, false),
          createTask('provideNlrAddress', true, false),
          createTask('provideNlrPhone', false, true),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with all details', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        givenNames: 'someGivenName',
        familyName: 'someFamilyName',
        address: 'someAddress',
        phoneNumber: 'something'
      };
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('provideNlrName', false, true),
          createTask('provideNlrAddress', false, true),
          createTask('provideNlrPhone', false, true),
        ]),
        createSection('stepThree', [createTask('checkAndSend', true, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });
    it('should render add-non-legal-representative task list correctly with idam id', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        givenNames: 'someGivenName',
        familyName: 'someFamilyName',
        address: 'someAddress',
        phoneNumber: 'something',
        idamId: 'someId',
      };
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('provideNlrName', false, true),
          createTask('provideNlrAddress', false, true),
          createTask('provideNlrPhone', false, true),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, true)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly empty with sponsor', () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', true, false)]),
        createSection('stepTwo', [
          createTask('isNlrSameAsSponsor', false, false),
          createTask('provideNlrName', false, false),
          createTask('provideNlrAddress', false, false),
          createTask('provideNlrPhone', false, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with email with sponsor', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
      };
      req.session.appeal.application.hasSponsor = 'Yes';
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('isNlrSameAsSponsor', true, false),
          createTask('provideNlrName', true, false),
          createTask('provideNlrAddress', true, false),
          createTask('provideNlrPhone', true, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with same as sponsor', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
      };
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('isNlrSameAsSponsor', false, true),
          createTask('provideNlrName', true, false),
          createTask('provideNlrAddress', true, false),
          createTask('provideNlrPhone', true, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with addressUk with sponsor same', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        addressUk: { line1: 'line1', city: 'city', postcode: 'postcode' }
      };
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.session.appeal.application.hasSponsor = 'Yes';
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('isNlrSameAsSponsor', false, true),
          createTask('provideNlrName', true, false),
          createTask('provideNlrAddress', false, true),
          createTask('provideNlrPhone', true, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with address with sponsor same', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        address: 'something'
      };
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.session.appeal.application.hasSponsor = 'Yes';
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('isNlrSameAsSponsor', false, true),
          createTask('provideNlrName', true, false),
          createTask('provideNlrAddress', true, false),
          createTask('provideNlrPhone', true, false),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should render add-non-legal-representative task list correctly with all details except same as sponsor', () => {
      req.session.appeal.nlrDetails = {
        emailAddress: 'someEmail',
        givenNames: 'someGivenName',
        familyName: 'someFamilyName',
        addressUk: { line1: 'line1', city: 'city', postcode: 'postcode' },
        address: 'something',
        phoneNumber: 'something'
      };
      req.session.appeal.application.hasSponsor = 'Yes';
      getTaskList(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedData = [
        createSection('stepOne', [createTask('provideNlrEmail', false, true)]),
        createSection('stepTwo', [
          createTask('isNlrSameAsSponsor', true, false),
          createTask('provideNlrName', false, true),
          createTask('provideNlrAddress', false, true),
          createTask('provideNlrPhone', false, true),
        ]),
        createSection('stepThree', [createTask('checkAndSend', false, false)]),
      ];
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/task-list.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        previousPage: paths.common.overview,
        sections: i18n.pages.addNonLegalRepresentative.sections,
        tasks: i18n.pages.addNonLegalRepresentative.tasks,
        data: expectedData
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getTaskList(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getAddAnotherNonLegalRepresentative', () => {
    it('should render add-another-non-legal-representative', () => {
      getAddAnotherNonLegalRepresentative(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      expect(renderStub).calledWith('non-legal-rep/add-another-non-legal-representative.njk');
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAddAnotherNonLegalRepresentative(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postAddAnotherNonLegalRepresentative', () => {
    it('should render add-another-non-legal-representative if validation fails', async () => {
      await postAddAnotherNonLegalRepresentative(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      const expectedError = {
        key: 'statement',
        text: i18n.validationErrors.addAnotherNlrAgreement,
        href: '#statement'
      };
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/add-another-non-legal-representative.njk', {
        errors: { statement: expectedError },
        errorList: [expectedError]
      });
    });

    it('should redirect and wipe nlrDetails from session if validation passes', async () => {
      req.body['statement'] = 'valid';
      req.session.appeal.nlrDetails = {};
      await postAddAnotherNonLegalRepresentative(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(false);
      expect(redirectStub).calledWith(paths.nonLegalRep.addNonLegalRep);
      expect(req.session.appeal.nlrDetails).to.be.undefined;
      expect(submitEventRefactoredStub).calledWith(Events.REMOVE_NON_LEGAL_REP,
        req.session.appeal, 'idamUID', 'atoken');
    });

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postAddAnotherNonLegalRepresentative(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToCreateAccount', () => {
    it('should render provide-email-create-account', () => {
      getInviteToCreateAccount(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/provide-email-create-account.njk', {
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
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/provide-email-create-account.njk', {
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
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/provide-email-create-account.njk', {
        nlrEmail: 'something that is not an email',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render with error if validation fails nlr email is same as appellants', async () => {
      req.body['email-value'] = 'some@test.com';
      req.session.appeal.application.contactDetails = {
        email: 'some@test.com'
      };
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'email-value': createStructuredError('email-value', i18n.validationErrors.nlrDetails.nlrEmailCannotBeSameAsAppellant)
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/provide-email-create-account.njk', {
        nlrEmail: 'some@test.com',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render with error if validation fails nlr contact details are same as current logged in', async () => {
      req.idam.userDetails.sub = 'some@test.com';
      req.body['email-value'] = 'some@test.com';
      await postInviteToCreateAccount(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'email-value': createStructuredError('email-value', i18n.validationErrors.nlrDetails.nlrEmailCannotBeSameAsAppellant)
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'non-legal-rep/provide-email-create-account.njk', {
        nlrEmail: 'some@test.com',
        errors: expectedError,
        errorList: Object.values(expectedError),
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
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/confirmation-page.njk', {
        title: i18n.pages.inviteNlrToCreateAccount.confirmation.title,
        whatNextListItems: i18n.pages.inviteNlrToCreateAccount.confirmation.whatNextListItems,
        nlrEmail: undefined,
        backToAddNlr: true
      });
    });

    it('should render confirmation-page with nlrEmail', () => {
      req.session.appeal.nlrDetails.emailAddress = 'someEmail';
      getInviteToCreateAccountConfirmation(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/confirmation-page.njk', {
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
    it('should render name.njk', () => {
      req.query.edit = '';
      req.session.appeal.nlrDetails.emailAddress = 'someEmail';
      getNlrName(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/name.njk', {
        formAction: paths.nonLegalRep.provideNlrName,
        nlrGivenNames: '',
        nlrFamilyName: '',
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render name.njk with names if present', () => {
      req.session.appeal.nlrDetails.givenNames = 'someGivenName';
      req.session.appeal.nlrDetails.familyName = 'someFamilyName';
      req.session.appeal.nlrDetails.emailAddress = 'someEmail';
      getNlrName(req as Request, res as Response, next);

      expect(renderStub.calledWith('appeal-application/non-legal-rep-details/name.njk', {
        formAction: paths.nonLegalRep.provideNlrName,
        nlrGivenNames: 'someGivenName',
        nlrFamilyName: 'someFamilyName',
        previousPage: paths.nonLegalRep.addNonLegalRep
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
      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'nlrGivenNames': buildExpectedRequiredError('nlrGivenNames'),
        'nlrFamilyName': buildExpectedRequiredError('nlrFamilyName')
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/name.njk', {
        formAction: paths.nonLegalRep.provideNlrName,
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
      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'nlrFamilyName': createStructuredError('nlrFamilyName', i18n.validationErrors.nlrDetails.familyName)
      };

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/name.njk', {
        formAction: paths.nonLegalRep.provideNlrName,
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
      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'nlrGivenNames': createStructuredError('nlrGivenNames', i18n.validationErrors.nlrDetails.givenNames),
        'nlrFamilyName': createStructuredError('nlrFamilyName', i18n.validationErrors.nlrDetails.familyName)
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/name.njk', {
        formAction: paths.nonLegalRep.provideNlrName,
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
      expect(req.session.appeal.nlrDetails.givenNames).to.be.undefined;
      expect(req.session.appeal.nlrDetails.givenNames || 'none').to.equal('none');
      expect(req.session.appeal.nlrDetails.familyName).to.be.undefined;
      expect(req.session.appeal.nlrDetails.familyName || 'none').to.equal('none');

      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.nlrDetails.givenNames).to.equal('someGivenName');
      expect(req.session.appeal.nlrDetails.familyName).to.equal('someFamilyName');
      expect(redirectStub).calledWith(paths.nonLegalRep.addNonLegalRep);
    });

    it('should redirect to CYA if validation passes and isEdit true', async () => {
      req.body.nlrGivenNames = 'someGivenName';
      req.body.nlrFamilyName = 'someFamilyName';
      req.session.appeal.application.isEdit = true;
      expect(req.session.appeal.nlrDetails.givenNames).to.be.undefined;
      expect(req.session.appeal.nlrDetails.givenNames || 'none').to.equal('none');
      expect(req.session.appeal.nlrDetails.familyName).to.be.undefined;
      expect(req.session.appeal.nlrDetails.familyName || 'none').to.equal('none');

      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.nlrDetails.givenNames).to.equal('someGivenName');
      expect(req.session.appeal.nlrDetails.familyName).to.equal('someFamilyName');
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getNlrAddress', () => {
    it('should render address.njk if isSponsorSame', () => {
      req.query.edit = '';
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      getNlrAddress(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/address.njk', {
        previousPage: paths.nonLegalRep.addNonLegalRep,
        formAction: paths.nonLegalRep.provideNlrAddress,
        pageTitle: i18n.pages.nlrAddress.title,
        address: undefined
      });
    });

    it('should render address.njk with address if present and isSponsorSameAsNlr', () => {
      const expectedAddress: Address = {
        line1: 'line1',
        city: 'city',
        postcode: 'postcode'
      };
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.session.appeal.nlrDetails.addressUk = expectedAddress;
      getNlrAddress(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/address.njk', {
        previousPage: paths.nonLegalRep.addNonLegalRep,
        formAction: paths.nonLegalRep.provideNlrAddress,
        pageTitle: i18n.pages.nlrAddress.title,
        address: expectedAddress
      });
    });

    it('should render textarea-question-page.njk if no isSponsorSame', () => {
      req.query.edit = '';
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'No';
      getNlrAddress(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/textarea-question-page.njk', {
        previousPage: paths.nonLegalRep.addNonLegalRep,
        formAction: paths.nonLegalRep.provideNlrAddress,
        pageTitle: i18n.pages.nlrAddress.title,
        question: {
          name: 'nlr-address',
          title: i18n.pages.nlrAddress.title,
          description: i18n.pages.nlrAddress.description,
          value: ''
        }
      });
    });

    it('should render textarea-question-page.njk with address if present and no isSponsorSameAsNlr', () => {
      const expectedAddress: string = 'some adders';
      req.session.appeal.nlrDetails.address = expectedAddress;
      getNlrAddress(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/textarea-question-page.njk', {
        previousPage: paths.nonLegalRep.addNonLegalRep,
        formAction: paths.nonLegalRep.provideNlrAddress,
        pageTitle: i18n.pages.nlrAddress.title,
        question: {
          name: 'nlr-address',
          title: i18n.pages.nlrAddress.title,
          description: i18n.pages.nlrAddress.description,
          value: expectedAddress
        }
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
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'address-line-1': buildExpectedRequiredError('address-line-1'),
        'address-town': buildExpectedRequiredError('address-town'),
        'address-postcode': buildExpectedRequiredError('address-postcode')
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/address.njk', {
        formAction: paths.nonLegalRep.provideNlrAddress,
        address: {
          line1: undefined,
          line2: undefined,
          city: undefined,
          county: undefined,
          postcode: undefined
        },
        error: expectedError,
        pageTitle: i18n.pages.nlrAddress.title,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render with error if validation fails empty', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.body['address-line-1'] = '';
      req.body['address-town'] = '';
      req.body['address-postcode'] = '';
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'address-line-1': createStructuredError('address-line-1', i18n.validationErrors.nlrDetails.addressLine1),
        'address-town': createStructuredError('address-town', i18n.validationErrors.nlrDetails.addressTownCity),
        'address-postcode': createStructuredError('address-postcode', i18n.validationErrors.nlrDetails.addressPostcode)
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/address.njk', {
        formAction: paths.nonLegalRep.provideNlrAddress,
        address: {
          line1: '',
          line2: undefined,
          city: '',
          county: undefined,
          postcode: ''
        },
        pageTitle: i18n.pages.nlrAddress.title,
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render with error if postcode validation fails invalid', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.body['address-line-1'] = 'line1';
      req.body['address-town'] = 'town';
      req.body['address-postcode'] = 'someBadPostcode';
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'address-postcode': {
          key: 'address-postcode',
          text: i18n.validationErrors.postcode.invalid,
          href: '#address-postcode'
        }
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/address.njk', {
        formAction: paths.nonLegalRep.provideNlrAddress,
        address: {
          line1: 'line1',
          line2: undefined,
          city: 'town',
          county: undefined,
          postcode: 'someBadPostcode'
        },
        error: expectedError,
        pageTitle: i18n.pages.nlrAddress.title,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should update req.session.appeal and redirect to contact details if validation passes and isEdit true', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.body['address-line-1'] = 'line1';
      req.body['address-town'] = 'town';
      req.body['address-postcode'] = 'SW1A 2AA';
      expect(req.session.appeal.nlrDetails.addressUk).to.be.undefined;
      expect(req.session.appeal.nlrDetails.addressUk || 'none').to.equal('none');
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.addressUk).to.deep.equal({
        line1: 'line1',
        line2: undefined,
        city: 'town',
        county: undefined,
        postcode: 'SW1A 2AA'
      });
      expect(redirectStub).calledWith(paths.nonLegalRep.addNonLegalRep);
    });

    it('should update req.session.appeal and redirect to CYA if validation passes and isEdit true', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.body['address-line-1'] = 'line1';
      req.body['address-line-2'] = 'line2';
      req.body['address-town'] = 'town';
      req.body['address-county'] = 'county';
      req.body['address-postcode'] = 'SW1A 2AA';
      req.session.appeal.application.isEdit = true;
      expect(req.session.appeal.nlrDetails.addressUk).to.be.undefined;
      expect(req.session.appeal.nlrDetails.addressUk || 'none').to.equal('none');
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.addressUk).to.deep.equal({
        line1: 'line1',
        line2: 'line2',
        city: 'town',
        county: 'county',
        postcode: 'SW1A 2AA'
      });
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend);
    });

    it('should render with error if validation fails required if no sponsor', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'No';
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'nlr-address': {
          href: '#nlr-address',
          key: 'nlr-address',
          text: i18n.validationErrors.nlrDetails.address
        }
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/textarea-question-page.njk', {
        formAction: paths.nonLegalRep.provideNlrAddress,
        question: {
          name: 'nlr-address',
          title: i18n.pages.nlrAddress.title,
          description: i18n.pages.nlrAddress.description,
          value: ''
        },
        error: expectedError,
        pageTitle: i18n.pages.nlrAddress.title,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render with error if validation fails empty', async () => {
      req.session.appeal.application.hasSponsor = 'No';
      req.body['nlr-address'] = '';
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'nlr-address': {
          href: '#nlr-address',
          key: 'nlr-address',
          text: i18n.validationErrors.nlrDetails.address
        }
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/textarea-question-page.njk', {
        formAction: paths.nonLegalRep.provideNlrAddress,
        question: {
          name: 'nlr-address',
          title: i18n.pages.nlrAddress.title,
          description: i18n.pages.nlrAddress.description,
          value: ''
        },
        error: expectedError,
        pageTitle: i18n.pages.nlrAddress.title,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should update req.session.appeal and redirect to contact details if validation passes and isEdit true', async () => {
      req.body['nlr-address'] = 'some address';
      expect(req.session.appeal.nlrDetails.address).to.be.undefined;
      expect(req.session.appeal.nlrDetails.address || 'none').to.equal('none');
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.address).to.equal('some address');
      expect(redirectStub).calledWith(paths.nonLegalRep.addNonLegalRep);
    });

    it('should update req.session.appeal and redirect to CYA if validation passes and isEdit true', async () => {
      req.session.appeal.application.isEdit = true;
      req.body['nlr-address'] = 'some address';
      expect(req.session.appeal.nlrDetails.address).to.be.undefined;
      expect(req.session.appeal.nlrDetails.address || 'none').to.equal('none');
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.address).to.equal('some address');
      expect(redirectStub).calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getNlrPhoneNumber', () => {
    it('should render contact-details.njk', () => {
      req.query.edit = '';
      getNlrPhoneNumber(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        formAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: undefined,
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render contact-details.njk with contact details if present', () => {
      req.session.appeal.nlrDetails.emailAddress = 'emailAddress';
      req.session.appeal.nlrDetails.phoneNumber = 'phoneNumber';
      getNlrPhoneNumber(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        formAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: 'phoneNumber',
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getNlrPhoneNumber(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postNlrPhoneNumber', () => {
    it('should render with error if validation fails required', async () => {
      await postNlrPhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'phoneNumber': buildExpectedRequiredError('phoneNumber')
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        formAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render with error if validation fails empty', async () => {
      req.body['phoneNumber'] = '';
      await postNlrPhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.phoneEmpty)
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        formAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: '',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render with error if validation fails invalid format', async () => {
      req.body['phoneNumber'] = 'invalid';
      await postNlrPhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.phoneFormat)
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        formAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: 'invalid',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should render with error if validation fails nlr phone is same as appellants', async () => {
      req.body['phoneNumber'] = '07827297000';
      req.session.appeal.application.contactDetails = {
        phone: '07827297000'
      };
      await postNlrPhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.nlrDetails.nlrPhoneCannotBeSameAsAppellant)
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrPhoneNumber.title,
        hint: i18n.pages.nlrPhoneNumber.hint,
        showEmail: false,
        formAction: paths.nonLegalRep.provideNlrPhoneNumber,
        phoneNumber: '07827297000',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.nonLegalRep.addNonLegalRep
      });
    });

    it('should update req.session.appeal and redirect to CYA if validation passes', async () => {
      req.body['phoneNumber'] = '07827297000';
      expect(req.session.appeal.nlrDetails.phoneNumber).to.be.undefined;
      expect(req.session.appeal.nlrDetails.phoneNumber || 'none').to.equal('none');
      await postNlrPhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal('07827297000');
      expect(redirectStub).calledWith(paths.nonLegalRep.addNonLegalRep);
    });

    it('should update req.session.appeal and redirect to isSamePerson if validation passes and hasSponsor', async () => {
      req.body['phoneNumber'] = '07827297000';
      req.session.appeal.application.hasSponsor = 'Yes';
      expect(req.session.appeal.nlrDetails.phoneNumber).to.be.undefined;
      expect(req.session.appeal.nlrDetails.phoneNumber || 'none').to.equal('none');
      await postNlrPhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal('07827297000');
      expect(redirectStub).calledWith(paths.nonLegalRep.addNonLegalRep);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrPhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getSamePerson', () => {
    it('should render is-same-person.njk', () => {
      req.query.edit = '';
      req.session.appeal.nlrDetails.emailAddress = 'some@test.com';
      getSamePerson(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        formAction: paths.nonLegalRep.provideNlrIsSamePerson,
        isSponsorSameAsNlr: undefined
      });
    });

    it('should render is-same-person.njk with field', () => {
      req.session.appeal.application.isSponsorSameAsNlr = 'something';
      req.session.appeal.nlrDetails.emailAddress = 'some@test.com';

      getSamePerson(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        formAction: paths.nonLegalRep.provideNlrIsSamePerson,
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
      await postSamePerson(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'isSponsorSameAsNlr': createStructuredError('isSponsorSameAsNlr', i18n.validationErrors.isSponsorSameAsNlr)
      };
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        formAction: paths.nonLegalRep.provideNlrIsSamePerson,
        isSponsorSameAsNlr: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should update req.session.appeal and redirect to provideNlrDetailsCheckAndSend', async () => {
      req.body.isSponsorSameAsNlr = 'No';
      expect(req.session.appeal.application.isSponsorSameAsNlr).to.be.undefined;
      expect(req.session.appeal.application.isSponsorSameAsNlr || 'none').to.equal('none');

      await postSamePerson(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.application.isSponsorSameAsNlr).to.equal('No');
      expect(redirectStub).calledWith(paths.nonLegalRep.addNonLegalRep);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postSamePerson(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getCheckAndSend', () => {
    it('should render check and send page without evidence', () => {
      getCheckAndSend(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/check-and-send.njk', {
        buttonText: i18n.pages.addNonLegalRepresentative.cyaButton,
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': '' },
          }, {
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
        addressUk: {
          line1: 'someLine1',
          line2: 'someLine2',
          city: 'someCity',
          county: 'someCounty',
          postcode: 'somePostcode',
        }
      };

      getCheckAndSend(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/check-and-send.njk', {
        buttonText: i18n.pages.addNonLegalRepresentative.cyaButton,
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': 'someEmailAddress' },
          }, {
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
        address: 'some address\ntext area\nline3',
        addressUk: {
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

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/check-and-send.njk', {
        buttonText: i18n.pages.addNonLegalRepresentative.cyaButton,
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': 'someEmailAddress' },
          }, {
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

    it('should render check and send page with not isSponsorSameAsNlr', () => {
      req.session.appeal.nlrDetails = {
        givenNames: 'someGivenNames',
        familyName: 'someFamilyName',
        phoneNumber: 'somePhoneNumber',
        emailAddress: 'someEmailAddress',
        address: 'some address\ntext area\nline3',
        addressUk: {
          line1: 'someLine1',
          line2: 'someLine2',
          city: 'someCity',
          county: 'someCounty',
          postcode: 'somePostcode',
        }
      };
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'No';

      getCheckAndSend(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/check-and-send.njk', {
        buttonText: i18n.pages.addNonLegalRepresentative.cyaButton,
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': 'someEmailAddress' },
          }, {
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
            'value': { 'html': 'some address<br>text area<br>line3' },
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
            'value': { 'html': 'No' },
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
        'emailAddress': createStructuredError('emailAddress', i18n.validationErrors.nlrDetails.emailAddress),
        'givenNames': createStructuredError('givenNames', i18n.validationErrors.nlrDetails.givenNames),
        'familyName': createStructuredError('familyName', i18n.validationErrors.nlrDetails.familyName),
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.nlrDetails.phoneNumber),
        'address': createStructuredError('address', i18n.validationErrors.nlrDetails.address)
      };

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/check-and-send.njk', {
        buttonText: i18n.pages.addNonLegalRepresentative.cyaButton,
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': '' },
          }, {
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

    it('should redirect to confirmation page if validation passes if sponsor not same', async () => {
      req.session.appeal.nlrDetails = {
        givenNames: 'someGivenNames',
        familyName: 'someFamilyName',
        phoneNumber: 'somePhoneNumber',
        emailAddress: 'someEmailAddress',
        idamId: 'idamId',
        address: 'someAddress'
      };
      submitEventRefactoredStub.resolves();
      mapStub.resolves();
      validateMidEventStub.resolves();

      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitEventRefactoredStub).calledWith(Events.SEND_PIP_TO_NON_LEGAL_REP, req.session.appeal, 'idamUID', 'atoken');
      expect(mapStub.called).to.equal(true);
      expect(validateMidEventStub.called).to.equal(true);
      expect(redirectStub).calledWith(paths.nonLegalRep.inviteToJoinAppealConfirmation);
    });

    it('should render check and send page with error if missing fields if sponsor same', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'emailAddress': createStructuredError('emailAddress', i18n.validationErrors.nlrDetails.emailAddress),
        'givenNames': createStructuredError('givenNames', i18n.validationErrors.nlrDetails.givenNames),
        'familyName': createStructuredError('familyName', i18n.validationErrors.nlrDetails.familyName),
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.nlrDetails.phoneNumber),
        'address': createStructuredError('address', i18n.validationErrors.nlrDetails.address),
        'addressLine1': createStructuredError('addressLine1', i18n.validationErrors.nlrDetails.addressLine1),
        'addressTownCity': createStructuredError('addressTownCity', i18n.validationErrors.nlrDetails.addressTownCity),
        'addressPostcode': createStructuredError('addressPostcode', i18n.validationErrors.nlrDetails.addressPostcode)
      };

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/check-and-send.njk', {
        buttonText: i18n.pages.addNonLegalRepresentative.cyaButton,
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': '' },
          }, {
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
        errorList: Object.values(expectedError),
        noSaveForLater: true
      });
    });

    it('should render check and send page with error if missing address fields if sponsor same', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.session.appeal.nlrDetails = {
        givenNames: 'givenNames',
        familyName: 'familyName',
        phoneNumber: 'phoneNumber',
        emailAddress: 'emailAddress',
        addressUk: {}
      };

      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'addressLine1': createStructuredError('addressLine1', i18n.validationErrors.nlrDetails.addressLine1),
        'addressTownCity': createStructuredError('addressTownCity', i18n.validationErrors.nlrDetails.addressTownCity),
        'addressPostcode': createStructuredError('addressPostcode', i18n.validationErrors.nlrDetails.addressPostcode)
      };

      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/check-and-send.njk', {
        buttonText: i18n.pages.addNonLegalRepresentative.cyaButton,
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': 'emailAddress' },
          }, {
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
        errorList: Object.values(expectedError),
        noSaveForLater: true
      });
    });

    it('should redirect to confirmation page if validation passes if sponsor same', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.session.appeal.nlrDetails = {
        givenNames: 'someGivenNames',
        familyName: 'someFamilyName',
        phoneNumber: 'somePhoneNumber',
        emailAddress: 'someEmailAddress',
        addressUk: {
          line1: 'someLine1',
          line2: 'someLine2',
          city: 'someCity',
          county: 'someCounty',
          postcode: 'somePostcode',
        }
      };
      submitEventRefactoredStub.resolves();
      mapStub.resolves();
      validateMidEventStub.resolves();
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitEventRefactoredStub).calledWith(Events.SEND_PIP_TO_NON_LEGAL_REP, req.session.appeal, 'idamUID', 'atoken');
      expect(mapStub.called).to.equal(true);
      expect(validateMidEventStub.called).to.equal(true);
      expect(redirectStub).calledWith(paths.nonLegalRep.inviteToJoinAppealConfirmation);
    });

    it('should render with error if idam account verification validation fails', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      req.session.appeal.application.isSponsorSameAsNlr = 'Yes';
      req.session.appeal.nlrDetails = {
        givenNames: 'someGivenNames',
        familyName: 'someFamilyName',
        phoneNumber: 'somePhoneNumber',
        emailAddress: 'someEmailAddress',
        addressUk: {
          line1: 'someLine1',
          line2: 'someLine2',
          city: 'someCity',
          county: 'someCounty',
          postcode: 'somePostcode',
        }
      };
      submitEventRefactoredStub.resolves();
      mapStub.resolves();
      validateMidEventStub.resolves(['someError']);
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = createStructuredError('inviteJoinAppeal', i18n.pages.addNonLegalRepresentative.userNotExistsError);

      expectRenderedCalledOnceWithArgs(renderStub, 'templates/check-and-send.njk', {
        pageTitle: i18n.pages.addNonLegalRepresentative.title,
        formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
        previousPage: paths.nonLegalRep.addNonLegalRep,
        summaryLists: [{
          summaryRows: [{
            'key': { 'text': "Non-legal representative's email" },
            'value': { 'html': 'someEmailAddress' },
          }, {
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
        buttonText: i18n.pages.addNonLegalRepresentative.cyaButton,
        noSaveForLater: true,
        errorList: [error]
      });
      expect(mapStub.called).to.equal(true);
      expect(validateMidEventStub.called).to.equal(true);
      expect(submitEventRefactoredStub.called).to.equal(false);
      expect(redirectStub.called).to.equal(false);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getInviteToJoinAppealConfirmation', () => {
    it('should render confirmation-page', () => {
      getInviteToJoinAppealConfirmation(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/confirmation-page.njk', {
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
      expect(renderStub.called).to.equal(true);
      expectRenderedCalledWithArgs(renderStub, 'templates/confirmation-page.njk', {
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
      expect(routerGetStub.calledWith(paths.nonLegalRep.addNonLegalRep, middleware, getTaskList)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToCreateAccount, middleware, getInviteToCreateAccount)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.inviteToCreateAccount, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToCreateAccountConfirmation, middleware, getInviteToCreateAccountConfirmation)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrName, middleware, getNlrName)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrName, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrAddress, middleware, getNlrAddress)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrAddress, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrPhoneNumber, middleware, getNlrPhoneNumber)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrPhoneNumber, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrIsSamePerson, middleware, getSamePerson)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrIsSamePerson, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend, middleware, getCheckAndSend)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.provideNlrDetailsCheckAndSend, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.inviteToJoinAppealConfirmation, middleware, getInviteToJoinAppealConfirmation)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.addAnotherNonLegalRep, middleware, getAddAnotherNonLegalRepresentative)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.addAnotherNonLegalRep, middleware, sinon.match.any)).to.equal(true);
    });
  });
});

function createTask(taskId: string, isActive: boolean, isCompleted: boolean): Task {
  return {
    id: taskId,
    completed: isCompleted,
    active: isActive,
    saved: isCompleted
  };
}

function createSection(sectionId: string, tasks: Task[]): Section {
  return {
    sectionId: sectionId,
    tasks: tasks
  };
}

