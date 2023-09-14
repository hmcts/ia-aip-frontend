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
import { clearWitnessCachedData, formatWitnessName, getWitnessComponent } from '../../utils/utils';
import {
  interpreterLanguageSelectionValidation,
  interpreterLanguagesValidation,
  interpreterSupportSelectionValidation,
  interpreterTypesSelectionValidation,
  selectedRequiredValidation,
  selectedRequiredValidationDialect,
  witenessesInterpreterNeedsValidation
} from '../../utils/validations/fields-validations';
import { postHearingRequirementsYesNoHandler } from './common';

const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
const spokenLanguageInterpreterString = 'spokenLanguageInterpreter';
const signLanguageInterpreterString = 'signLanguageInterpreter';
let interpreterSpokenSignLanguageDynamicList: DynamicList;

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
      link: witnessesOnHearing ? paths.submitHearingRequirements.hearingInterpreterSupportAppellantWitnesses : paths.submitHearingRequirements.hearingInterpreter
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
        clearUnnecessaryInterpreterCachedData(req.session.appeal.hearingRequirements);
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

function getInterpreterSupportAppellantWitnesses(req: Request, res: Response, next: NextFunction) {
  try {
    const { hearingRequirements } = req.session.appeal;
    const isInterpreterServicesNeeded = hearingRequirements && hearingRequirements.isInterpreterServicesNeeded || false;
    const isAnyWitnessInterpreterRequired = hearingRequirements && hearingRequirements.isAnyWitnessInterpreterRequired || false;
    let noInterpreterRequired: boolean = false;

    if (hearingRequirements && hearingRequirements.isInterpreterServicesNeeded !== undefined && hearingRequirements.isAnyWitnessInterpreterRequired !== undefined) {
      noInterpreterRequired = (!hearingRequirements.isInterpreterServicesNeeded && !hearingRequirements.isAnyWitnessInterpreterRequired);
    }

    return res.render('hearing-requirements/interpreter-support-appellant-witnesses.njk', {
      previousPage: previousPage,
      isInterpreterServicesNeeded: isInterpreterServicesNeeded,
      isAnyWitnessInterpreterRequired: isAnyWitnessInterpreterRequired,
      noInterpreterRequired: noInterpreterRequired
    });
  } catch (error) {
    next(error);
  }
}

function postInterpreterSupportAppellantWitnesses(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'selections')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.selections) {
        req.body.selections = '';
      }

      const validation = interpreterSupportSelectionValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/interpreter-support-appellant-witnesses.njk', {
          previousPage: previousPage,
          errorList: Object.values(validation)
        });
      }

      if (req.body.selections) {
        if (req.body.selections.includes('noInterpreterRequired')) {
          req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = !req.body.selections.includes('noInterpreterRequired');
          req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired = !req.body.selections.includes('noInterpreterRequired');
        } else {
          req.session.appeal.hearingRequirements.isInterpreterServicesNeeded = req.body.selections.includes('isInterpreterServicesNeeded');
          req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired = req.body.selections.includes('isAnyWitnessInterpreterRequired');
        }
      }

      clearUnnecessaryInterpreterCachedData(req.session.appeal.hearingRequirements);

      let redirectLink;
      if (req.session.appeal.hearingRequirements) {
        if (req.session.appeal.hearingRequirements.isInterpreterServicesNeeded && req.session.appeal.hearingRequirements.isInterpreterServicesNeeded === true) {
          redirectLink = paths.submitHearingRequirements.hearingInterpreterTypes;
        } else if (req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired && req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired === true) {
          if (req.session.appeal.hearingRequirements.witnessNames && req.session.appeal.hearingRequirements.witnessNames.length === 1) {
            const witnessObj = req.session.appeal.hearingRequirements && req.session.appeal.hearingRequirements.witnessNames[0];

            let witnessName = formatWitnessName(witnessObj);
            let valueList: Value[] = [{ code: witnessName, label: witnessName }];
            req.session.appeal.hearingRequirements['witnessListElement1'] = { value: valueList, list_items: valueList };

            redirectLink = (paths.submitHearingRequirements.hearingInterpreterTypes + '?selectedWitnesses=' + 0);
          } else {
            redirectLink = paths.submitHearingRequirements.hearingWitnessesInterpreterNeeds;
          }
        } else {
          redirectLink = paths.submitHearingRequirements.hearingStepFreeAccess;
        }
      }

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      res.redirect(redirectLink);

    } catch (error) {
      next(error);
    }
  };
}

