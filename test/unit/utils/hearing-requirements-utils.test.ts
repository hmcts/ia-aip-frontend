import { Request, Response } from 'express';
import { SinonStub } from 'sinon';
import { paths } from '../../../app/paths';
import RefDataService from '../../../app/service/ref-data-service';
import {
  convertCommonRefDataToValueList,
  convertDynamicListToSelectItemList, getNlrRadioQuestion, nlrRadioRender,
  preparePostInterpreterLanguageSubmissionObj,
  retrieveInterpreterDynamicListByDataType
} from '../../../app/utils/hearing-requirements-utils';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('hearing-requirement-utils', () => {
  describe('convertDynamicListToSelectItemList', () => {
    it('return empty list if no list_items in dynamicList', () => {
      const result = convertDynamicListToSelectItemList({});
      expect(result).to.deep.equal([]);
    });

    it('return list with select language if list_items is empty', () => {
      const result = convertDynamicListToSelectItemList({ list_items: [] });
      expect(result).to.deep.equal([{ text: 'Select language', value: '' }]);
    });

    it('return list with correct mappings', () => {
      const listItems = [
        { label: 'English', code: 'en' },
        { label: 'French', code: 'fr' }
      ];
      const value = { code: 'en' };
      const result = convertDynamicListToSelectItemList({ list_items: listItems, value });
      const expectedList = [
        { text: 'Select language', value: '' },
        { text: 'English', value: 'en', selected: true },
        { text: 'French', value: 'fr', selected: false }
      ];
      expect(result).to.deep.equal(expectedList);
    });
  });

  describe('convertCommonRefDataToValueList', () => {
    it('should return null value undefined list if no commonRefData object', () => {
      const result = convertCommonRefDataToValueList(null);
      expect(result).to.deep.equal({ value: null, list_items: undefined });
    });

    it('should parse, map, filter and return list from commonRefData object correctly', () => {
      const commonRefDataObj = JSON.stringify({
        list_of_values: [
          { active_flag: 'Y', key: 'en', value_en: 'English' },
          { active_flag: 'N', key: 'fr', value_en: 'French' },
          { active_flag: 'Y', key: 'es', value_en: 'Spanish' }
        ]
      });
      const result = convertCommonRefDataToValueList(commonRefDataObj);
      const expectedListItems = [
        { label: 'English', code: 'en' },
        { label: 'Spanish', code: 'es' }
      ];
      expect(result).to.deep.equal({ value: null, list_items: expectedListItems });
    });
  });

  describe('retrieveInterpreterDynamicListByDataType', () => {
    it('should call getCommonRefData from RefDataService', async () => {
      const sandbox = sinon.createSandbox();
      const getCommonRefDataStub = sandbox.stub();
      const refDataServiceObj = {
        getCommonRefData: getCommonRefDataStub
      } as Partial<RefDataService>;
      const req = {} as Request;
      const dataType = 'language';
      await retrieveInterpreterDynamicListByDataType(refDataServiceObj as RefDataService, req, dataType);
      expect(getCommonRefDataStub).calledOnceWith(req, dataType);
      sandbox.restore();
    });
  });

  describe('preparePostInterpreterLanguageSubmissionObj', () => {
    it('set languageRefData if languageRefData in req.body', () => {
      const languageList = {
        list_items: [
          { label: 'English', code: 'en' },
          { label: 'French', code: 'fr' }
        ]
      } as DynamicList;
      const req = {
        body: {
          languageRefData: 'en'
        }
      } as Request;
      const result = preparePostInterpreterLanguageSubmissionObj(req, languageList);
      const expectedValue = { label: 'English', code: 'en' };
      expect(result.languageRefData).to.deep.equal({
        list_items: [
          { label: 'English', code: 'en' },
          { label: 'French', code: 'fr' }
        ], value: expectedValue
      });
      expect(result.languageManualEntry).to.equal(undefined);
      expect(result.languageManualEntryDescription).to.equal(undefined);
    });

    it('set manual fields if languageManualEntry Yes in req.body with no languageManualEntryDescription', () => {
      const req = {
        body: { languageManualEntry: 'Yes' }
      } as Request;
      const result = preparePostInterpreterLanguageSubmissionObj(req, {} as DynamicList);
      expect(result.languageRefData).to.equal(undefined);
      expect(result.languageManualEntry).to.deep.equal(['Yes']);
      expect(result.languageManualEntryDescription).to.equal(undefined);
    });

    it('set manual fields if languageManualEntry Yes in req.body with languageManualEntryDescription', () => {
      const req = {
        body: { languageManualEntry: 'Yes', languageManualEntryDescription: 'Some description' }
      } as Request;
      const result = preparePostInterpreterLanguageSubmissionObj(req, {} as DynamicList);
      expect(result.languageRefData).to.equal(undefined);
      expect(result.languageManualEntry).to.deep.equal(['Yes']);
      expect(result.languageManualEntryDescription).to.equal('Some description');
    });

    it('set no fields if languageManualEntry No in req.body with languageManualEntryDescription', () => {
      const req = {
        body: { languageManualEntry: 'No', languageManualEntryDescription: 'Some description' }
      } as Request;
      const result = preparePostInterpreterLanguageSubmissionObj(req, {} as DynamicList);
      expect(result.languageRefData).to.equal(undefined);
      expect(result.languageManualEntry).to.deep.equal(undefined);
      expect(result.languageManualEntryDescription).to.equal(undefined);
    });

    it('set no fields if empty req.body', () => {
      const req = { body: {} } as Request;
      const result = preparePostInterpreterLanguageSubmissionObj(req, {} as DynamicList);
      expect(result.languageRefData).to.equal(undefined);
      expect(result.languageManualEntry).to.deep.equal(undefined);
      expect(result.languageManualEntryDescription).to.equal(undefined);
    });
  });

  describe('getNlrRadioQuestion', () => {
    let sandbox: sinon.SinonSandbox;
    let hearingRequirements: HearingRequirements;
    let nextStub: SinonStub;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      nextStub = sandbox.stub();
      hearingRequirements = {};
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should catch and next error if bad page', () => {
      getNlrRadioQuestion({}, 'badPage', nextStub);
      const expectedErr = sinon.match.instanceOf(TypeError)
        .and(sinon.match.has('message', 'Cannot read properties of undefined (reading \'title\')'));
      expect(nextStub).to.be.calledWithMatch(sinon.match(expectedErr));
    });

    it('should set checked correctly on valid page for no value', () => {
      const result = getNlrRadioQuestion(hearingRequirements, 'nlrAttending', nextStub);
      expect(nextStub).to.not.be.calledWithMatch(sinon.match.any);
      expect(result.name).to.equal('answer');
      expect(result.title).to.equal(i18n.pages.hearingRequirements.nlrNeedsSection.nlrAttending.title);
      expect(result.hint).to.equal(undefined);
      expect(result.options[0]).to.deep.equal({ text: 'Yes', value: 'Yes', checked: false });
      expect(result.options[1]).to.deep.equal({ text: 'No', value: 'No', checked: false });
    });

    it('should set checked correctly on valid page for Yes value', () => {
      hearingRequirements.nlrOutsideUK = 'Yes';
      const result = getNlrRadioQuestion(hearingRequirements, 'nlrOutsideUK', nextStub);
      expect(nextStub).to.not.be.calledWithMatch(sinon.match.any);
      expect(result.name).to.equal('answer');
      expect(result.title).to.equal(i18n.pages.hearingRequirements.nlrNeedsSection.nlrOutsideUK.title);
      expect(result.hint).to.equal(i18n.pages.hearingRequirements.nlrNeedsSection.nlrOutsideUK.text);
      expect(result.options[0]).to.deep.equal({ text: 'Yes', value: 'Yes', checked: true });
      expect(result.options[1]).to.deep.equal({ text: 'No', value: 'No', checked: false });
    });

    it('should set checked correctly on valid page for No value', () => {
      hearingRequirements.isNlrInterpreterRequired = 'No';
      const result = getNlrRadioQuestion(hearingRequirements, 'isNlrInterpreterRequired', nextStub);
      expect(nextStub).to.not.be.calledWithMatch(sinon.match.any);
      expect(result.name).to.equal('answer');
      expect(result.title).to.equal(i18n.pages.hearingRequirements.nlrNeedsSection.isNlrInterpreterRequired.title);
      expect(result.hint).to.equal(i18n.pages.hearingRequirements.nlrNeedsSection.isNlrInterpreterRequired.text);
      expect(result.options[0]).to.deep.equal({ text: 'Yes', value: 'Yes', checked: false });
      expect(result.options[1]).to.deep.equal({ text: 'No', value: 'No', checked: true });
    });
  });

  describe('nlrRadioRender', () => {
    let sandbox: sinon.SinonSandbox;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let renderStub: SinonStub;
    let nextStub: SinonStub;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      nextStub = sandbox.stub();
      renderStub = sandbox.stub();
      res = { render: renderStub } as Partial<Response>;
      req = { session: { appeal: { hearingRequirements: {} } } } as Partial<Request>;
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should catch and next error if bad page', () => {
      nlrRadioRender({} as Request, {} as Response, nextStub, 'badPage', '');
      const expectedErr = sinon.match.instanceOf(TypeError)
        .and(sinon.match.has('message', 'Cannot read properties of undefined (reading \'title\')'));
      expect(nextStub).to.be.calledWithMatch(sinon.match(expectedErr));
    });

    it('should render with resObject with valid page without validation', () => {
      req.session.appeal.hearingRequirements.nlrAttending = 'Yes';

      nlrRadioRender(req as Request, res as Response, nextStub, 'nlrAttending', 'somePreviousPage');
      expect(nextStub).to.not.be.calledWithMatch(sinon.match.any);
      const resObject = {
        previousPage: 'somePreviousPage',
        pageTitle: i18n.pages.hearingRequirements.nlrNeedsSection.nlrAttending.title,
        formAction: paths.submitHearingRequirements.nlrAttending,
        question: getNlrRadioQuestion(req.session.appeal.hearingRequirements, 'nlrAttending', nextStub),
        saveAndContinue: true
      };
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk', resObject);
    });

    it('should render with resObject with valid page with validation', () => {
      req.session.appeal.hearingRequirements.nlrOutsideUK = 'No';
      const validation = [{ key: 'answer', text: '"answer" is not allowed to be empty', href: '#answer' }];
      nlrRadioRender(req as Request, res as Response, nextStub, 'nlrOutsideUK', 'somePreviousPage', validation as any);
      expect(nextStub).to.not.be.calledWithMatch(sinon.match.any);
      const resObject = {
        previousPage: 'somePreviousPage',
        pageTitle: i18n.pages.hearingRequirements.nlrNeedsSection.nlrOutsideUK.title,
        formAction: paths.submitHearingRequirements.nlrOutsideUK,
        question: getNlrRadioQuestion(req.session.appeal.hearingRequirements, 'nlrOutsideUK', nextStub),
        saveAndContinue: true,
        errors: validation,
        errorList: Object.values(validation)
      };
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk', resObject);
    });
  });
});
