import { Request, Response } from 'express';
import * as _ from 'lodash';
import { OSPlacesClient } from '../../../app/clients/OSPlacesClient';
import {
  getContactDetails,
  getHasSponsorOrNlr,
  getNlrAddress,
  getNlrContactDetails,
  getNlrName,
  getSamePerson,
  getSponsorAddress,
  getSponsorAuthorisation,
  getSponsorContactDetails,
  getSponsorName,
  postContactDetails,
  postHasSponsorOrNlr,
  postNlrAddress,
  postNlrContactDetails,
  postNlrName,
  postSamePerson,
  postSponsorAddress,
  postSponsorAuthorisation,
  postSponsorContactDetails,
  postSponsorName,
  setupContactDetailsController
} from '../../../app/controllers/appeal-application/contact-details';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { createStructuredError } from '../../../app/utils/validations/fields-validations';
import i18n from '../../../locale/en.json';
import { buildExpectedRequiredError, expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Contact details Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let osPlacesClient: OSPlacesClient;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();

  const address = {
    line1: '',
    line2: '',
    city: '',
    county: '',
    postcode: 'postcode'
  };
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submit: sinon.SinonStub;
  const error = new Error('some error message');
  let throwStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      session: {
        appeal: {
          nlrDetails: {},
          application: {
            contactDetails: {}
          }
        }
      } as Partial<Appeal>,
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any,
      body: {}
    } as Partial<Request>;
    submit = sandbox.stub();
    throwStub = sandbox.stub().throws(error);
    updateAppealService = {
      submitEventRefactored: submit
    };
    redirectStub = sandbox.stub();
    renderStub = sandbox.stub();
    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupContactDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const deps = {
        updateAppealService: updateAppealService as UpdateAppealService,
        osPlacesClient: osPlacesClient
      };
      const middleware = [];
      setupContactDetailsController(middleware, deps);
      expect(routerGetStub.calledWith(paths.appealStarted.contactDetails)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.contactDetails)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.enterPostcode)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.enterPostcode)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.enterAddress)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.enterAddress)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.postcodeLookup)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.postcodeLookup)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.oocAddress)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.oocAddress)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.hasSponsorOrNlr)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.hasSponsorOrNlr)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.isSponsorSameAsNlr)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.isSponsorSameAsNlr)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.sponsorName)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.sponsorName)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.sponsorAddress)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.sponsorAddress)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.sponsorContactDetails)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.sponsorContactDetails)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.sponsorAuthorisation)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.sponsorAuthorisation)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.nlrName)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.nlrName)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.nlrAddress)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.nlrAddress)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.nlrContactDetails)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.nlrContactDetails)).to.equal(true);
    });
  });

  describe('getContactDetails', () => {
    it('getContactDetails should render type-of-appeal.njk', () => {
      getContactDetails(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/contact-details.njk')).to.equal(true);
    });

    it('when called with edit param getContactDetail should render type-of-appeal.njk and update session', () => {
      req.query = { 'edit': '' };
      getContactDetails(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(renderStub.calledOnceWith('appeal-application/contact-details.njk')).to.equal(true);
    });

    it('getContactDetails should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getContactDetails(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postContactDetails', () => {

    describe('validates selections', () => {
      it('should show validation error if no option is selected', async () => {
        req.body = {};

        const contactDetailsExpectation = {
          email: null,
          phone: null,
          wantsEmail: false,
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#contactDetails',
          key: 'contactDetails',
          text: i18n.validationErrors.contactDetails.selectOneOption
        };
        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'contactDetails': error },
          errorList: [error],
          previousPage: paths.appealStarted.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/contact-details.njk', expectedData)).to.equal(true);
      });

      it('should show 2 validation error both options are selected but left blank', async () => {
        req.body = {
          selections: 'email,text-message',
          'email-value': '',
          'text-message-value': ''
        };

        const contactDetailsExpectation = {
          email: '',
          phone: '',
          wantsEmail: true,
          wantsSms: true
        };

        const emailError: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailEmpty
        };
        const textMessageError: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.phoneEmpty
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'email-value': emailError, 'text-message-value': textMessageError },
          errorList: [emailError, textMessageError],
          previousPage: paths.appealStarted.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/contact-details.njk', expectedData)).to.equal(true);
      });

      it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
        req.body = {
          'email-value': '',
          'text-message-value': '',
          'saveForLater': 'saveForLater'
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
      });

    });

    describe('email cases', () => {
      it('should show email empty validation error if email is selected but left blank', async () => {
        req.body = {
          selections: 'email',
          'email-value': ''
        };

        const contactDetailsExpectation = {
          email: '',
          phone: null,
          wantsEmail: true,
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailEmpty
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'email-value': error },
          errorList: [error],
          previousPage: paths.appealStarted.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/contact-details.njk', expectedData)).to.equal(true);
      });

      it('should show email format validation error if email is selected but not a valid email', async () => {
        req.body = {
          selections: 'email',
          'email-value': 'notanemail@example'
        };

        const contactDetailsExpectation = {
          email: 'notanemail@example',
          phone: null,
          wantsEmail: true,
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailFormat
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'email-value': error },
          errorList: [error],
          previousPage: paths.appealStarted.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/contact-details.njk', expectedData)).to.equal(true);
      });

      describe('should validate', () => {
        let appeal: Appeal;
        let contactDetails;
        beforeEach(() => {
          contactDetails = {
            email: 'valid@example.net',
            phone: null,
            wantsEmail: true,
            wantsSms: false
          };
          appeal = {
            ...req.session.appeal,
            application: {
              ...req.session.appeal.application,
              contactDetails: contactDetails
            }
          };

          updateAppealService.submitEventRefactored = submit.returns({
            application: {
              contactDetails
            }
          } as Appeal);
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('should validate email and redirect to enter postcode page if no address has been set', async () => {
          req.body = {
            selections: 'email',
            'email-value': 'valid@example.net'
          };
          await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

          expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
          expect(req.session.appeal.application.contactDetails).to.deep.equal(contactDetails);
          expect(redirectStub.calledWith(paths.appealStarted.enterPostcode)).to.equal(true);
        });

        it('when in edit mode should validate email and redirect to check-and-send.njk and reset isEdit flag', async () => {
          req.session.appeal.application.isEdit = true;
          appeal.application.isEdit = true;
          req.body = {
            selections: 'email',
            'email-value': 'valid@example.net'
          };
          await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

          expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
          expect(req.session.appeal.application.contactDetails).to.deep.equal(contactDetails);
          expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
          expect(req.session.appeal.application.isEdit).to.equal(undefined);
        });
      });
    });

    describe('Text message cases', () => {
      it('should show phone empty validation error if phone number is selected but left blank', async () => {
        req.body = {
          selections: 'text-message',
          'text-message-value': ''
        };

        const contactDetailsExpectation = {
          email: null,
          phone: '',
          wantsEmail: false,
          wantsSms: true
        };

        const error: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.phoneEmpty
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'text-message-value': error },
          errorList: [error],
          previousPage: paths.appealStarted.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/contact-details.njk', expectedData)).to.equal(true);
      });

      it('should show phone format validation error if text-message is selected but not a valid phone number', async () => {
        req.body = {
          selections: 'text-message',
          'text-message-value': '00'
        };

        const contactDetailsExpectation = {
          email: null,
          phone: '00',
          wantsEmail: false,
          wantsSms: true
        };

        const error: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.phoneFormat
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'text-message-value': error },
          errorList: [error],
          previousPage: paths.appealStarted.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/contact-details.njk', expectedData)).to.equal(true);
      });

      describe('Should Validate', () => {
        let contactDetails;
        let appeal: Appeal;
        beforeEach(() => {
          req.body = {
            selections: 'text-message',
            'text-message-value': '07123456789'
          };
          contactDetails = {
            email: null,
            phone: '07123456789',
            wantsEmail: false,
            wantsSms: true
          };
          appeal = {
            ...req.session.appeal,
            application: {
              ...req.session.appeal.application,
              contactDetails
            }
          };
          updateAppealService.submitEventRefactored = submit.returns({
            application: {
              contactDetails
            }
          } as Appeal);
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('should validate phone number and redirect to postcode page', async () => {
          await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

          expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
          expect(req.session.appeal.application.contactDetails).to.deep.equal(contactDetails);
          expect(redirectStub.calledWith(paths.appealStarted.enterPostcode)).to.equal(true);
        });

        it('should validate phone number and redirect to check-and-send.njk and reset isEdit', async () => {
          req.session.appeal.application.isEdit = true;
          appeal.application.isEdit = true;
          await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

          expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
          expect(req.session.appeal.application.contactDetails).to.deep.equal(contactDetails);
          expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
          expect(req.session.appeal.application.isEdit).to.equal(undefined);
        });
      });
    });

    describe('redirection', () => {
      it('should redirect to enter postcode page if no address has been set', async () => {
        req.body = {
          selections: 'email',
          'email-value': 'valid@example.net'
        };
        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(redirectStub.calledWith(paths.appealStarted.enterPostcode)).to.equal(true);
      });

      it('should redirect to enter address page if address has been set', async () => {
        _.set(req.session.appeal.application, 'personalDetails.address.line1', 'addressLine1');
        req.body = {
          selections: 'email',
          'email-value': 'valid@example.net'
        };
        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(redirectStub.calledWith(paths.appealStarted.enterAddress)).to.equal(true);
      });

      it('should redirect out of country address page when ooc feature is enabled', async () => {
        // ooc feature flag is enabled
        sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ooc-feature', false).resolves(true);

        // appeal is out of country
        req.session.appeal.appealOutOfCountry = 'Yes';
        req.body = {
          selections: 'email',
          'email-value': 'valid@example.net'
        };
        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(redirectStub.calledWith(paths.appealStarted.oocAddress)).to.equal(true);
      });
    });
  });

  describe('getHasSponsorOrNlr', () => {
    it('should render sponsor-details/has-sponsor-or-nlr.njk', async () => {
      await getHasSponsorOrNlr(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/sponsor-details/has-sponsor-or-nlr.njk')).to.equal(true);
    });

    it('when called with edit should render sponsor-details/has-sponsor-or-nlr.njk and update session', async () => {
      req.query = { 'edit': '' };
      await getHasSponsorOrNlr(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(renderStub.calledOnceWith('appeal-application/sponsor-details/has-sponsor-or-nlr.njk')).to.equal(true);
    });

    it('should render sponsor-details/has-sponsor-or-nlr.njk', async () => {
      await getHasSponsorOrNlr(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/sponsor-details/has-sponsor-or-nlr.njk', {
        question: 'Do you have a sponsor or a non-legal representative?',
        previousPage: paths.appealStarted.enterPostcode,
        hasSponsor: undefined,
        hasNonLegalRep: undefined
      });
    });

    it('should render sponsor-details/has-sponsor-or-nlr.njk with previous page pointing to manual-address endpoint', async () => {
      _.set(req.session.appeal.application, 'personalDetails.address.line1', 'addressLine1');
      await getHasSponsorOrNlr(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/sponsor-details/has-sponsor-or-nlr.njk', {
        question: 'Do you have a sponsor or a non-legal representative?',
        previousPage: paths.appealStarted.enterAddress,
        hasSponsor: undefined,
        hasNonLegalRep: undefined
      });
    });

    it('should render sponsor-details/has-sponsor-or-nlr.njk with previous page pointing to out-of-country-address endpoint', async () => {
      // ooc feature flag is enabled
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ooc-feature', false).resolves(true);

      // appeal is out of country
      req.session.appeal.appealOutOfCountry = 'Yes';
      await getHasSponsorOrNlr(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/sponsor-details/has-sponsor-or-nlr.njk', {
        question: 'Do you have a sponsor or a non-legal representative?',
        previousPage: paths.appealStarted.oocAddress,
        hasSponsor: undefined,
        hasNonLegalRep: undefined
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await getHasSponsorOrNlr(req as Request, res as Response, next);

      expect(next).calledOnceWith(error);
    });
  });

  describe('postHasSponsorOrNlr', () => {
    it('should render has sponsor or nlr page with errors if validation fails in uk no address line1', async () => {
      const expectedError = {
        hasSponsor: createStructuredError('hasSponsor', i18n.validationErrors.hasSponsor),
        hasNonLegalRep: createStructuredError('hasNonLegalRep', i18n.validationErrors.hasNonLegalRep)
      };

      await postHasSponsorOrNlr(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/sponsor-details/has-sponsor-or-nlr.njk', {
        question: i18n.pages.hasSponsorOrNlr.title,
        previousPage: paths.appealStarted.enterPostcode,
        hasSponsor: undefined,
        hasNonLegalRep: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should render has sponsor or nlr page with errors if validation fails in uk with address line1', async () => {
      _.set(req.session.appeal.application, 'personalDetails.address.line1', 'addressLine1');
      const expectedError = {
        hasSponsor: createStructuredError('hasSponsor', i18n.validationErrors.hasSponsor),
        hasNonLegalRep: createStructuredError('hasNonLegalRep', i18n.validationErrors.hasNonLegalRep)
      };

      await postHasSponsorOrNlr(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/sponsor-details/has-sponsor-or-nlr.njk', {
        question: i18n.pages.hasSponsorOrNlr.title,
        previousPage: paths.appealStarted.enterAddress,
        hasSponsor: undefined,
        hasNonLegalRep: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should render has sponsor or nlr page with errors if validation fails ooc', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.OUT_OF_COUNTRY, false).resolves(true);
      req.session.appeal.appealOutOfCountry = 'Yes';
      const expectedError = {
        hasSponsor: createStructuredError('hasSponsor', i18n.validationErrors.hasSponsor),
        hasNonLegalRep: createStructuredError('hasNonLegalRep', i18n.validationErrors.hasNonLegalRep)
      };

      await postHasSponsorOrNlr(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/sponsor-details/has-sponsor-or-nlr.njk', {
        question: i18n.pages.hasSponsorOrNlr.title,
        previousPage: paths.appealStarted.oocAddress,
        hasSponsor: undefined,
        hasNonLegalRep: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should redirect to isSponsorSameAsNlr if sponsor && nlr', async () => {
      req.body['hasSponsor'] = 'Yes';
      req.body['hasNonLegalRep'] = 'Yes';
      expect(req.session.appeal.application.hasSponsor).to.equal(undefined);
      expect(req.session.appeal.application.hasNonLegalRep).to.equal(undefined);

      await postHasSponsorOrNlr(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.application.hasSponsor).to.equal('Yes');
      expect(req.session.appeal.application.hasNonLegalRep).to.equal('Yes');
      expect(submit).calledWith(Events.EDIT_APPEAL, req.session.appeal, 'idamUID', 'atoken', false);
      expect(redirectStub).calledWith(paths.appealStarted.isSponsorSameAsNlr);
    });

    it('should redirect to sponsorName if just nlr', async () => {
      req.body['hasSponsor'] = 'Yes';
      req.body['hasNonLegalRep'] = 'No';
      expect(req.session.appeal.application.hasSponsor).to.equal(undefined);
      expect(req.session.appeal.application.hasNonLegalRep).to.equal(undefined);

      await postHasSponsorOrNlr(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.application.hasSponsor).to.equal('Yes');
      expect(req.session.appeal.application.hasNonLegalRep).to.equal('No');
      expect(submit).calledWith(Events.EDIT_APPEAL, req.session.appeal, 'idamUID', 'atoken', false);
      expect(redirectStub).calledWith(paths.appealStarted.sponsorName);
    });

    it('should redirect to nlrName if just nlr', async () => {
      req.body['hasSponsor'] = 'No';
      req.body['hasNonLegalRep'] = 'Yes';
      expect(req.session.appeal.application.hasSponsor).to.equal(undefined);
      expect(req.session.appeal.application.hasNonLegalRep).to.equal(undefined);

      await postHasSponsorOrNlr(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.application.hasSponsor).to.equal('No');
      expect(req.session.appeal.application.hasNonLegalRep).to.equal('Yes');
      expect(submit).calledWith(Events.EDIT_APPEAL, req.session.appeal, 'idamUID', 'atoken', false);
      expect(redirectStub).calledWith(paths.appealStarted.nlrName);
    });

    it('should redirect to taskList no sponsor or nlr', async () => {
      req.body['hasSponsor'] = 'No';
      req.body['hasNonLegalRep'] = 'No';
      expect(req.session.appeal.application.hasSponsor).to.equal(undefined);
      expect(req.session.appeal.application.hasNonLegalRep).to.equal(undefined);

      await postHasSponsorOrNlr(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.application.hasSponsor).to.equal('No');
      expect(req.session.appeal.application.hasNonLegalRep).to.equal('No');
      expect(submit).calledWith(Events.EDIT_APPEAL, req.session.appeal, 'idamUID', 'atoken', false);
      expect(redirectStub).calledWith(paths.appealStarted.taskList);
    });

    it('postHasSponsorOrNlr should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      await postHasSponsorOrNlr(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getSamePerson', () => {
    it('should render is-same-person.njk', () => {
      req.query.edit = '';
      getSamePerson(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.appealStarted.hasSponsorOrNlr,
        isSponsorSameAsNlr: undefined
      });
    });

    it('should render is-same-person.njk with field', () => {
      req.session.appeal.application.isSponsorSameAsNlr = 'something';

      getSamePerson(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.appealStarted.hasSponsorOrNlr,
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
      expect(renderStub).calledWith('appeal-application/sponsor-details/is-same-person.njk', {
        question: i18n.pages.isSponsorSameAsNlr.title,
        previousPage: paths.appealStarted.hasSponsorOrNlr,
        isSponsorSameAsNlr: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError)
      });
    });

    it('should update req.session.appeal and redirect to sponsorName if no', async () => {
      req.body.isSponsorSameAsNlr = 'No';
      expect(req.session.appeal.application.isSponsorSameAsNlr).to.equal(undefined);

      await postSamePerson(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.application.isSponsorSameAsNlr).to.equal('No');
      expect(redirectStub).calledWith(paths.appealStarted.sponsorName);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postSamePerson(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getSponsorNamePage', () => {
    it('should render sponsor-details/sponsor-name.njk', function () {
      getSponsorName(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/sponsor-details/sponsor-name.njk')).to.equal(true);
    });

    it('when called with edit should render sponsor-details/sponsor-name.njk and update session', function () {
      req.query = { 'edit': '' };
      getSponsorName(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(renderStub.calledOnceWith('appeal-application/sponsor-details/sponsor-name.njk')).to.equal(true);
    });

    it('gets sponsor name from session', function () {
      req.session.appeal.application.sponsorGivenNames = 'sponsorGivenNames';
      req.session.appeal.application.sponsorFamilyName = 'sponsorFamilyName';
      getSponsorName(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/sponsor-details/sponsor-name.njk',
        {
          sponsorGivenNames: 'sponsorGivenNames',
          sponsorFamilyName: 'sponsorFamilyName',
          previousPage: paths.appealStarted.hasSponsorOrNlr
        }
      );
    });
  });

  describe('postSponsorName', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.sponsorGivenNames = 'Michael';
      req.body.sponsorFamilyName = 'Jackson';

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          sponsorFamilyName: req.body.sponsorFamilyName,
          sponsorGivenNames: req.body.sponsorGivenNames
        }
      };
      updateAppealService.submitEventRefactored = submit.returns({
        application: {
          sponsorFamilyName: req.body.sponsorFamilyName,
          sponsorGivenNames: req.body.sponsorGivenNames
        }
      } as Appeal);
    });
    it('should validate and redirect to next page sponsor-details/sponsor-address', async () => {
      await postSponsorName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.sponsorAddress)).to.equal(true);
    });

    it('when in edit mode should validate and redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postSponsorName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postSponsorName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.called).to.equal(false);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body = {
        saveForLater: 'saveForLater'
      };
      await postSponsorName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.called).to.equal(false);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
    });

    it('should redirect to CYA page and validate when save for later clicked', async () => {
      req.body.saveForLater = 'saveForLater';
      await postSponsorName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });
  });

  describe('Should catch an error.', () => {
    it('getSponsorName should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getSponsorName(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getSponsorAddress', () => {
    it('should render appeal-application/sponsor-details/sponsor-address.njk', function () {
      req.session.appeal.application.sponsorAddress = {
        ...address
      };
      getSponsorAddress(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/sponsor-details/sponsor-address.njk', {
        address,
        previousPage: paths.appealStarted.sponsorName
      });
    });
  });

  describe('postSponsorAddress', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body['address-line-1'] = '60 GPS';
      req.body['address-town'] = 'London';
      req.body['address-county'] = 'London';
      req.body['address-line-2'] = '';
      req.body['address-postcode'] = 'W1W 7RT';
      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          sponsorAddress: {
            line1: req.body['address-line-1'],
            line2: req.body['address-line-2'],
            city: req.body['address-town'],
            county: req.body['address-county'],
            postcode: req.body['address-postcode']
          }
        }
      };
      updateAppealService.submitEventRefactored = submit.returns({
        application: {
          sponsorAddress: {
            line1: req.body['address-line-1'],
            line2: req.body['address-line-2'],
            city: req.body['address-town'],
            county: req.body['address-county'],
            postcode: req.body['address-postcode']
          }
        }
      } as Appeal);
    });

    it('should fail validation and render appeal-application/sponsor-details/sponsor-address.njk', async () => {
      req.body['address-postcode'] = 'W';
      await postSponsorAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.called).to.equal(false);
      expect(renderStub.calledWith('appeal-application/sponsor-details/sponsor-address.njk')).to.equal(true);
    });

    it('should validate and redirect to task list page', async () => {
      await postSponsorAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.sponsorContactDetails)).to.equal(true);
    });

    it('should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      await postSponsorAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('when in edit mode should validate and redirect to CYA page and reset the isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postSponsorAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postSponsorAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.called).to.equal(false);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postSponsorAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.called).to.equal(false);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
    });

    it('should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      await postSponsorAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getSponsorContactDetails', () => {
    it('getSponsorContactDetails should render sponsor-contact-details.njk', () => {
      getSponsorContactDetails(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/sponsor-details/sponsor-contact-details.njk')).to.equal(true);
    });

    it('when called with edit param getSponsorContactDetails should render sponsor-contact-details.njk and update session', () => {
      req.query = { 'edit': '' };
      getSponsorContactDetails(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(renderStub.calledOnceWith('appeal-application/sponsor-details/sponsor-contact-details.njk')).to.equal(true);
    });

    it('getSponsorContactDetails should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getSponsorContactDetails(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postSponsorContactDetails', () => {

    describe('validates selections', () => {
      it('should show validation error if no option is selected', async () => {
        req.body = {};

        const sponsorContactDetailsExpectation = {
          email: null,
          phone: null,
          wantsEmail: false,
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#sponsorContactDetails',
          key: 'sponsorContactDetails',
          text: i18n.validationErrors.contactDetails.selectOneOption
        };
        const expectedData = {
          sponsorContactDetails: sponsorContactDetailsExpectation,
          errors: { 'sponsorContactDetails': error },
          errorList: [error],
          previousPage: paths.appealStarted.sponsorAddress
        };

        await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/sponsor-details/sponsor-contact-details.njk', expectedData)).to.equal(true);
      });

      it('should show 2 validation error both options are selected but left blank', async () => {
        req.body = {
          selections: 'email,text-message',
          'email-value': '',
          'text-message-value': ''
        };

        const sponsorContactDetailsExpectation = {
          email: '',
          phone: '',
          wantsEmail: true,
          wantsSms: true
        };

        const emailError: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailEmpty
        };
        const textMessageError: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.phoneEmpty
        };

        const expectedData = {
          sponsorContactDetails: sponsorContactDetailsExpectation,
          errors: { 'email-value': emailError, 'text-message-value': textMessageError },
          errorList: [emailError, textMessageError],
          previousPage: paths.appealStarted.sponsorAddress
        };

        await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/sponsor-details/sponsor-contact-details.njk', expectedData)).to.equal(true);
      });

      it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
        req.body = {
          'email-value': '',
          'text-message-value': '',
          'saveForLater': 'saveForLater'
        };

        await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
      });
    });

    describe('email cases', () => {
      it('should show email empty validation error if email is selected but left blank', async () => {
        req.body = {
          selections: 'email',
          'email-value': ''
        };

        const sponsorContactDetailsExpectation = {
          email: '',
          phone: null,
          wantsEmail: true,
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailEmpty
        };

        const expectedData = {
          sponsorContactDetails: sponsorContactDetailsExpectation,
          errors: { 'email-value': error },
          errorList: [error],
          previousPage: paths.appealStarted.sponsorAddress
        };

        await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/sponsor-details/sponsor-contact-details.njk', expectedData)).to.equal(true);
      });

      it('should show email format validation error if email is selected but not a valid email', async () => {
        req.body = {
          selections: 'email',
          'email-value': 'notanemail@example'
        };

        const sponsorContactDetailsExpectation = {
          email: 'notanemail@example',
          phone: null,
          wantsEmail: true,
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailFormat
        };

        const expectedData = {
          sponsorContactDetails: sponsorContactDetailsExpectation,
          errors: { 'email-value': error },
          errorList: [error],
          previousPage: paths.appealStarted.sponsorAddress
        };

        await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/sponsor-details/sponsor-contact-details.njk', expectedData)).to.equal(true);
      });

      describe('should validate', () => {
        let appeal: Appeal;
        let sponsorContactDetails;
        beforeEach(() => {
          sponsorContactDetails = {
            email: 'valid@example.net',
            phone: null,
            wantsEmail: true,
            wantsSms: false
          };
          appeal = {
            ...req.session.appeal,
            application: {
              ...req.session.appeal.application,
              sponsorContactDetails: sponsorContactDetails
            }
          };

          updateAppealService.submitEventRefactored = submit.returns({
            application: {
              sponsorContactDetails
            }
          } as Appeal);
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('should validate email and redirect to sponsor-authorisation.njk', async () => {
          req.body = {
            selections: 'email',
            'email-value': 'valid@example.net'
          };
          await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

          expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
          expect(req.session.appeal.application.sponsorContactDetails).to.deep.equal(sponsorContactDetails);
          expect(redirectStub.calledWith(paths.appealStarted.sponsorAuthorisation)).to.equal(true);
        });

        it('when in edit mode should validate email and redirect to check-and-send.njk and reset isEdit flag', async () => {
          req.session.appeal.application.isEdit = true;
          appeal.application.isEdit = true;
          req.body = {
            selections: 'email',
            'email-value': 'valid@example.net'
          };
          await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

          expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
          expect(req.session.appeal.application.sponsorContactDetails).to.deep.equal(sponsorContactDetails);
          expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
          expect(req.session.appeal.application.isEdit).to.equal(undefined);
        });
      });
    });

    describe('Text message cases', () => {
      it('should show phone empty validation error if phone number is selected but left blank', async () => {
        req.body = {
          selections: 'text-message',
          'text-message-value': ''
        };

        const sponsorContactDetailsExpectation = {
          email: null,
          phone: '',
          wantsEmail: false,
          wantsSms: true
        };

        const error: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.phoneEmpty
        };

        const expectedData = {
          sponsorContactDetails: sponsorContactDetailsExpectation,
          errors: { 'text-message-value': error },
          errorList: [error],
          previousPage: paths.appealStarted.sponsorAddress
        };

        await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/sponsor-details/sponsor-contact-details.njk', expectedData)).to.equal(true);
      });

      it('should show phone format validation error if text-message is selected but not a valid phone number', async () => {
        req.body = {
          selections: 'text-message',
          'text-message-value': '00'
        };

        const sponsorContactDetailsExpectation = {
          email: null,
          phone: '00',
          wantsEmail: false,
          wantsSms: true
        };

        const error: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.ukPhoneFormat
        };

        const expectedData = {
          sponsorContactDetails: sponsorContactDetailsExpectation,
          errors: { 'text-message-value': error },
          errorList: [error],
          previousPage: paths.appealStarted.sponsorAddress
        };

        await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        expect(submit.called).to.equal(false);
        expect(renderStub.calledWith('appeal-application/sponsor-details/sponsor-contact-details.njk', expectedData)).to.equal(true);
      });

      describe('Should Validate', () => {
        let sponsorContactDetails;
        let appeal: Appeal;
        beforeEach(() => {
          req.body = {
            selections: 'text-message',
            'text-message-value': '07123456789'
          };
          sponsorContactDetails = {
            email: null,
            phone: '07123456789',
            wantsEmail: false,
            wantsSms: true
          };
          appeal = {
            ...req.session.appeal,
            application: {
              ...req.session.appeal.application,
              sponsorContactDetails
            }
          };
          updateAppealService.submitEventRefactored = submit.returns({
            application: {
              sponsorContactDetails
            }
          } as Appeal);
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('should validate phone number and redirect to sponsor-authorisation.njk', async () => {
          await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

          expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
          expect(req.session.appeal.application.sponsorContactDetails).to.deep.equal(sponsorContactDetails);
          expect(redirectStub.calledWith(paths.appealStarted.sponsorAuthorisation)).to.equal(true);
        });

        it('should validate phone number and redirect to check-and-send.njk and reset isEdit', async () => {
          req.session.appeal.application.isEdit = true;
          appeal.application.isEdit = true;
          await postSponsorContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

          expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
          expect(req.session.appeal.application.sponsorContactDetails).to.deep.equal(sponsorContactDetails);
          expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
          expect(req.session.appeal.application.isEdit).to.equal(undefined);
        });
      });
    });
  });

  describe('getSponsorAuthorisation', () => {
    it('should render sponsor-details/sponsor-authorisation.njk', async () => {
      await getSponsorAuthorisation(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/sponsor-details/sponsor-authorisation.njk')).to.equal(true);
    });

    it('when called with edit should render sponsor-details/sponsor-authorisation.njk and update session', async () => {
      req.query = { 'edit': '' };
      await getSponsorAuthorisation(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(renderStub.calledOnceWith('appeal-application/sponsor-details/sponsor-authorisation.njk')).to.equal(true);
    });

    it('should render sponsor-details/sponsor-authorisation.njk', async () => {
      await getSponsorAuthorisation(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/sponsor-details/sponsor-authorisation.njk', {
        question: 'Do you agree to let your sponsor have access to information about your appeal?',
        description: undefined,
        modal: undefined,
        questionId: undefined,
        previousPage: paths.appealStarted.sponsorContactDetails,
        answer: undefined,
        errors: undefined,
        errorList: undefined
      });
    });
  });

  describe('postSponsorAuthorisation', () => {
    let appeal: Appeal;
    beforeEach(() => {
      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          sponsorAuthorisation: 'Yes'
        }
      };

      updateAppealService.submitEventRefactored = submit.returns({
        application: {
          sponsorAuthorisation: 'Yes'
        }
      } as Appeal);
    });

    it('should validate and redirect to taskList', async () => {
      req.body['answer'] = 'Yes';
      await postSponsorAuthorisation(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', false)).to.equal(true);
      expect(redirectStub.calledOnceWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('should validate and redirect to nlrName if hasNlr yes', async () => {
      req.body['answer'] = 'Yes';
      req.session.appeal.application.hasNonLegalRep = 'Yes';
      appeal.application.hasNonLegalRep = 'Yes';
      await postSponsorAuthorisation(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', false)).to.equal(true);
      expect(redirectStub.calledOnceWith(paths.appealStarted.nlrName)).to.equal(true);
    });

    it('should fail validation and sponsor-details/sponsor-authorisation.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'answer',
        text: 'Select yes if you agree to let your sponsor have access to information about your appeal',
        href: '#answer'
      };

      await postSponsorAuthorisation(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.called).to.equal(false);
      expect(renderStub).to.be.calledOnceWith('appeal-application/sponsor-details/sponsor-authorisation.njk', {
        question: 'Do you agree to let your sponsor have access to information about your appeal?',
        description: undefined,
        modal: undefined,
        questionId: undefined,
        previousPage: paths.appealStarted.sponsorContactDetails,
        answer: undefined,
        errors: { answer: expectedError },
        errorList: [expectedError]
      });
    });

    it('postSponsorAuthorisation should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'sponsorAuthorisation': undefined };
      res.render = renderStub.throws(error);
      await postSponsorAuthorisation(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNlrName', () => {
    it('should render name.njk with correct previous page if hasSponsor', () => {
      req.query.edit = '';
      req.session.appeal.application.hasSponsor = 'Yes';
      getNlrName(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.appealStarted.nlrName,
        nlrGivenNames: undefined,
        nlrFamilyName: undefined,
        previousPage: paths.appealStarted.sponsorAuthorisation,
        saveForLater: true
      });
    });

    it('should render name.njk with correct previous page if no hasSponsor', () => {
      req.session.appeal.application.hasSponsor = 'No';
      req.session.appeal.nlrDetails = {
        givenNames: 'someGivenNames',
        familyName: 'someFamilyName'
      };
      getNlrName(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.appealStarted.nlrName,
        nlrGivenNames: 'someGivenNames',
        nlrFamilyName: 'someFamilyName',
        previousPage: paths.appealStarted.hasSponsorOrNlr,
        saveForLater: true
      });
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      getNlrName(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postNlrName', () => {
    it('should render with error if validation fails required', async () => {
      req.session.appeal.application.hasSponsor = 'Yes';
      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'nlrGivenNames': buildExpectedRequiredError('nlrGivenNames'),
        'nlrFamilyName': buildExpectedRequiredError('nlrFamilyName')
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.appealStarted.nlrName,
        nlrGivenNames: undefined,
        nlrFamilyName: undefined,
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.sponsorAuthorisation,
        saveForLater: true
      });
    });

    it('should render with error if validation fails one name', async () => {
      req.body.nlrGivenNames = 'someGivenName';
      req.body.nlrFamilyName = '';
      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'nlrFamilyName': createStructuredError('nlrFamilyName', i18n.validationErrors.nlrFamilyName)
      };

      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.appealStarted.nlrName,
        nlrGivenNames: 'someGivenName',
        nlrFamilyName: '',
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.hasSponsorOrNlr,
        saveForLater: true
      });
    });

    it('should render with error if validation fails both names', async () => {
      req.body.nlrGivenNames = '';
      req.body.nlrFamilyName = '';
      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'nlrGivenNames': createStructuredError('nlrGivenNames', i18n.validationErrors.nlrGivenNames),
        'nlrFamilyName': createStructuredError('nlrFamilyName', i18n.validationErrors.nlrFamilyName)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/name.njk', {
        postAction: paths.appealStarted.nlrName,
        nlrGivenNames: '',
        nlrFamilyName: '',
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.hasSponsorOrNlr,
        saveForLater: true
      });
    });

    it('should redirect to address if validation passes', async () => {
      req.body.nlrGivenNames = 'someGivenName';
      req.body.nlrFamilyName = 'someFamilyName';
      expect(req.session.appeal.nlrDetails.givenNames).to.equal(undefined);
      expect(req.session.appeal.nlrDetails.familyName).to.equal(undefined);

      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.nlrDetails.givenNames).to.equal('someGivenName');
      expect(req.session.appeal.nlrDetails.familyName).to.equal('someFamilyName');
      expect(redirectStub).calledWith(paths.appealStarted.nlrAddress);
    });

    it('should redirect to CYA if validation passes and isEdit true', async () => {
      req.body.nlrGivenNames = 'someGivenName';
      req.body.nlrFamilyName = 'someFamilyName';
      req.session.appeal.application.isEdit = true;
      expect(req.session.appeal.nlrDetails.givenNames).to.equal(undefined);
      expect(req.session.appeal.nlrDetails.familyName).to.equal(undefined);

      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.nlrDetails.givenNames).to.equal('someGivenName');
      expect(req.session.appeal.nlrDetails.familyName).to.equal('someFamilyName');
      expect(redirectStub).calledWith(paths.appealStarted.checkAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrName(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getNlrAddress', () => {
    it('should render address.njk', () => {
      req.query.edit = '';
      getNlrAddress(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.equal(true);
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.appealStarted.nlrAddress,
        address: null,
        previousPage: paths.appealStarted.nlrName,
        saveForLater: true
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
        postAction: paths.appealStarted.nlrAddress,
        address: expectedAddress,
        previousPage: paths.appealStarted.nlrName,
        saveForLater: true
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
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'address-line-1': buildExpectedRequiredError('address-line-1'),
        'address-town': buildExpectedRequiredError('address-town'),
        'address-postcode': buildExpectedRequiredError('address-postcode')
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.appealStarted.nlrAddress,
        nlrAddress: {
          line1: undefined,
          line2: undefined,
          city: undefined,
          county: undefined,
          postcode: undefined
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.nlrName,
        saveForLater: true
      });
    });

    it('should render with error if validation fails empty', async () => {
      req.body['address-line-1'] = '';
      req.body['address-town'] = '';
      req.body['address-postcode'] = '';
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'address-line-1': createStructuredError('address-line-1', i18n.validationErrors.nlrAddress.line1Required),
        'address-town': createStructuredError('address-town', i18n.validationErrors.nlrAddress.townCityRequired),
        'address-postcode': createStructuredError('address-postcode', i18n.validationErrors.nlrAddress.postcodeRequired)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.appealStarted.nlrAddress,
        nlrAddress: {
          line1: '',
          line2: undefined,
          city: '',
          county: undefined,
          postcode: ''
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.nlrName,
        saveForLater: true
      });
    });

    it('should render with error if postcode validation fails invalid', async () => {
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
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/address.njk', {
        postAction: paths.appealStarted.nlrAddress,
        nlrAddress: {
          line1: 'line1',
          line2: undefined,
          city: 'town',
          county: undefined,
          postcode: 'someBadPostcode'
        },
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.nlrName,
        saveForLater: true
      });
    });

    it('should update req.session.appeal and redirect to contact details if validation passes and isEdit true', async () => {
      req.body['address-line-1'] = 'line1';
      req.body['address-town'] = 'town';
      req.body['address-postcode'] = 'SW1A 2AA';
      expect(req.session.appeal.nlrDetails.address).to.equal(undefined);
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.address).to.deep.equal({
        line1: 'line1',
        line2: undefined,
        city: 'town',
        county: undefined,
        postcode: 'SW1A 2AA'
      });
      expect(redirectStub).calledWith(paths.appealStarted.nlrContactDetails);
    });

    it('should update req.session.appeal and redirect to CYA if validation passes and isEdit true', async () => {
      req.body['address-line-1'] = 'line1';
      req.body['address-line-2'] = 'line2';
      req.body['address-town'] = 'town';
      req.body['address-county'] = 'county';
      req.body['address-postcode'] = 'SW1A 2AA';
      req.session.appeal.application.isEdit = true;
      expect(req.session.appeal.nlrDetails.address).to.equal(undefined);
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.address).to.deep.equal({
        line1: 'line1',
        line2: 'line2',
        city: 'town',
        county: 'county',
        postcode: 'SW1A 2AA'
      });
      expect(redirectStub).calledWith(paths.appealStarted.checkAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
        hint: i18n.pages.nlrContactDetails.hint,
        nextStep: i18n.pages.nlrContactDetails.nextStep,
        showEmail: true,
        postAction: paths.appealStarted.nlrContactDetails,
        emailAddress: undefined,
        phoneNumber: undefined,
        previousPage: paths.appealStarted.nlrAddress,
        saveForLater: true
      });
    });

    it('should render contact-details.njk with contact details if present', () => {
      req.session.appeal.nlrDetails.emailAddress = 'emailAddress';
      req.session.appeal.nlrDetails.phoneNumber = 'phoneNumber';
      getNlrContactDetails(req as Request, res as Response, next);

      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        hint: i18n.pages.nlrContactDetails.hint,
        nextStep: i18n.pages.nlrContactDetails.nextStep,
        showEmail: true,
        postAction: paths.appealStarted.nlrContactDetails,
        emailAddress: 'emailAddress',
        phoneNumber: 'phoneNumber',
        previousPage: paths.appealStarted.nlrAddress,
        saveForLater: true
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
      await postNlrContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'emailAddress': buildExpectedRequiredError('emailAddress'),
        'phoneNumber': buildExpectedRequiredError('phoneNumber')
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        hint: i18n.pages.nlrContactDetails.hint,
        nextStep: i18n.pages.nlrContactDetails.nextStep,
        showEmail: true,
        postAction: paths.appealStarted.nlrContactDetails,
        emailAddress: undefined,
        phoneNumber: undefined,
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.nlrAddress,
        saveForLater: true
      });
    });

    it('should render with error if validation fails empty', async () => {
      req.body['emailAddress'] = '';
      req.body['phoneNumber'] = '';
      await postNlrContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'emailAddress': createStructuredError('emailAddress', i18n.validationErrors.emailEmpty),
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.phoneEmpty)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        hint: i18n.pages.nlrContactDetails.hint,
        nextStep: i18n.pages.nlrContactDetails.nextStep,
        showEmail: true,
        postAction: paths.appealStarted.nlrContactDetails,
        emailAddress: '',
        phoneNumber: '',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.nlrAddress,
        saveForLater: true
      });
    });

    it('should render with error if validation fails invalid format', async () => {
      req.body['emailAddress'] = 'invalid';
      req.body['phoneNumber'] = 'invalid';
      await postNlrContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'emailAddress': createStructuredError('emailAddress', i18n.validationErrors.emailFormat),
        'phoneNumber': createStructuredError('phoneNumber', i18n.validationErrors.phoneFormat)
      };
      expect(renderStub).calledWith('appeal-application/non-legal-rep-details/contact-details.njk', {
        title: i18n.pages.nlrContactDetails.title,
        hint: i18n.pages.nlrContactDetails.hint,
        nextStep: i18n.pages.nlrContactDetails.nextStep,
        showEmail: true,
        postAction: paths.appealStarted.nlrContactDetails,
        emailAddress: 'invalid',
        phoneNumber: 'invalid',
        errors: expectedError,
        errorList: Object.values(expectedError),
        previousPage: paths.appealStarted.nlrAddress,
        saveForLater: true
      });
    });

    it('should update req.session.appeal and redirect to taskList if validation passes', async () => {
      req.body['emailAddress'] = 'test@test.com';
      req.body['phoneNumber'] = '07827297000';
      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal(undefined);
      expect(req.session.appeal.nlrDetails.emailAddress).to.equal(undefined);
      await postNlrContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal('07827297000');
      expect(req.session.appeal.nlrDetails.emailAddress).to.equal('test@test.com');
      expect(redirectStub).calledWith(paths.appealStarted.taskList);
    });

    it('should update req.session.appeal and redirect to CYA if validation passes and isEdit', async () => {
      req.session.appeal.application.isEdit = true;
      req.body['emailAddress'] = 'test@test.com';
      req.body['phoneNumber'] = '07827297000';
      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal(undefined);
      expect(req.session.appeal.nlrDetails.emailAddress).to.equal(undefined);
      await postNlrContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.nlrDetails.phoneNumber).to.equal('07827297000');
      expect(req.session.appeal.nlrDetails.emailAddress).to.equal('test@test.com');
      expect(redirectStub).calledWith(paths.appealStarted.checkAndSend);
    });

    it('should catch an error and call next with error', async () => {
      res.render = throwStub;
      await postNlrAddress(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
});