function getWitnessesInterpreterNeeds(req: Request, res: Response, next: NextFunction) {
  try {
    const { hearingRequirements } = req.session.appeal;
    const witnessNames = hearingRequirements && hearingRequirements.witnessNames || [];

    return res.render('hearing-requirements/witnesses-interpreter-needs.njk', {
      previousPage: previousPage,
      witnessesNameList: convertWitnessListToCheckboxItem(witnessNames, hearingRequirements)
    });
  } catch (error) {
    next(error);
  }
}

function postWitnessesInterpreterNeeds(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'selections')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.selections) {
        req.body.selections = '';
      }

      const validation = witenessesInterpreterNeedsValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/witnesses-interpreter-needs.njk', {
          previousPage: previousPage,
          witnessesNameList: convertWitnessListToCheckboxItem(req.session.appeal.hearingRequirements.witnessNames),
          errorList: Object.values(validation)
        });
      }

      const witnessNames = req.session.appeal.hearingRequirements && req.session.appeal.hearingRequirements.witnessNames || [];
      let selectedWitnessesList = req.body.selections.split(',');

      witnessNames.forEach((witness, index) => {
        let witnessName = formatWitnessName(witness);
        let witnessListElementString = 'witnessListElement' + (index + 1);
        let value: Value[] = [];
        let valueObj: Value = { code: witnessName, label: witnessName };

        for (let selectedWitnessIndex of selectedWitnessesList) {
          if (index === parseInt(selectedWitnessIndex, 10)) {
            value.push(valueObj);
            break;
          }
        }

        req.session.appeal.hearingRequirements[witnessListElementString] = { value: value, list_items: [valueObj] };
      });

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      return res.redirect(paths.submitHearingRequirements.hearingInterpreterTypes + '?selectedWitnesses=' + selectedWitnessesList);

    } catch (error) {
      next(error);
    }
  };
}

function getInterpreterTypePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { hearingRequirements } = req.session.appeal;
    let pageQuestion = '';
    let checkboxHintText = '';
    let interpreterSpokenLanguage: boolean = false;
    let interpreterSignLanguage: boolean = false;
    let selectedWitnessesList = null;

    if (req.query.selectedWitnesses) {

      selectedWitnessesList = req.query.selectedWitnesses.toString().split(',') || [];

      if (selectedWitnessesList && selectedWitnessesList.length > 0) {

        let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, selectedWitnessesList[0]);

        pageQuestion = i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.witnessTitle.replace('{witnessName}', witnessComponent.witnessFullName);
        interpreterSpokenLanguage = witnessComponent.witnessInterpreterLanguageCategory ? witnessComponent.witnessInterpreterLanguageCategory.includes(spokenLanguageInterpreterString) : false;
        interpreterSignLanguage = witnessComponent.witnessInterpreterLanguageCategory ? witnessComponent.witnessInterpreterLanguageCategory.includes(signLanguageInterpreterString) : false;
      }
    } else {
      const appellantInterpreterLanguageCategory = hearingRequirements && hearingRequirements.appellantInterpreterLanguageCategory || null;

      pageQuestion = i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.title;
      checkboxHintText = i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint;
      interpreterSpokenLanguage = appellantInterpreterLanguageCategory ? appellantInterpreterLanguageCategory.includes(spokenLanguageInterpreterString) : false;
      interpreterSignLanguage = appellantInterpreterLanguageCategory ? appellantInterpreterLanguageCategory.includes(signLanguageInterpreterString) : false;
    }

    return res.render('hearing-requirements/interpreter-types.njk', {
      previousPage: previousPage,
      pageQuestion: pageQuestion,
      checkboxHintText: checkboxHintText,
      interpreterSpokenLanguage: interpreterSpokenLanguage,
      interpreterSignLanguage: interpreterSignLanguage,
      selectedWitnessesList: selectedWitnessesList
    });

  } catch (error) {
    next(error);
  }
}

