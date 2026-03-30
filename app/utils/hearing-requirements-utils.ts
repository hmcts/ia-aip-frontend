import { NextFunction, Request, Response } from 'express';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import RefDataService from '../service/ref-data-service';

function convertDynamicListToSelectItemList(obj: DynamicList) {
  type SelectItem = {
    text: string,
    value: string,
    selected?: boolean
  };
  if (obj?.list_items) {
    const selectItemList: SelectItem[] = obj.list_items.map(language => {
      return {
        text: language.label,
        value: language.code,
        selected: (obj.value && obj.value.code === language.code)
      };
    });
    selectItemList.unshift({ text: 'Select language', value: '' });
    return selectItemList;
  }
  return [];
}

function convertCommonRefDataToValueList(commonRefData: any): DynamicList {
  type RefDataObject = {
    'active_flag': string,
    'key': string,
    'value_en': string
  }
  let valueList: Value[] = undefined;
  if (commonRefData) {
    const commonRefDataObject = JSON.parse(commonRefData);
    valueList = commonRefDataObject['list_of_values']
      .filter((obj: RefDataObject) => obj.active_flag === 'Y')
      .map((obj: RefDataObject) => {
        return { label: obj.value_en, code: obj.key };
      });
  }
  return { value: null, list_items: valueList };
}

async function retrieveInterpreterDynamicListByDataType(refDataServiceObj: RefDataService, req: Request, dataType: string): Promise<DynamicList> {
  const data = await refDataServiceObj.getCommonRefData(req, dataType);
  return convertCommonRefDataToValueList(data);
}

function preparePostInterpreterLanguageSubmissionObj(req: Request, languageList: DynamicList): InterpreterLanguageRefData {
  const interpreterSpokenOrSignLanguage: InterpreterLanguageRefData = {};
  if (req.body.languageRefData) {
    const value: Value = languageList.list_items.find(item => item.code === req.body.languageRefData);
    interpreterSpokenOrSignLanguage.languageRefData = { ...languageList, value: value };
  } else if (req.body?.languageManualEntry === 'Yes') {
    interpreterSpokenOrSignLanguage.languageManualEntry = ['Yes'];
    interpreterSpokenOrSignLanguage.languageManualEntryDescription = req.body?.languageManualEntryDescription;
  }
  return interpreterSpokenOrSignLanguage;
}

function getNlrRadioQuestion(hearingRequirements: HearingRequirements, page: string, next: NextFunction) {
  try {
    const options = [
      { text: 'Yes', value: 'Yes', checked: hearingRequirements[page] == 'Yes' },
      { text: 'No', value: 'No', checked: hearingRequirements[page] == 'No' }
    ];
    return {
      name: 'answer',
      title: i18n.pages.hearingRequirements.nlrNeedsSection[page].title,
      hint: i18n.pages.hearingRequirements.nlrNeedsSection[page].text,
      options: options
    };
  } catch (error) {
    next(error);
  }
}

function nlrRadioRender(req: Request, res: Response, next: NextFunction, page: string, previousPage: string, validation?: ValidationErrors) {
  try {
    const resObject = {
      previousPage,
      pageTitle: i18n.pages.hearingRequirements.nlrNeedsSection[page].title,
      formAction: paths.submitHearingRequirements[page],
      question: getNlrRadioQuestion(req.session.appeal.hearingRequirements, page, next),
      saveAndContinue: true
    };

    if (validation) {
      resObject['errors'] = validation;
      resObject['errorList'] = Object.values(validation);
    }
    return res.render('templates/radio-question-page.njk', resObject);
  } catch (error) {
    next(error);
  }
}


function getInterpreterRenderObject(interpreterLanguageType: InterpreterLanguageRefData,
                                    interpreterSpokenSignLanguageDynamicList: DynamicList,
                                    spokenLanguage: boolean,
                                    previousPage: string,
                                    validation?: ValidationErrors) {
  const source = spokenLanguage ? i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSpokenLanguageSelection
    : i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSignLanguageSelection;

  const renderObject = {
    previousPage: previousPage,
    formAction: spokenLanguage ? paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection
      : paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection,
    pageTitle: source.title,
    pageText: source.text,
    dropdownListText: source.dropdownListText,
    checkBoxText: source.checkBoxText,
    languageManuallyText: source.languageManuallyText,
    languageManualEntry: interpreterLanguageType?.languageManualEntry?.includes('Yes') || false,
    languageManualEntryDescription: interpreterLanguageType?.languageManualEntryDescription || '',
    items: convertDynamicListToSelectItemList(interpreterSpokenSignLanguageDynamicList)
  };
  if (validation) {
    renderObject['errors'] = validation;
    renderObject['errorList'] = Object.values(validation);
  }
  return renderObject;
}

function getStepFreeAccessPreviousPage(req: Request) {
  const category = req.session.appeal?.hearingRequirements?.nlrInterpreterLanguageCategory || [];
  if (category.includes('signLanguageInterpreter')) {
    return paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection;
  }
  if (category.includes('spokenLanguageInterpreter')) {
    return paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection;
  }
  return paths.submitHearingRequirements.isNlrInterpreterRequired;
}

export {
  convertDynamicListToSelectItemList,
  convertCommonRefDataToValueList,
  retrieveInterpreterDynamicListByDataType,
  preparePostInterpreterLanguageSubmissionObj,
  getNlrRadioQuestion,
  nlrRadioRender,
  getInterpreterRenderObject,
  getStepFreeAccessPreviousPage
};
