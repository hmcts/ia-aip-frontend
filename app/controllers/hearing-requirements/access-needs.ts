import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { isoLanguages } from '../../data/isoLanguages';

import { paths } from '../../paths';
import RefDataService from '../../service/ref-data-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { addSummaryRow } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import {
  interpreterLanguageSelectionValidation,
  interpreterLanguagesValidation,
  interpreterTypesSelectionValidation,
  selectedRequiredValidation,
  selectedRequiredValidationDialect
} from '../../utils/validations/fields-validations';
import { postHearingRequirementsYesNoHandler } from './common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const spokenLanguageInterpreterString = 'spokenLanguageInterpreter';
const signLanguageInterpreterString = 'signLanguageInterpreter';
let refDataServiceObj: RefDataService;
let interpreterSpokenLanguageDynamicList: DynamicList;
let interpreterSignLanguageDynamicList: DynamicList;

function getOptions(selectionPresent, answer) {

  if (selectionPresent == null) {
    return [
      { text: 'Yes', value: 'yes' },
      { text: 'No', value: 'no' }
    ];
  } else {
    return [
      { text: 'Yes', value: 'yes', checked: answer === true },
      { text: 'No', value: 'no', checked: answer === false }
    ];
  }
}

function getAccessNeeds(req: Request, res: Response, next: NextFunction) {
  const { hearingRequirements } = req.session.appeal;
  const witnessesOnHearing = hearingRequirements && hearingRequirements.witnessesOnHearing || false;
  try {
    return res.render('hearing-requirements/access-needs.njk', {
      previousPage: previousPage,
      // To-do: the link should be updated to new screen (Ticket 7506) when the condition is true
      link: witnessesOnHearing ? paths.submitHearingRequirements.taskList : paths.submitHearingRequirements.hearingInterpreter
    });
  } catch (error) {
    next(error);
  }
}

function getNeedInterpreterPage(req: Request, res: Response, next: NextFunction) {
  try {
    const selectionPresent = _.has(req.session.appeal, 'hearingRequirements.isInterpreterServicesNeeded') || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: previousPage,
      formAction: paths.submitHearingRequirements.hearingInterpreter,
      pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: getOptions(selectionPresent, req.session.appeal.hearingRequirements.isInterpreterServicesNeeded),
        title: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.title,
        hint: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.text,
        name: 'answer'
      }
    });
  } catch (error) {
    next(error);
  }
}

function postNeedInterpreterPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.accessNeeds.selectInterpreter;
      const pageContent = {
        previousPage: previousPage,
        formAction: paths.submitHearingRequirements.hearingInterpreter,
        pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.pageTitle,
        question: {
          options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }],
          title: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.title,
          hint: i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.text,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = answer;
        if (!answer) {
          req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = null;
          req.session.appeal.hearingRequirements.appellantInterpreterSpokenLanguage = null;
          req.session.appeal.hearingRequirements.appellantInterpreterSignLanguage = null;
        }
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        if (answer) {
          return res.redirect(paths.submitHearingRequirements.hearingInterpreterTypes);
        } else {
          return res.redirect(paths.submitHearingRequirements.hearingStepFreeAccess);
        }
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function getInterpreterTypePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { hearingRequirements } = req.session.appeal;
    const appellantInterpreterLanguageCategory = hearingRequirements && hearingRequirements.appellantInterpreterLanguageCategory || null;

    return res.render('hearing-requirements/interpreter-types.njk', {
      previousPage: previousPage,
      appellantInterpreterSpokenLanguage: appellantInterpreterLanguageCategory ? appellantInterpreterLanguageCategory.includes(spokenLanguageInterpreterString) : false,
      appellantInterpreterSignLanguage: appellantInterpreterLanguageCategory ? appellantInterpreterLanguageCategory.includes(signLanguageInterpreterString) : false
    });
  } catch (error) {
    next(error);
  }
}