function postInterpreterTypePage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let pageQuestion = '';
      let checkboxHintText = '';
      let selectedWitnessesList = null;

      if (!shouldValidateWhenSaveForLater(req.body, 'selections')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.selections) {
        req.body.selections = '';
      }

      if (req.body.selectedWitnessesList) {
        selectedWitnessesList = req.body.selectedWitnessesList.toString().split(',') || [];
        let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, selectedWitnessesList[0]);
        pageQuestion = i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.witnessTitle.replace('{witnessName}', witnessComponent.witnessFullName);
      } else {
        pageQuestion = i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.title;
        checkboxHintText = i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint;
      }

      const validation = interpreterTypesSelectionValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/interpreter-types.njk', {
          previousPage: previousPage,
          pageQuestion: pageQuestion,
          checkboxHintText: checkboxHintText,
          selectedWitnessesList: selectedWitnessesList,
          errorList: Object.values(validation)
        });
      }

      let interpreterLanguageCategory = [];
      if (req.body.selections.includes(spokenLanguageInterpreterString)) {
        interpreterLanguageCategory.push(spokenLanguageInterpreterString);
      }
      if (req.body.selections.includes(signLanguageInterpreterString)) {
        interpreterLanguageCategory.push(signLanguageInterpreterString);
      }

      let redirectLink = null;
      if (req.body.selectedWitnessesList) {

        selectedWitnessesList = req.body.selectedWitnessesList.toString().split(',') || [];
        let witnessInterpreterLanguageCategoryString = 'witness' + (parseInt(selectedWitnessesList[0], 10) + 1) + 'InterpreterLanguageCategory';

        req.session.appeal.hearingRequirements[witnessInterpreterLanguageCategoryString] = interpreterLanguageCategory;
        if (req.session.appeal.hearingRequirements[witnessInterpreterLanguageCategoryString].includes(spokenLanguageInterpreterString)) {
          redirectLink = paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection + '?selectedWitnesses=' + selectedWitnessesList;
        } else {
          redirectLink = paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection + '?selectedWitnesses=' + selectedWitnessesList;
        }
      } else {

        req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = interpreterLanguageCategory;

        if (req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory.includes(spokenLanguageInterpreterString)) {
          redirectLink = paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection;
        } else {
          redirectLink = paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection;
        }
      }

      clearUnnecessaryInterpreterCachedData(req.session.appeal.hearingRequirements);

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      return res.redirect(redirectLink);

    } catch (error) {
      next(error);
    }
  };
}

function handleGetInterpreterSpokenSignLanguagePage(refDataServiceObj: RefDataService, spokenSignLanguageConfig: SpokenSignLanguageConfig) {

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let selectedWitnessesList = null;
      let pageTitle = '';
      let pageText = '';
      let interpreterSpokenSignLanguageFieldString = '';

      if (req.query.selectedWitnesses) {

        selectedWitnessesList = req.query.selectedWitnesses.toString().split(',') || [];

        if (selectedWitnessesList && selectedWitnessesList.length > 0) {
          let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, selectedWitnessesList[0]);
          pageTitle = spokenSignLanguageConfig.pageTitle.witnessValue.replace('{witnessName}', witnessComponent.witnessFullName);
          interpreterSpokenSignLanguageFieldString = witnessComponent[spokenSignLanguageConfig.interpreterSpokenSignLanguageFieldString.witnessValue];
        }

      } else {
        pageTitle = spokenSignLanguageConfig.pageTitle.appellantValue;
        pageText = spokenSignLanguageConfig.pageText.appellantValue;
        interpreterSpokenSignLanguageFieldString = spokenSignLanguageConfig.interpreterSpokenSignLanguageFieldString.appellantValue;
      }

      interpreterSpokenSignLanguageDynamicList = convertCommonRefDataToValueList(await refDataServiceObj.getCommonRefData(req, spokenSignLanguageConfig.commonRefDataSource));
      return getPrepareInterpreterLanguageType(
        req,
        res,
        interpreterSpokenSignLanguageFieldString,
        interpreterSpokenSignLanguageDynamicList,
        spokenSignLanguageConfig.formAction,
        pageTitle,
        pageText,
        spokenSignLanguageConfig.dropdownListText,
        spokenSignLanguageConfig.checkBoxText,
        spokenSignLanguageConfig.languageManuallyText,
        selectedWitnessesList
      );
    } catch (error) {
      next(error);
    }
  };
}

