import { Request } from 'express';
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

export {
  convertDynamicListToSelectItemList,
  convertCommonRefDataToValueList,
  retrieveInterpreterDynamicListByDataType,
  preparePostInterpreterLanguageSubmissionObj
};
