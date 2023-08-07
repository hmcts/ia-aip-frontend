import { NextFunction, Request, Response } from 'express';
import {
  addMoreLanguagePostAction,
  getAccessNeeds,
  getAdditionalLanguage,
  getHearingLoopPage,
  getInterpreterSignLanguagePage,
  getInterpreterSpokenLanguagePage,
  getInterpreterSupportAppellantWitnesses,
  getInterpreterTypePage,
  getNeedInterpreterPage,
  getStepFreeAccessPage,
  getWitnessesInterpreterNeeds,
  postAdditionalLanguage,
  postHearingLoopPage,
  postInterpreterSignLanguagePage,
  postInterpreterSpokenLanguagePage,
  postInterpreterSupportAppellantWitnesses,
  postInterpreterTypePage,
  postNeedInterpreterPage,
  postStepFreeAccessPage,
  postWitnessesInterpreterNeeds,
  removeLanguagePostAction,
  setupHearingAccessNeedsController
} from '../../../../app/controllers/hearing-requirements/access-needs';
import { isoLanguages } from '../../../../app/data/isoLanguages';
import { paths } from '../../../../app/paths';
import RefDataService from '../../../../app/service/ref-data-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Hearing requirements access needs controller', () => {
  let sandbox: sinon.SinonSandbox;
  let refDataServiceObj: Partial<RefDataService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();
  const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
  let refDataServiceForSpokenLanguage;
  let refDataServiceForSignLanguage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          hearingRequirements: {
            isInterpreterServicesNeeded: true
          }
        }
      } as Partial<Appeal>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any,
      body: {}
    } as Partial<Request>;

    refDataServiceForSpokenLanguage = {
      getCommonRefData: sandbox.stub().withArgs(req as Request, 'InterpreterLanguage').returns(JSON.stringify({
        'list_of_values': [
          {
            'category_key': 'InterpreterLanguage',
            'key': 'hun',
            'value_en': 'Hungarian',
            'value_cy': '',
            'hint_text_en': '',
            'hint_text_cy': '',
            'lov_order': null,
            'parent_category': '',
            'parent_key': '',
            'active_flag': 'Y',
            'child_nodes': null
          }
        ]
      }))
    } as Partial<RefDataService>;

    refDataServiceForSignLanguage = {
      getCommonRefData: sandbox.stub().withArgs(req as Request, 'SignLanguage').returns(JSON.stringify({
        'list_of_values': [
          {
            'category_key': 'SignLanguage',
            'key': 'bfi',
            'value_en': 'British Sign Language (BSL)',
            'value_cy': 'Iaith Arwyddion Prydain (BSL)',
            'hint_text_en': '',
            'hint_text_cy': '',
            'lov_order': null,
            'parent_category': '',
            'parent_key': '',
            'active_flag': 'Y',
            'child_nodes': null
          }
        ]
      }))
    } as Partial<RefDataService>;

    updateAppealService = { submitEvent: sandbox.stub() };

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHearingAccessNeedsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingAccessNeedsController(middleware, updateAppealService as UpdateAppealService, refDataServiceObj as RefDataService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.accessNeeds);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreter);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreterTypes);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetails);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetailsRemove);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingStepFreeAccess);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLoop);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreter);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreterTypes);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetails);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetailsAdd);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingStepFreeAccess);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingLoop);
    });
  });

  describe('getAccessNeeds', () => {
    it('getAccessNeeds should access-needs.njk when there is no witnesses on hearing', () => {
      req.session.appeal.hearingRequirements.witnessesOnHearing = false;

      getAccessNeeds(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/access-needs.njk', {
        previousPage: previousPage,
        link: paths.submitHearingRequirements.hearingInterpreter
      });
    });

    it('getAccessNeeds should access-needs.njk when there is witnesses on hearing', () => {
      req.session.appeal.hearingRequirements.witnessesOnHearing = true;

      getAccessNeeds(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/access-needs.njk', {
        previousPage: previousPage,
        link: paths.submitHearingRequirements.hearingInterpreterSupportAppellantWitnesses
      });
    });
  });

  describe('InterpreterSupportAppellantWitnesses', () => {
    it('getInterpreterSupportAppellantWitnesses should render getInterpreterSupportAppellantWitnesses', () => {
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = undefined;
      req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired = undefined;

      getInterpreterSupportAppellantWitnesses(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-support-appellant-witnesses.njk', {
        previousPage: previousPage,
        isInterpreterServicesNeeded: false,
        isAnyWitnessInterpreterRequired: false,
        noInterpreterRequired: false
      });
    });

    it('getInterpreterSupportAppellantWitnesses should render the page when load user answer with interpreter support', () => {
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = true;
      req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired = true;

      getInterpreterSupportAppellantWitnesses(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-support-appellant-witnesses.njk', {
        previousPage: previousPage,
        isInterpreterServicesNeeded: true,
        isAnyWitnessInterpreterRequired: true,
        noInterpreterRequired: false
      });
    });

    it('getInterpreterSupportAppellantWitnesses should render the page when load user answer with no interpreter support', () => {
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = false;
      req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired = false;

      getInterpreterSupportAppellantWitnesses(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-support-appellant-witnesses.njk', {
        previousPage: previousPage,
        isInterpreterServicesNeeded: false,
        isAnyWitnessInterpreterRequired: false,
        noInterpreterRequired: true
      });
    });

    it('postInterpreterSupportAppellantWitnesses should show validation error if no option is selected', async () => {
      req.body.selections = '';

      await postInterpreterSupportAppellantWitnesses(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-support-appellant-witnesses.njk', {
        previousPage: previousPage,
        errorList: [
          {
            key: 'selections',
            text: 'You must select at least one option',
            href: '#selections'
          }
        ]
      });
    });
  });

  describe('WitnessesInterpreterNeeds', () => {
    it('getWitnessesInterpreterNeeds should render getWitnessesInterpreterNeeds', () => {
      req.session.appeal.hearingRequirements.witnessNames = [{ witnessGivenNames: 'witness', witnessFamilyName: '1' }];

      getWitnessesInterpreterNeeds(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/witnesses-interpreter-needs.njk', {
        previousPage: previousPage,
        witnessesNameList: [{ value: 0, text: 'witness 1', checked: false }]
      });
    });

    it('getWitnessesInterpreterNeeds should render the page when load appellant selected witnesses', () => {
      req.session.appeal.hearingRequirements.witnessNames = [
        { witnessGivenNames: 'witness', witnessFamilyName: '1' },
        { witnessGivenNames: 'witness', witnessFamilyName: '2' }
      ];
      req.session.appeal.hearingRequirements.witnessListElement1 = { value: [{ code: 'witness 1', label: 'witness 1' }], list_items: [{ code: 'witness 1', label: 'witness 1' }] };
      req.session.appeal.hearingRequirements.witnessListElement2 = { value: [], list_items: [{ code: 'witness 2', label: 'witness 2' }] };

      getWitnessesInterpreterNeeds(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/witnesses-interpreter-needs.njk', {
        previousPage: previousPage,
        witnessesNameList: [
          { value: 0, text: 'witness 1', checked: true },
          { value: 1, text: 'witness 2', checked: false }
        ]
      });
    });

    it('postWitnessesInterpreterNeeds should show validation error if no witness is selected', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [{ witnessGivenNames: 'witness', witnessFamilyName: '1' }];
      req.body.selections = '';

      await postWitnessesInterpreterNeeds(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/witnesses-interpreter-needs.njk', {
        previousPage: previousPage,
        witnessesNameList: [{ value: 0, text: 'witness 1', checked: false }],
        errorList: [
          {
            key: 'selections',
            text: 'You must select at least one witness',
            href: '#selections'
          }
        ]
      });
    });
  });

  describe('NeedInterpreterPage', () => {
    it('getNeedInterpreterPage should render getNeedInterpreterPage', () => {
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = null;
      getNeedInterpreterPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter',
        pageTitle: 'Will you need an interpreter at the hearing?',
        saveAndContinue: true,
        question: {
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you need an interpreter at the hearing?',
          hint: 'We will provide an interpreter for you. You cannot bring your own.',
          name: 'answer'
        }
      });
    });

    it('postNeedInterpreterPage should show validation error if no option is selected needs Interperter', async () => {
      req.body.answer = '';
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = null;
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
        errorList: [{ key: 'answer', text: '"answer" is not allowed to be empty', href: '#answer' }],
        error: { 'answer': { key: 'answer', text: '"answer" is not allowed to be empty', href: '#answer' } },
        previousPage: previousPage,
        formAction: '/hearing-interpreter',
        pageTitle: 'Will you need an interpreter at the hearing?',
        question: {
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Will you need an interpreter at the hearing?',
          hint: 'We will provide an interpreter for you. You cannot bring your own.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('should redirect to overview page if save for later and not validation required', async () => {
      req.body.saveForLater = 'saveForLater';
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

  });

  describe('HearingInterpreterTypePage', () => {
    it('getInterpreterTypePage should render getInterpreterTypePage for appellant', () => {
      req.query = { selectedWitnesses: null };
      getInterpreterTypePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: previousPage,
        pageQuestion: 'What kind of interpreter do you need to request?',
        checkboxHintText: 'Select all that apply',
        interpreterSpokenLanguage: false,
        interpreterSignLanguage: false,
        selectedWitnessesList: null
      });
    });

    it('getInterpreterTypePage should render getInterpreterTypePage for witness', () => {
      req.query = { selectedWitnesses: '0' };
      req.session.appeal.hearingRequirements.witnessListElement1 = { "value": [{ "code": "Witness 1", "label": "Witness 1" } ], "list_items": [{ "code": "Witness 1", "label": "Witness 1" } ] };
      getInterpreterTypePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: previousPage,
        pageQuestion: 'What kind of interpreter will Witness 1 need?',
        checkboxHintText: '',
        interpreterSpokenLanguage: false,
        interpreterSignLanguage: false,
        selectedWitnessesList: [ '0' ]
      });
    });

    it('getInterpreterTypePage should render getInterpreterTypePage if appellant selected personal spoken and sign language', () => {
      req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.query = { selectedWitnesses: null };
      getInterpreterTypePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: previousPage,
        pageQuestion: 'What kind of interpreter do you need to request?',
        checkboxHintText: 'Select all that apply',
        interpreterSpokenLanguage: true,
        interpreterSignLanguage: true,
        selectedWitnessesList: null
      });
    });

    it('getInterpreterTypePage should render getInterpreterTypePage if appellant selected personal spoken and sign language for witness', () => {
      req.query = { selectedWitnesses: '0' };
      req.session.appeal.hearingRequirements.witnessListElement1 = { "value": [{ "code": "Witness 1", "label": "Witness 1" } ], "list_items": [{ "code": "Witness 1", "label": "Witness 1" } ] };
      req.session.appeal.hearingRequirements.witness1InterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      getInterpreterTypePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: previousPage,
        pageQuestion: 'What kind of interpreter will Witness 1 need?',
        checkboxHintText: '',
        interpreterSpokenLanguage: true,
        interpreterSignLanguage: true,
        selectedWitnessesList: [ '0' ]
      });
    });

    it('postInterpreterTypePage should show validation error if appellant did not select interpreter language', async () => {
      req.body.selections = '';
      await postInterpreterTypePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: previousPage,
        pageQuestion: 'What kind of interpreter do you need to request?',
        checkboxHintText: 'Select all that apply',
        selectedWitnessesList: null,
        errorList: Object.values([{ key: 'selections', text: 'You must select at least one kind of interpreter', href: '#selections' }])
      });
    });

    it('postInterpreterTypePage should show validation error if appellant did not select interpreter language for witness', async () => {
      req.body.selectedWitnessesList = '0';
      req.session.appeal.hearingRequirements.witnessListElement1 = { "value": [{ "code": "Witness 1", "label": "Witness 1" } ], "list_items": [{ "code": "Witness 1", "label": "Witness 1" } ] };
      req.body.selections = '';
      await postInterpreterTypePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-types.njk', {
        previousPage: previousPage,
        pageQuestion: 'What kind of interpreter will Witness 1 need?',
        checkboxHintText: '',
        selectedWitnessesList: [ '0' ],
        errorList: Object.values([{ key: 'selections', text: 'You must select at least one kind of interpreter', href: '#selections' }])
      });
    });
  });

  describe('InterpreterSpokenLanguagePage', () => {
    it('getInterpreterSpokenLanguagePage should render getInterpreterSpokenLanguagePage', async () => {

      req.query = { selectedWitnesses: null };
      await getInterpreterSpokenLanguagePage(refDataServiceForSpokenLanguage as RefDataService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-language-selection.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter-spoken-language-selection',
        pageTitle: 'Tell us about your language requirements',
        pageText: 'We will provide an interpreter for you to understand spoken communication.',
        dropdownListText: 'Select language',
        checkBoxText: 'Enter the language manually',
        languageManuallyText: 'Enter the details of the language you need to request',
        languageManualEntry: false,
        languageManualEntryDescription: '',
        items: [
          { text: 'Select language', value: '' },
          { text: 'Hungarian', value: 'hun', selected: null }
        ],
        selectedWitnessesList: null
      });
    });

    it('getInterpreterSpokenLanguagePage should render getInterpreterSpokenLanguagePage for witness', async () => {

      req.query = { selectedWitnesses: '0' };
      req.session.appeal.hearingRequirements.witnessListElement1 = { "value": [{ "code": "Witness 1", "label": "Witness 1" } ], "list_items": [{ "code": "Witness 1", "label": "Witness 1" } ] };
      await getInterpreterSpokenLanguagePage(refDataServiceForSpokenLanguage as RefDataService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-language-selection.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter-spoken-language-selection',
        pageTitle: 'Which spoken language interpreter does Witness 1 need?',
        pageText: '',
        dropdownListText: 'Select language',
        checkBoxText: 'Enter the language manually',
        languageManuallyText: 'Enter the details of the language you need to request',
        languageManualEntry: false,
        languageManualEntryDescription: '',
        items: [
          { text: 'Select language', value: '' },
          { text: 'Hungarian', value: 'hun', selected: null }
        ],
        selectedWitnessesList: [ '0' ]
      });
    });

    it('postInterpreterSpokenLanguagePage should show validation error if appellant did not select spokenn language', async () => {

      await postInterpreterSpokenLanguagePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-language-selection.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter-spoken-language-selection',
        pageTitle: 'Tell us about your language requirements',
        pageText: 'We will provide an interpreter for you to understand spoken communication.',
        dropdownListText: 'Select language',
        checkBoxText: 'Enter the language manually',
        languageManuallyText: 'Enter the details of the language you need to request',
        languageManualEntry: false,
        languageManualEntryDescription: '',
        items: [
          { text: 'Select language', value: '' },
          { text: 'Hungarian', value: 'hun', selected: null }
        ],
        selectedWitnessesList: null,
        errors: {
          'languageRefData-languageManualEntry': {
            key: 'languageRefData-languageManualEntry',
            text: 'Please select the language you need to request',
            href: '#languageRefData'
          }
        },
        errorList: [
          {
            key: 'languageRefData-languageManualEntry',
            text: 'Please select the language you need to request',
            href: '#languageRefData'
          }
        ]
      });
    });

    it('postInterpreterSpokenLanguagePage should show validation error if appellant did not select spokenn language for witness', async () => {

      req.body.selectedWitnessesList = '0';
      req.session.appeal.hearingRequirements.witnessListElement1 = { "value": [{ "code": "Witness 1", "label": "Witness 1" } ], "list_items": [{ "code": "Witness 1", "label": "Witness 1" } ] };
      await postInterpreterSpokenLanguagePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-language-selection.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter-spoken-language-selection',
        pageTitle: 'Which spoken language interpreter does Witness 1 need?',
        pageText: '',
        dropdownListText: 'Select language',
        checkBoxText: 'Enter the language manually',
        languageManuallyText: 'Enter the details of the language you need to request',
        languageManualEntry: false,
        languageManualEntryDescription: '',
        items: [
          { text: 'Select language', value: '' },
          { text: 'Hungarian', value: 'hun', selected: null }
        ],
        selectedWitnessesList: [ '0' ],
        errors: {
          'languageRefData-languageManualEntry': {
            key: 'languageRefData-languageManualEntry',
            text: 'Please select the language you need to request',
            href: '#languageRefData'
          }
        },
        errorList: [
          {
            key: 'languageRefData-languageManualEntry',
            text: 'Please select the language you need to request',
            href: '#languageRefData'
          }
        ]
      });
    });
  });

  describe('InterpreterSignLanguagePage', () => {
    it('getInterpreterSignLanguagePage should render getInterpreterSignLanguagePage', async () => {

      req.query = { selectedWitnesses: null };
      await getInterpreterSignLanguagePage(refDataServiceForSignLanguage as RefDataService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-language-selection.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter-sign-language-selection',
        pageTitle: 'Tell us about your sign language requirements',
        pageText: 'We will provide a sign language interpreter for you to understand spoken communication.',
        dropdownListText: 'Select sign language',
        checkBoxText: 'Enter the language manually',
        languageManuallyText: 'Enter the details of the language you need to request',
        languageManualEntry: false,
        languageManualEntryDescription: '',
        items: [
          { text: 'Select language', value: '' },
          { text: 'British Sign Language (BSL)', value: 'bfi', selected: null }
        ],
        selectedWitnessesList: null
      });
    });

    it('getInterpreterSignLanguagePage should render getInterpreterSignLanguagePage for witness', async () => {

      req.query = { selectedWitnesses: '0' };
      req.session.appeal.hearingRequirements.witnessListElement1 = { "value": [{ "code": "Witness 1", "label": "Witness 1" } ], "list_items": [{ "code": "Witness 1", "label": "Witness 1" } ] };
      await getInterpreterSignLanguagePage(refDataServiceForSignLanguage as RefDataService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-language-selection.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter-sign-language-selection',
        pageTitle: 'Which sign language interpreter does Witness 1 need?',
        pageText: '',
        dropdownListText: 'Select sign language',
        checkBoxText: 'Enter the language manually',
        languageManuallyText: 'Enter the details of the language you need to request',
        languageManualEntry: false,
        languageManualEntryDescription: '',
        items: [
          { text: 'Select language', value: '' },
          { text: 'British Sign Language (BSL)', value: 'bfi', selected: null }
        ],
        selectedWitnessesList: ['0']
      });
    });

    it('postInterpreterSignLanguagePage should show validation error if appellant did not sign spokenn language', async () => {

      await postInterpreterSignLanguagePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-language-selection.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter-sign-language-selection',
        pageTitle: 'Tell us about your sign language requirements',
        pageText: 'We will provide a sign language interpreter for you to understand spoken communication.',
        dropdownListText: 'Select sign language',
        checkBoxText: 'Enter the language manually',
        languageManuallyText: 'Enter the details of the language you need to request',
        languageManualEntry: false,
        languageManualEntryDescription: '',
        items: [
          { text: 'Select language', value: '' },
          { text: 'British Sign Language (BSL)', value: 'bfi', selected: null }
        ],
        selectedWitnessesList: null,
        errors: {
          'languageRefData-languageManualEntry': {
            key: 'languageRefData-languageManualEntry',
            text: 'Please select the language you need to request',
            href: '#languageRefData'
          }
        },
        errorList: [
          {
            key: 'languageRefData-languageManualEntry',
            text: 'Please select the language you need to request',
            href: '#languageRefData'
          }
        ]
      });
    });

    it('postInterpreterSignLanguagePage should show validation error if appellant did not select sign language for witness', async () => {

      req.body.selectedWitnessesList = '0';
      req.session.appeal.hearingRequirements.witnessListElement1 = { "value": [{ "code": "Witness 1", "label": "Witness 1" } ], "list_items": [{ "code": "Witness 1", "label": "Witness 1" } ] };
      await postInterpreterSignLanguagePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/interpreter-language-selection.njk', {
        previousPage: previousPage,
        formAction: '/hearing-interpreter-sign-language-selection',
        pageTitle: 'Which sign language interpreter does Witness 1 need?',
        pageText: '',
        dropdownListText: 'Select sign language',
        checkBoxText: 'Enter the language manually',
        languageManuallyText: 'Enter the details of the language you need to request',
        languageManualEntry: false,
        languageManualEntryDescription: '',
        items: [
          { text: 'Select language', value: '' },
          { text: 'British Sign Language (BSL)', value: 'bfi', selected: null }
        ],
        selectedWitnessesList: ['0'],
        errors: {
          'languageRefData-languageManualEntry': {
            key: 'languageRefData-languageManualEntry',
            text: 'Please select the language you need to request',
            href: '#languageRefData'
          }
        },
        errorList: [
          {
            key: 'languageRefData-languageManualEntry',
            text: 'Please select the language you need to request',
            href: '#languageRefData'
          }
        ]
      });
    });
  });

  describe('AdditionalLanguage', () => {

    it('getAdditionalLanguage should getAdditionalLanguage.njk', () => {
      getAdditionalLanguage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/language-details.njk', {
        items: isoLanguages,
        previousPage: previousPage,
        summaryList: [{ 'summaryRows': [], 'title': 'Languages' }],
        languageAction: '/hearing-language-details'
      });
    });

    it('should redirect to overview page if save for later and not validation required', async () => {
      req.body.language = '';
      req.body.saveForLater = 'saveForLater';
      await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should show validation error if no option is selected post additional language', async () => {
      req.body.language = '';

      await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('hearing-requirements/language-details.njk', {
        items: isoLanguages,
        error: { language: { key: 'language', text: 'Select language and add dialect', href: '#language' } },
        errorList: [{ key: 'language', text: 'Select language and add dialect', href: '#language' }],
        previousPage: previousPage,
        summaryList: [{ 'summaryRows': [], 'title': 'Languages' }],
        languageAction: '/hearing-language-details'
      });
    });

  });

  describe('Remove additional language', () => {

    it('should remove language from session and redirect', async () => {
      req.query = { name: 'Afar' };
      req.session.appeal.hearingRequirements.interpreterLanguages = [{ language: 'Afar', languageDialect: '' }];
      await removeLanguagePostAction()(req as Request, res as Response, next);
      expect(req.session.appeal.hearingRequirements.interpreterLanguages).to.not.contain({ language: 'Afar', languageDialect: '' });
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetails);
    });

  });

  describe('addMoreLanguagePostAction', () => {

    it('should fail validation and render template with errors', async () => {
      req.session.appeal.hearingRequirements.interpreterLanguages = [];
      await addMoreLanguagePostAction()(req as Request, res as Response, next);

      const expectedArgs = {
        items: isoLanguages,
        error: {
          language: {
            key: 'language',
            text: '"language" is required',
            href: '#language'
          }
        },
        errorList: [
          {
            key: 'language',
            text: '"language" is required',
            href: '#language'
          }
        ],
        previousPage: previousPage,
        summaryList: [{ summaryRows: [], title: 'Languages' }],
        languageAction: '/hearing-language-details'
      };
      expect(res.render).to.have.been.calledWith('hearing-requirements/language-details.njk', expectedArgs);

    });

    it('should fail validation and render template with dialect errors', async () => {
      req.body.language = 'language';
      req.session.appeal.hearingRequirements.interpreterLanguages = [];
      await addMoreLanguagePostAction()(req as Request, res as Response, next);

      const expectedArgs = {
        items: isoLanguages,
        error: {
          dialect: {
            key: 'dialect',
            text: '"dialect" is required',
            href: '#dialect'
          }
        },
        errorList: [
          {
            key: 'dialect',
            text: '"dialect" is required',
            href: '#dialect'
          }
        ],
        previousPage: previousPage,
        summaryList: [{ summaryRows: [], title: 'Languages' }],
        languageAction: '/hearing-language-details'
      };
      expect(res.render).to.have.been.calledWith('hearing-requirements/language-details.njk', expectedArgs);

    });

    it('should add language in session and redirect to names page', async () => {
      req.body['language'] = 'Afar';
      req.body['dialect'] = 'af';
      req.session.appeal.hearingRequirements.interpreterLanguages = [];
      await addMoreLanguagePostAction()(req as Request, res as Response, next);
      expect(req.session.appeal.hearingRequirements.interpreterLanguages).to.have.lengthOf(1);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingLanguageDetails);
    });

  });

  describe('StepFreeAccessPage', () => {

    it('getStepFreeAccessPage should render getStepFreeAccessPage', () => {
      getStepFreeAccessPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: previousPage,
        formAction: '/hearing-step-free-access',
        pageTitle: 'Will you or any witnesses need step-free access?',
        question: {
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Will you or any witnesses need step-free access?',
          hint: 'If you or any witnesses are in a wheelchair or have any other mobility issues, we will provide step-free access at the hearing.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('postStepFreeAccessPage should show validation error if no option is selected', async () => {
      req.body.answer = '';
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = null;
      await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
        errorList: [{ key: 'answer', text: '"answer" is not allowed to be empty', href: '#answer' }],
        error: { 'answer': { key: 'answer', text: '"answer" is not allowed to be empty', href: '#answer' } },
        previousPage: previousPage,
        formAction: '/hearing-step-free-access',
        pageTitle: 'Will you or any witnesses need step-free access?',
        question: {
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Will you or any witnesses need step-free access?',
          hint: 'If you or any witnesses are in a wheelchair or have any other mobility issues, we will provide step-free access at the hearing.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('postStepFreeAccessPage should redirect to overview page if save for later and not validation required', async () => {
      req.body.saveForLater = 'saveForLater';
      await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

  });

  describe('HearingLoop', () => {

    it('getHearingLoop should render get-hearing-loop.njk with no option loaded', () => {
      req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = null;
      getHearingLoopPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: previousPage,
        formAction: '/hearing-hearing-loop',
        pageTitle: 'Will you or any witnesses need a hearing loop?',
        question: {
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Will you or any witnesses need a hearing loop?',
          hint: 'A hearing loop is a sound system designed to help people who use hearing aids.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('postHearingLoopPage should show validation error if no option is selected', async () => {
      req.body.answer = '';
      req.session.appeal.hearingRequirements.isHearingLoopNeeded = null;
      await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', {
        errorList: [{ href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' }],
        error: { 'answer': { href: '#answer', key: 'answer', text: '"answer" is not allowed to be empty' } },
        previousPage: previousPage,
        formAction: '/hearing-hearing-loop',
        pageTitle: 'Will you or any witnesses need a hearing loop?',
        question: {
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses need a hearing loop?',
          hint: 'A hearing loop is a sound system designed to help people who use hearing aids.',
          name: 'answer'
        },
        saveAndContinue: true
      });
    });

    it('should redirect to overview page if save for later and not validation required', async () => {
      req.body.answer = '';
      req.body.saveForLater = 'saveForLater';
      await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

  });

  describe('exception scenarios for controllers', () => {

    it('getAccessNeeds should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAccessNeeds(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getStepFreeAccessPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getStepFreeAccessPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getNeedInterpreterPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getNeedInterpreterPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getAdditionalLanguage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAdditionalLanguage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('postStepFreeAccessPage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postStepFreeAccessPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('postNeedInterpreterPage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postNeedInterpreterPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('postHearingLoopPage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postHearingLoopPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('postAdditionalLanguage should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postAdditionalLanguage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getHearingLoopPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getHearingLoopPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