function getInterpreterSpokenLanguagePage(refDataServiceObj: RefDataService) {

  let spokenLanguageConfig: SpokenSignLanguageConfig = {
    pageTitle: {
      witnessValue: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.witnessTitle,
      appellantValue: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.pageTitle
    },
    pageText: {
      appellantValue: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.text
    },
    interpreterSpokenSignLanguageFieldString: {
      witnessValue: 'witnessInterpreterSpokenLanguageFieldString',
      appellantValue: 'appellantInterpreterSpokenLanguage'
    },
    commonRefDataSource: 'InterpreterLanguage',
    formAction: paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection,
    dropdownListText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.dropdownListText,
    checkBoxText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.checkBoxText,
    languageManuallyText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.languageManuallyText

  };

  return handleGetInterpreterSpokenSignLanguagePage(refDataServiceObj, spokenLanguageConfig);
}

function postInterpreterSpokenLanguagePage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let selectedWitnessesList: string[] = null;
      let pageTitle = '';
      let pageText = '';

      if (!shouldValidateWhenSaveForLater(req.body, 'languageRefData', 'languageManualEntry', 'languageManualEntryDescription')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      checkAndSetReqBodyParameter(req);

      if (req.body.selectedWitnessesList) {
        selectedWitnessesList = req.body.selectedWitnessesList.toString().split(',') || [];
        let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, selectedWitnessesList[0]);
        pageTitle = i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.witnessTitle.replace('{witnessName}', witnessComponent.witnessFullName);
      } else {
        pageTitle = i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.pageTitle;
        pageText = i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.text;
      }

      const validation = interpreterLanguageSelectionValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/interpreter-language-selection.njk', {
          previousPage: previousPage,
          formAction: paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection,
          pageTitle: pageTitle,
          pageText: pageText,
          dropdownListText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.dropdownListText,
          checkBoxText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.checkBoxText,
          languageManuallyText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSpokenLanguageSelection.languageManuallyText,
          items: showSelectedLanguage(req.body.languageRefData, convertDynamicListToSelectItemList(interpreterSpokenSignLanguageDynamicList)),
          languageManualEntry: req.body.languageManualEntry.includes('Yes'),
          languageManualEntryDescription: req.body.languageManualEntryDescription,
          selectedWitnessesList: selectedWitnessesList,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      let interpreterSpokenLanguage = preparePostInterpreterLanguageSubmissionObj(req, interpreterSpokenSignLanguageDynamicList);
      let redirectLink = null;
      if (req.body.selectedWitnessesList) {
        selectedWitnessesList = req.body.selectedWitnessesList.toString().split(',') || [];
        let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, selectedWitnessesList[0]);

        req.session.appeal.hearingRequirements[witnessComponent.witnessInterpreterSpokenLanguageFieldString] = interpreterSpokenLanguage;

        if (req.session.appeal.hearingRequirements[witnessComponent.witnessInterpreterLanguageCategoryFieldString] && req.session.appeal.hearingRequirements[witnessComponent.witnessInterpreterLanguageCategoryFieldString].includes(signLanguageInterpreterString)) {
          redirectLink = paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection + '?selectedWitnesses=' + selectedWitnessesList;
        } else {
          selectedWitnessesList.shift();
          if (selectedWitnessesList && selectedWitnessesList.length > 0) {
            redirectLink = paths.submitHearingRequirements.hearingInterpreterTypes + '?selectedWitnesses=' + selectedWitnessesList;
          } else {
            redirectLink = paths.submitHearingRequirements.hearingStepFreeAccess;
          }
        }
      } else {

        req.session.appeal.hearingRequirements.appellantInterpreterSpokenLanguage = interpreterSpokenLanguage;

        if (req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory && req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory.includes(signLanguageInterpreterString)) {
          redirectLink = paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection;
        } else if (req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired && req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired === true) {
          if (req.session.appeal.hearingRequirements.witnessNames && req.session.appeal.hearingRequirements.witnessNames.length === 1) {
            const witnessObj = req.session.appeal.hearingRequirements && req.session.appeal.hearingRequirements.witnessNames[0];

            let witnessName = formatWitnessName(witnessObj);
            let valueList: Value[] = [{ code: witnessName, label: witnessName }];
            req.session.appeal.hearingRequirements['witnessListElement1'] = { value: valueList, list_items: valueList };

            redirectLink = (paths.submitHearingRequirements.hearingInterpreterTypes + '?selectedWitnesses=' + 0);
          } else {
            redirectLink = paths.submitHearingRequirements.hearingWitnessesInterpreterNeeds;
          }
        } else {
          redirectLink = paths.submitHearingRequirements.hearingStepFreeAccess;
        }
      }

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      return res.redirect(redirectLink);

    } catch (error) {
      next(error);
    }
  };
}