function postInterpreterTypePage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'selections')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.selections) {
        req.body.selections = '';
      }

      const validation = interpreterTypesSelectionValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/interpreter-types.njk', {
          previousPage: previousPage,
          errorList: Object.values(validation)
        });
      }

      let appellantInterpreterLanguageCategory = [];
      if (req.body.selections.includes(spokenLanguageInterpreterString)) {
        appellantInterpreterLanguageCategory.push(spokenLanguageInterpreterString);
      }
      if (req.body.selections.includes(signLanguageInterpreterString)) {
        appellantInterpreterLanguageCategory.push(signLanguageInterpreterString);
      }

      let appeal: Appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          appellantInterpreterLanguageCategory
        }
      };

      // clear the saved CCD data
      if (req.body.selections.includes(spokenLanguageInterpreterString) && !req.body.selections.includes(signLanguageInterpreterString)) {
        appeal.hearingRequirements.appellantInterpreterSignLanguage = null;
      } else if (req.body.selections.includes(signLanguageInterpreterString) && !req.body.selections.includes(spokenLanguageInterpreterString)) {
        appeal.hearingRequirements.appellantInterpreterSpokenLanguage = null;
      }

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      if (appellantInterpreterLanguageCategory.includes(spokenLanguageInterpreterString)) {
        return res.redirect(paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection);
      } else {
        return res.redirect(paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection);
      }

    } catch (error) {
      next(error);
    }
  };
}

async function getInterpreterSpokenLanguagePage(req: Request, res: Response, next: NextFunction) {
  try {
    interpreterSpokenLanguageDynamicList = convertCommonRefDataToValueList(await refDataServiceObj.getCommonRefData(req, 'InterpreterLanguage'));

    return getPrepareInterpreterLanguageType(
      req,
      res,
      'appellantInterpreterSpokenLanguage',
      interpreterSpokenLanguageDynamicList,
      paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.pageTitle,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.text,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.dropdownListText,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.checkBoxText,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.languageManuallyText
    );
  } catch (error) {
    next(error);
  }
}

function postInterpreterSpokenLanguagePage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'languageRefData', 'languageManualEntry', 'languageManualEntryDescription')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.languageManualEntry) {
        req.body.languageManualEntry = '';
      }

      if (!req.body.languageManualEntryDescription) {
        req.body.languageManualEntryDescription = '';
      }

      if (!req.body.languageRefData) {
        req.body.languageRefData = '';
      }

      const validation = interpreterLanguageSelectionValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/interpreter-language-selection.njk', {
          previousPage: previousPage,
          formAction: paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection,
          pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.pageTitle,
          pageText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.text,
          dropdownListText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.dropdownListText,
          checkBoxText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.checkBoxText,
          languageManuallyText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.languageManuallyText,
          items: showSelectedLanguage(req.body.languageRefData, convertDynamicListToSelectItemList(interpreterSpokenLanguageDynamicList)),
          languageManualEntry: req.body.languageManualEntry.includes('Yes'),
          languageManualEntryDescription: req.body.languageManualEntryDescription,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      let appellantInterpreterSpokenLanguage = preparePostInterpreterLanguageSubmissionObj(req, interpreterSpokenLanguageDynamicList);
      const appeal: Appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          appellantInterpreterSpokenLanguage
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      if (req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory && req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory.includes(signLanguageInterpreterString)) {
        return res.redirect(paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection);
      } else {
        return res.redirect(paths.submitHearingRequirements.hearingStepFreeAccess);
      }

    } catch (error) {
      next(error);
    }
  };
}

async function getInterpreterSignLanguagePage(req: Request, res: Response, next: NextFunction) {
  try {
    interpreterSignLanguageDynamicList = convertCommonRefDataToValueList(await refDataServiceObj.getCommonRefData(req, 'SignLanguage'));
    return getPrepareInterpreterLanguageType(
      req,
      res,
      'appellantInterpreterSignLanguage',
      interpreterSignLanguageDynamicList,
      paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.pageTitle,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.text,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.dropdownListText,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.checkBoxText,
      i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.languageManuallyText
    );
  } catch (error) {
    next(error);
  }
}