function getInterpreterSignLanguagePage(refDataServiceObj: RefDataService) {

  let signLanguageConfig: SpokenSignLanguageConfig = {
    pageTitle: {
      witnessValue: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.witnessTitle,
      appellantValue: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.pageTitle
    },
    pageText: {
      appellantValue: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.text
    },
    interpreterSpokenSignLanguageFieldString: {
      witnessValue: 'witnessInterpreterSignLanguageFieldString',
      appellantValue: 'appellantInterpreterSignLanguage'
    },
    commonRefDataSource: 'SignLanguage',
    formAction: paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection,
    dropdownListText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.dropdownListText,
    checkBoxText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.checkBoxText,
    languageManuallyText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.languageManuallyText

  };

  return handleGetInterpreterSpokenSignLanguagePage(refDataServiceObj, signLanguageConfig);
}

function postInterpreterSignLanguagePage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let selectedWitnessesList: string[] = null;
      let pageTitle = '';
      let pageText = '';

      if (!shouldValidateWhenSaveForLater(req.body, 'languageRefData', 'languageManualEntry', 'languageManualEntryDescription')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      checkAndSetReqBodyParameter(req);

      if (req.body.selectedWitnessesList) {
        selectedWitnessesList = req.body.selectedWitnessesList.toString().split(',') || [];
        let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, selectedWitnessesList[0]);
        pageTitle = i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.witnessTitle.replace('{witnessName}', witnessComponent.witnessFullName);
      } else {
        pageTitle = i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.pageTitle;
        pageText = i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.text;
      }

      const validation = interpreterLanguageSelectionValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/interpreter-language-selection.njk', {
          previousPage: previousPage,
          formAction: paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection,
          pageTitle: pageTitle,
          pageText: pageText,
          dropdownListText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.dropdownListText,
          checkBoxText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.checkBoxText,
          languageManuallyText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterSignLanguageSelection.languageManuallyText,
          items: showSelectedLanguage(req.body.languageRefData, convertDynamicListToSelectItemList(interpreterSpokenSignLanguageDynamicList)),
          languageManualEntry: req.body.languageManualEntry.includes('Yes'),
          languageManualEntryDescription: req.body.languageManualEntryDescription,
          selectedWitnessesList: selectedWitnessesList,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      let interpreterSignLanguage = preparePostInterpreterLanguageSubmissionObj(req, interpreterSpokenSignLanguageDynamicList);
      let redirectLink = null;
      if (req.body.selectedWitnessesList) {

        selectedWitnessesList = req.body.selectedWitnessesList.toString().split(',') || [];
        let witnessComponent = getWitnessComponent(req.session.appeal.hearingRequirements, selectedWitnessesList[0]);

        req.session.appeal.hearingRequirements[witnessComponent.witnessInterpreterSignLanguageFieldString] = interpreterSignLanguage;

        selectedWitnessesList.shift();
        if (selectedWitnessesList && selectedWitnessesList.length > 0) {
          redirectLink = paths.submitHearingRequirements.hearingInterpreterTypes + '?selectedWitnesses=' + selectedWitnessesList;
        } else {
          redirectLink = paths.submitHearingRequirements.hearingStepFreeAccess;
        }

      } else {

        req.session.appeal.hearingRequirements.appellantInterpreterSignLanguage = interpreterSignLanguage;
        if (req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired && req.session.appeal.hearingRequirements.isAnyWitnessInterpreterRequired === true) {
          if (req.session.appeal.hearingRequirements.witnessNames && req.session.appeal.hearingRequirements.witnessNames.length === 1) {
            const witnessObj = req.session.appeal.hearingRequirements && req.session.appeal.hearingRequirements.witnessNames[0];

            let witnessName = formatWitnessName(witnessObj);
            let valueList: Value[] = [{ code: witnessName, label: witnessName }];
            req.session.appeal.hearingRequirements['witnessListElement1'] = { value: valueList, list_items: valueList };

            redirectLink = (paths.submitHearingRequirements.hearingInterpreterTypes + '?selectedWitnesses=' + 0);
          } else {
            redirectLink = paths.submitHearingRequirements.hearingWitnessesInterpreterNeeds;
          }
        } else {
          redirectLink = paths.submitHearingRequirements.hearingStepFreeAccess;
        }
      }

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      return res.redirect(redirectLink);

    } catch (error) {
      next(error);
    }
  };
}

function convertWitnessListToCheckboxItem(witnessNames: WitnessName[], hearingRequirements?: HearingRequirements): [{ value: any, text: any, checked?: boolean }] {
  let checkboxList = null;
  if (witnessNames && witnessNames.length > 0) {
    checkboxList = [];
    witnessNames.forEach((witness, index) => {
      let witnessListElementString = 'witnessListElement' + (index + 1);
      let witnessName = formatWitnessName(witness);
      let checked: boolean = (hearingRequirements &&
        hearingRequirements[witnessListElementString] &&
        hearingRequirements[witnessListElementString].value &&
        hearingRequirements[witnessListElementString].value.length > 0)
        ? true : false;

      checkboxList.push({ value: index, text: witnessName, checked: checked });
    });
  }
  return checkboxList;
}

function getPrepareInterpreterLanguageType(req: Request, res: Response, languageTypeFieldString: string, languageList: DynamicList,
  formAction, formPageTitle, formPageText, formDropdownListText, formCheckBoxText, formLanguageManuallyText,
  selectedWitnessesList?: string[]) {
  const { hearingRequirements } = req.session.appeal;
  const interpreterLanguageType = hearingRequirements && hearingRequirements[languageTypeFieldString] || null;

  let selectItemLanguageList = convertDynamicListToSelectItemList(languageList);
  let languageManualEntry: boolean = false;
  let languageManualEntryDescription: string = '';
  if (interpreterLanguageType) {
    if (interpreterLanguageType.languageRefData) {
      selectItemLanguageList = convertDynamicListToSelectItemList(interpreterLanguageType.languageRefData);
    } else if (interpreterLanguageType.languageManualEntry) {
      languageManualEntry = interpreterLanguageType.languageManualEntry.includes('Yes');
      languageManualEntryDescription = interpreterLanguageType.languageManualEntryDescription;
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
    items: selectItemLanguageList,
    selectedWitnessesList: selectedWitnessesList
  });
}