function postInterpreterSignLanguagePage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'languageRefData', 'languageManualEntry', 'languageManualEntryDescription')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.languageManualEntry) {
        req.body.languageManualEntry = '';
      }

      if (!req.body.languageManualEntryDescription) {
        req.body.languageManualEntryDescription = '';
      }

      if (!req.body.languageRefData) {
        req.body.languageRefData = '';
      }

      const validation = interpreterLanguageSelectionValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/interpreter-language-selection.njk', {
          previousPage: previousPage,
          formAction: paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection,
          pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.pageTitle,
          pageText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.text,
          dropdownListText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.dropdownListText,
          checkBoxText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.checkBoxText,
          languageManuallyText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.languageManuallyText,
          items: showSelectedLanguage(req.body.languageRefData, convertDynamicListToSelectItemList(interpreterSignLanguageDynamicList)),
          languageManualEntry: req.body.languageManualEntry.includes('Yes'),
          languageManualEntryDescription: req.body.languageManualEntryDescription,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      let appellantInterpreterSignLanguage = preparePostInterpreterLanguageSubmissionObj(req, interpreterSignLanguageDynamicList);
      const appeal: Appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          appellantInterpreterSignLanguage: appellantInterpreterSignLanguage
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      return res.redirect(paths.submitHearingRequirements.hearingStepFreeAccess);

    } catch (error) {
      next(error);
    }
  };
}

function getPrepareInterpreterLanguageType(req: Request, res: Response, languageType: string, languageList: DynamicList,
  formAction, formPageTitle, formPageText, formDropdownListText, formCheckBoxText, formLanguageManuallyText) {
  const { hearingRequirements } = req.session.appeal;
  const appellantInterpreterLanguage = hearingRequirements && hearingRequirements[languageType] || null;

  let selectItemLanguageList = convertDynamicListToSelectItemList(languageList);
  let languageManualEntry: boolean;
  let languageManualEntryDescription: string = '';
  if (appellantInterpreterLanguage) {
    if (appellantInterpreterLanguage.languageRefData) {
      selectItemLanguageList = convertDynamicListToSelectItemList(appellantInterpreterLanguage.languageRefData);
    } else if (appellantInterpreterLanguage.languageManualEntry) {
      languageManualEntry = appellantInterpreterLanguage.languageManualEntry.includes('Yes');
      languageManualEntryDescription = appellantInterpreterLanguage.languageManualEntryDescription;
    }
  }

  return res.render('hearing-requirements/interpreter-language-selection.njk', {
    previousPage: previousPage,
    formAction: formAction,
    pageTitle: formPageTitle,
    pageText: formPageText,
    dropdownListText: formDropdownListText,
    checkBoxText: formCheckBoxText,
    languageManuallyText: formLanguageManuallyText,
    languageManualEntry: languageManualEntry,
    languageManualEntryDescription: languageManualEntryDescription,
    items: selectItemLanguageList
  });
}

function preparePostInterpreterLanguageSubmissionObj(req: Request, languageList: DynamicList): InterpreterLanguageRefData {
  let appellantInterpreterLanguage: InterpreterLanguageRefData = {};
  if (req.body.languageRefData) {
    appellantInterpreterLanguage.languageRefData = { ...languageList };
    for (let languageObj of appellantInterpreterLanguage.languageRefData.list_items) {
      if (req.body.languageRefData === languageObj.code) {
        appellantInterpreterLanguage.languageRefData.value = languageObj;
        break;
      }
    }
  } else if (req.body.languageManualEntry && req.body.languageManualEntry.includes('Yes')) {
    appellantInterpreterLanguage.languageManualEntry = ['Yes'];
    appellantInterpreterLanguage.languageManualEntryDescription = req.body.languageManualEntryDescription;
  }
  return appellantInterpreterLanguage;
}

function showSelectedLanguage(selectedlanguageCode: Object, languageList) {
  let resultList = languageList;
  if (selectedlanguageCode && languageList) {
    resultList = languageList.map((language) => {
      let selected = selectedlanguageCode === language.value;
      return {
        text: language.text,
        value: language.value,
        selected: selected
      };
    });
  }
  return resultList;
}

function convertDynamicListToSelectItemList(obj: DynamicList) {
  let selectItemList = [];
  if (obj && obj.list_items) {
    selectItemList.push({ 'text': 'Select language', value: '' });
    obj.list_items.map((language) => {
      selectItemList.push({ text: language.label, value: language.code, selected: (obj.value && obj.value.code === language.code) });
    });

  }
  return selectItemList;
}

function convertCommonRefDataToValueList(commonRefData: any): DynamicList {
  let vauleList: Value[];
  if (commonRefData) {
    let commonRefDataObject = JSON.parse(commonRefData);
    vauleList = [];
    commonRefDataObject['list_of_values']
      .filter(obj => obj['active_flag'] === 'Y')
      .map(obj => {
        vauleList.push({ label: obj['value_en'], code: obj['key'] });
      });
  }
  return { value: null, list_items: vauleList };
}

function getAdditionalLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    let interpreterLanguages: InterpreterLanguage[] = req.session.appeal.hearingRequirements.interpreterLanguages || [];
    return res.render('hearing-requirements/language-details.njk', {
      previousPage: previousPage,
      items: isoLanguages,
      summaryList: buildLanguageList(interpreterLanguages),
      languageAction: paths.submitHearingRequirements.hearingLanguageDetails
    });
  } catch (error) {
    next(error);
  }
}

function postAdditionalLanguage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      let interpreterLanguages: InterpreterLanguage[] = req.session.appeal.hearingRequirements.interpreterLanguages || [];
      const validation = interpreterLanguagesValidation(interpreterLanguages);
      if (validation) {
        return renderPage(res, validation, interpreterLanguages);
      }

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.submitHearingRequirements.hearingStepFreeAccess);

    } catch (error) {
      next(error);
    }
  };
}

function renderPage(res: Response, validation: ValidationErrors, interpreterLanguages: InterpreterLanguage[]) {

  return res.render('hearing-requirements/language-details.njk', {
    items: isoLanguages,
    error: validation,
    errorList: Object.values(validation),
    previousPage: previousPage,
    summaryList: buildLanguageList(interpreterLanguages),
    languageAction: paths.submitHearingRequirements.hearingLanguageDetails
  });
}

function buildLanguageList(interpreterLanguages: InterpreterLanguage[]): SummaryList[] {
  const languagesSummaryLists: SummaryList[] = [];
  const languageRows: SummaryRow[] = [];
  interpreterLanguages.forEach((interpreterLanguage: InterpreterLanguage) => {
    languageRows.push(
      addSummaryRow(
        'Language',
        [interpreterLanguage.language],
        `${paths.submitHearingRequirements.hearingLanguageDetailsRemove}?name=${encodeURIComponent(interpreterLanguage.language)}`,
        null,
        'Remove'
      )
    );
    languageRows.push(
      addSummaryRow(
        'Dialect',
        [interpreterLanguage.languageDialect]
      )
    );
  });
  languagesSummaryLists.push({
    summaryRows: languageRows,
    title: 'Languages'
  });
  return languagesSummaryLists;
}

function addMoreLanguagePostAction() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      let interpreterLanguages: InterpreterLanguage[] = req.session.appeal.hearingRequirements.interpreterLanguages || [];
      const validation = selectedRequiredValidation(req.body, i18n.validationErrors.hearingRequirements.accessNeeds.addLanguageDialect);
      const validationDialect = selectedRequiredValidationDialect(req.body, i18n.validationErrors.hearingRequirements.accessNeeds.addLanguageDialect);
      const language: string = req.body['language'] as string;
      const dialect: string = req.body['dialect'] as string;

      if (validation) {
        return renderPage(res, validation, interpreterLanguages);
      }

      if (language.length > 0) {
        if (validationDialect) {
          return renderPage(res, validationDialect, interpreterLanguages);
        }
      }

      const interpreterLanguage: InterpreterLanguage = { language: language, languageDialect: dialect };

      interpreterLanguages.push(interpreterLanguage);
      req.session.appeal.hearingRequirements.interpreterLanguages = interpreterLanguages;
      return res.redirect(paths.submitHearingRequirements.hearingLanguageDetails);
    } catch (e) {
      next(e);
    }
  };
}

function removeLanguagePostAction() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      let interpreterLanguages: InterpreterLanguage[] = req.session.appeal.hearingRequirements.interpreterLanguages || [];
      const nameToRemove: string = req.query.name as string;
      req.session.appeal.hearingRequirements.interpreterLanguages = interpreterLanguages.filter(interpreterLanguage => interpreterLanguage.language !== nameToRemove);
      return res.redirect(paths.submitHearingRequirements.hearingLanguageDetails);
    } catch (e) {
      next(e);
    }
  };
}