function preparePostInterpreterLanguageSubmissionObj(req: Request, languageList: DynamicList): InterpreterLanguageRefData {
  let interpreterSpokenOrSignLanguage: InterpreterLanguageRefData = {};
  if (req.body.languageRefData) {
    interpreterSpokenOrSignLanguage.languageRefData = { ...languageList };
    for (let languageObj of interpreterSpokenOrSignLanguage.languageRefData.list_items) {
      if (req.body.languageRefData === languageObj.code) {
        interpreterSpokenOrSignLanguage.languageRefData.value = languageObj;
        break;
      }
    }
  } else if (req.body.languageManualEntry && req.body.languageManualEntry.includes('Yes')) {
    interpreterSpokenOrSignLanguage.languageManualEntry = ['Yes'];
    interpreterSpokenOrSignLanguage.languageManualEntryDescription = req.body.languageManualEntryDescription;
  }
  return interpreterSpokenOrSignLanguage;
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
    obj.list_items.forEach((language) => {
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

function clearUnnecessaryInterpreterCachedData(hearingRequirements: HearingRequirements) {
  if (hearingRequirements) {
    if (hearingRequirements.isInterpreterServicesNeeded !== undefined && !hearingRequirements.isInterpreterServicesNeeded) {
      hearingRequirements.appellantInterpreterLanguageCategory = null;
      hearingRequirements.appellantInterpreterSpokenLanguage = null;
      hearingRequirements.appellantInterpreterSignLanguage = null;
    } else if (hearingRequirements.appellantInterpreterLanguageCategory !== undefined) {
      if (!hearingRequirements.appellantInterpreterLanguageCategory.includes(signLanguageInterpreterString)) {
        hearingRequirements.appellantInterpreterSignLanguage = null;
      }
      if (!hearingRequirements.appellantInterpreterLanguageCategory.includes(spokenLanguageInterpreterString)) {
        hearingRequirements.appellantInterpreterSpokenLanguage = null;
      }
    }

    clearWitnessCachedData(hearingRequirements);
  }
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

function checkAndSetReqBodyParameter(req: Request) {
  if (!req.body.languageManualEntry) {
    req.body.languageManualEntry = '';
  }

  if (!req.body.languageManualEntryDescription) {
    req.body.languageManualEntryDescription = '';
  }

  if (!req.body.languageRefData) {
    req.body.languageRefData = '';
  }
}

function setupHearingAccessNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService, refDataService: RefDataService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.accessNeeds, middleware, getAccessNeeds);
  router.get(paths.submitHearingRequirements.hearingInterpreterSupportAppellantWitnesses, middleware, getInterpreterSupportAppellantWitnesses);
  router.post(paths.submitHearingRequirements.hearingInterpreterSupportAppellantWitnesses, middleware, postInterpreterSupportAppellantWitnesses(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingInterpreter, middleware, getNeedInterpreterPage);
  router.post(paths.submitHearingRequirements.hearingInterpreter, middleware, postNeedInterpreterPage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingInterpreterTypes, middleware, getInterpreterTypePage);
  router.post(paths.submitHearingRequirements.hearingInterpreterTypes, middleware, postInterpreterTypePage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection, middleware, getInterpreterSpokenLanguagePage(refDataService));
  router.post(paths.submitHearingRequirements.hearingInterpreterSpokenLanguageSelection, middleware, postInterpreterSpokenLanguagePage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection, middleware, getInterpreterSignLanguagePage(refDataService));
  router.post(paths.submitHearingRequirements.hearingInterpreterSignLanguageSelection, middleware, postInterpreterSignLanguagePage(updateAppealService));
  router.get(paths.submitHearingRequirements.hearingWitnessesInterpreterNeeds, middleware, getWitnessesInterpreterNeeds);
  router.post(paths.submitHearingRequirements.hearingWitnessesInterpreterNeeds, middleware, postWitnessesInterpreterNeeds(updateAppealService));
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
  getInterpreterSupportAppellantWitnesses,
  postInterpreterSupportAppellantWitnesses,
  getNeedInterpreterPage,
  postNeedInterpreterPage,
  getInterpreterTypePage,
  postInterpreterTypePage,
  getInterpreterSpokenLanguagePage,
  postInterpreterSpokenLanguagePage,
  getInterpreterSignLanguagePage,
  postInterpreterSignLanguagePage,
  getWitnessesInterpreterNeeds,
  postWitnessesInterpreterNeeds,
  getAdditionalLanguage,
  postAdditionalLanguage,
  addMoreLanguagePostAction,
  removeLanguagePostAction,
  getStepFreeAccessPage,
  postStepFreeAccessPage,
  getHearingLoopPage,
  postHearingLoopPage
};