function getStepFreeAccessPage(req: Request, res: Response, next: NextFunction) {
  try {
    const selectionPresent = _.has(req.session.appeal, 'hearingRequirements.isHearingRoomNeeded') || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: previousPage,
      formAction: paths.submitHearingRequirements.hearingStepFreeAccess,
      pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.pageTitle,
      question: {
        options: getOptions(selectionPresent, req.session.appeal.hearingRequirements.isHearingLoopNeeded),
        title: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.title,
        hint: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.text,
        name: 'answer'
      },
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postStepFreeAccessPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.accessNeeds.stepFreeAccess;
      const pageContent = {
        previousPage: previousPage,
        formAction: paths.submitHearingRequirements.hearingStepFreeAccess,
        pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.pageTitle,
        question: {
          options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }],
          title: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.title,
          hint: i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.text,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.hearingRequirements.isHearingRoomNeeded = answer;
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.submitHearingRequirements.hearingLoop);
      };
      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function getHearingLoopPage(req: Request, res: Response, next: NextFunction) {
  try {
    const selectionPresent = _.has(req.session.appeal, 'hearingRequirements.isHearingLoopNeeded') || null;
    return res.render('templates/radio-question-page.njk', {
      previousPage: previousPage,
      formAction: paths.submitHearingRequirements.hearingLoop,
      pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.pageTitle,
      saveAndContinue: true,
      question: {
        options: getOptions(selectionPresent, req.session.appeal.hearingRequirements.isHearingLoopNeeded),
        title: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.title,
        hint: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.text,
        name: 'answer'
      }
    });
  } catch (error) {
    next(error);
  }
}

function postHearingLoopPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const selectionPresent = _.has(req.session.appeal, 'hearingRequirements.isHearingLoopNeeded') || null;
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.accessNeeds.hearingLoop;
      const pageContent = {
        previousPage: previousPage,
        formAction: paths.submitHearingRequirements.hearingLoop,
        pageTitle: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.pageTitle,
        question: {
          options: getOptions(selectionPresent, req.session.appeal.hearingRequirements.isHearingLoopNeeded),
          title: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.title,
          hint: i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.text,
          name: 'answer'
        },
        saveAndContinue: true
      };

      const onSuccess = async (answer: boolean) => {
        req.session.appeal.hearingRequirements.isHearingLoopNeeded = answer;
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.submitHearingRequirements.taskList);
      };

      return postHearingRequirementsYesNoHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function setupHearingAccessNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService, refDataService?: RefDataService): Router {
  refDataServiceObj = refDataService;
  const router = Router();
  router.get(paths.submitHearingRequirements.accessNeeds, middleware, getAccessNeeds);
  router.get(paths.submitHearingRequirements.hearingInterpreter, middleware, getNeedInterpreterPage);
  router.post(paths.submitHearingRequirements.hearingInterpreter, middleware, postNeedInterpreterPage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingInterpreterTypes, middleware, getInterpreterTypePage);
  router.post(paths.submitHearingRequirements.hearingInterpreterTypes, middleware, postInterpreterTypePage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection, middleware, getInterpreterSpokenLanguagePage);
  router.post(paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection, middleware, postInterpreterSpokenLanguagePage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection, middleware, getInterpreterSignLanguagePage);
  router.post(paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection, middleware, postInterpreterSignLanguagePage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingLanguageDetails, middleware, getAdditionalLanguage);
  router.post(paths.submitHearingRequirements.hearingLanguageDetails, middleware, postAdditionalLanguage(updateAppealService));
  router.post(paths.submitHearingRequirements.hearingLanguageDetailsAdd, middleware, addMoreLanguagePostAction());
  router.get(paths.submitHearingRequirements.hearingLanguageDetailsRemove, middleware, removeLanguagePostAction());
  router.get(paths.submitHearingRequirements.hearingStepFreeAccess, middleware, getStepFreeAccessPage);
  router.post(paths.submitHearingRequirements.hearingStepFreeAccess, middleware, postStepFreeAccessPage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingLoop, middleware, getHearingLoopPage);
  router.post(paths.submitHearingRequirements.hearingLoop, middleware, postHearingLoopPage(updateAppealService));

  return router;
}

export {
  setupHearingAccessNeedsController,
  getAccessNeeds,
  getNeedInterpreterPage,
  postNeedInterpreterPage,
  getInterpreterTypePage,
  getAdditionalLanguage,
  postAdditionalLanguage,
  addMoreLanguagePostAction,
  removeLanguagePostAction,
  getStepFreeAccessPage,
  postStepFreeAccessPage,
  getHearingLoopPage,
  postHearingLoopPage
};
