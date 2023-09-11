import { Request } from 'express';
import moment from 'moment';
import nl2br from 'nl2br';
import * as path from 'path';
import { applicationTypes } from '../data/application-types';
import { APPLICANT_TYPE, FEATURE_FLAGS } from '../data/constants';
import { States } from '../data/states';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';

/**
 * Translate primitive values to Boolean value
 * @param value the primitive value to be translated into a boolean
 */
export function asBooleanValue(value: string | number | boolean | null | undefined): boolean | undefined {
  if (typeof value === 'string') {
    const lowerCasedValue: string = value.toLowerCase();
    if (lowerCasedValue === 'true' || lowerCasedValue === 'yes' || lowerCasedValue === 'on') {
      return true;
    }
    return !!+value;
  }
  return !!value;
}

export function toIsoDate(appealDate: AppealDate) {
  const month = appealDate.month.toString().padStart(2, '0');
  const day = appealDate.day.toString().padStart(2, '0');
  const date = new Date(`${appealDate.year}-${month}-${day}`);
  const isoDate = date.toISOString().split('T')[0];
  return isoDate;
}

export function nowIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export function nowAppealDate(): AppealDate {
  const now = new Date();
  return {
    year: now.getFullYear().toString(10),
    month: (now.getMonth() + 1).toString(10),
    day: now.getDate().toString(10)
  } as AppealDate;
}

export function hasPendingTimeExtension(appeal: Appeal): boolean {
  return !!getAppellantApplications(appeal.makeAnApplications)
    .find(application => (applicationTypes.timeExtension.type === application.value.type) && (application.value.decision === 'Pending'));
}

export function formatTextForCYA(text: string) {
  return nl2br(text.replace(/ /g, '&nbsp;'));
}

export function getRedirectPage(editingMode, editingModeRedirect, saveForLater, defaultRedirect) {
  if (saveForLater) return `${paths.common.overview}?saved`;
  if (editingMode) return editingModeRedirect;
  return defaultRedirect;
}

export function boolToYesNo(value: boolean) {
  return value === true ? 'Yes' : 'No';
}

export function yesNoToBool(answer: string): boolean {
  return answer ? answer.toLowerCase() === 'yes' : false;
}

export function getAppellantApplications(applications: Collection<Application<Evidence>>[]): any[] {
  return (applications || []).filter(app => getApplicant(app.value) === 'Appellant');
}

export function getRespondentApplication(applications: Collection<Application<Evidence>>[]): any[] {
  return (applications || []).filter(app => getApplicant(app.value) === 'Respondent');
}

export function getApplicant(application: Application<Evidence>) {
  return ['Appellant', 'Legal representative'].includes(application.applicant) ? 'Appellant' : application.applicant;
}

export function getApplicationType(type: string): any {
  let applicationType = undefined;
  Object.keys(applicationTypes).forEach(key => {
    if (applicationTypes[key].type === type) {
      applicationType = applicationTypes[key];
    }
  });
  return applicationType;
}

export function getFtpaApplicantType(appeal: Appeal) {
  if (appeal.appealStatus === States.FTPA_DECIDED.id) {
    return appeal.ftpaApplicantType;
  }
  const ftpaRespondentApplicationDate = appeal.ftpaRespondentApplicationDate;
  const ftpaAppellantApplicationDate = appeal.ftpaAppellantApplicationDate;
  let applicantType;

  if (ftpaRespondentApplicationDate && ftpaAppellantApplicationDate) {
    applicantType = (moment(ftpaAppellantApplicationDate).isAfter(ftpaRespondentApplicationDate)
        || moment(ftpaAppellantApplicationDate).isSame(ftpaRespondentApplicationDate))
        ? APPLICANT_TYPE.APPELLANT
        : APPLICANT_TYPE.RESPONDENT;
  } else if (ftpaRespondentApplicationDate) {
    applicantType = APPLICANT_TYPE.RESPONDENT;
  } else if (ftpaAppellantApplicationDate) {
    applicantType = APPLICANT_TYPE.APPELLANT;
  }
  return applicantType;
}

export function formatCaseId(caseId: any) {
  let caseStr = new String(caseId);
  if (caseStr.length === 16) {
    caseStr = caseStr.substring(0,4) + '-' + caseStr.substring(4,8) + '-' + caseStr.substring(8,12) + '-' + caseStr.substring(12,16);
  }
  return caseStr.toString();
}

export async function isFtpaFeatureEnabled(req: Request) {
  const defaultFlag = (process.env.DEFAULT_LAUNCH_DARKLY_FLAG === 'true');
  const isFtpaFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.FTPA, defaultFlag);
  return isFtpaFeatureEnabled;
}

export function isNonStandardDirectionEnabled(req: Request) {
  return req.session.appeal.nonStandardDirectionEnabled;
}

export function isReadonlyApplicationEnabled(req: Request) {
  return req.session.appeal.readonlyApplicationEnabled;
}

export function formatWitnessName(witnessName: WitnessName) {
  const givenNames = witnessName.witnessGivenNames;
  const familyName = witnessName.witnessFamilyName;
  return familyName ? givenNames + ' ' + familyName : givenNames;
}

export function getWitnessComponent(hearingRequirements: HearingRequirements, witnessIndex: string): WitnessComponent {
  let WitnessComponent: WitnessComponent = null;

  if (hearingRequirements && witnessIndex) {
    let witnessString = 'witness' + (parseInt(witnessIndex, 10) + 1);
    let witness: WitnessDetails = hearingRequirements && hearingRequirements[witnessString] || null;

    let witnessListElementString = 'witnessListElement' + (parseInt(witnessIndex, 10) + 1);
    let witnessListElement: DynamicMultiSelectList = hearingRequirements && hearingRequirements[witnessListElementString] || null;

    let witnessInterpreterLanguageCategoryString = 'witness' + (parseInt(witnessIndex, 10) + 1) + 'InterpreterLanguageCategory';
    let witnessInterpreterLanguageCategory = hearingRequirements && hearingRequirements[witnessInterpreterLanguageCategoryString] || null;

    let witnessInterpreterSpokenLanguageString = 'witness' + (parseInt(witnessIndex, 10) + 1) + 'InterpreterSpokenLanguage';
    let witnessInterpreterSpokenLanguage = hearingRequirements && hearingRequirements[witnessInterpreterSpokenLanguageString] || null;

    let witnessInterpreterSignLanguageString = 'witness' + (parseInt(witnessIndex, 10) + 1) + 'InterpreterSignLanguage';
    let witnessInterpreterSignLanguage = hearingRequirements && hearingRequirements[witnessInterpreterSignLanguageString] || null;

    WitnessComponent = {
      witnessFullName: (witnessListElement && witnessListElement.list_items && witnessListElement.list_items.length > 0) ? witnessListElement.list_items[0].label : '',
      witnessFieldString: witnessString,
      witness: witness,
      witnessListElementFieldString: witnessListElementString,
      witnessListElement: witnessListElement,
      witnessInterpreterLanguageCategoryFieldString: witnessInterpreterLanguageCategoryString,
      witnessInterpreterLanguageCategory: witnessInterpreterLanguageCategory,
      witnessInterpreterSpokenLanguageFieldString: witnessInterpreterSpokenLanguageString,
      witnessInterpreterSpokenLanguage: witnessInterpreterSpokenLanguage,
      witnessInterpreterSignLanguageFieldString: witnessInterpreterSignLanguageString,
      witnessInterpreterSignLanguage: witnessInterpreterSignLanguage,
      witnessNumnber: witnessIndex
    };
  }
  return WitnessComponent;
}

export function clearWitnessCachedData(hearingRequirements: HearingRequirements) {
  for (let index = 0; index < 10; index++) {
    let witnessListElementFieldString = 'witnessListElement' + (index + 1);
    let witnessInterpreterLanguageCategoryFieldString = 'witness' + (index + 1) + 'InterpreterLanguageCategory';
    let witnessInterpreterSpokenLanguageFieldString = 'witness' + (index + 1) + 'InterpreterSpokenLanguage';
    let witnessInterpreterSignLanguageFieldString = 'witness' + (index + 1) + 'InterpreterSignLanguage';

    let witnessListElementObj: DynamicMultiSelectList = hearingRequirements[witnessListElementFieldString];

    if (hearingRequirements.isAnyWitnessInterpreterRequired !== undefined && !hearingRequirements.isAnyWitnessInterpreterRequired) {
      hearingRequirements[witnessListElementFieldString] = null;
      hearingRequirements[witnessInterpreterLanguageCategoryFieldString] = null;
      hearingRequirements[witnessInterpreterSpokenLanguageFieldString] = null;
      hearingRequirements[witnessInterpreterSignLanguageFieldString] = null;

    } else if (witnessListElementObj && witnessListElementObj.value && witnessListElementObj.value.length === 0) {
      hearingRequirements[witnessInterpreterLanguageCategoryFieldString] = null;
      hearingRequirements[witnessInterpreterSpokenLanguageFieldString] = null;
      hearingRequirements[witnessInterpreterSignLanguageFieldString] = null;

    } else if (hearingRequirements[witnessInterpreterLanguageCategoryFieldString] && hearingRequirements[witnessInterpreterLanguageCategoryFieldString] !== undefined) {
      if (!hearingRequirements[witnessInterpreterLanguageCategoryFieldString].includes('spokenLanguageInterpreter')) {
        hearingRequirements[witnessInterpreterSpokenLanguageFieldString] = null;
      }
      if (!hearingRequirements[witnessInterpreterLanguageCategoryFieldString].includes('signLanguageInterpreter')) {
        hearingRequirements[witnessInterpreterSignLanguageFieldString] = null;
      }

    }
  }
}
/**
 * Takes in a fileName and converts it to the correct display format
 * @param fileName the file name e.g Some_file.pdf
 * @return the formatted name as a string e.g Some_File(PDF)
 */
export function fileNameFormatter(fileName: string): string {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const extName = extension.split('.').join('').toUpperCase();
  return `${baseName}(${extName})`;
}

/**
 * Given a file Id, name and base url converts it to a html link.
 * returns a html link using target _blank and noopener noreferrer
 */
export function toHtmlLink(fileId: string, name: string, hrefBase: string): string {
  const formattedFileName = fileNameFormatter(name);
  return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${hrefBase}/${fileId}'>${formattedFileName}</a>`;
}

/**
 * Attempts to find the document store url if found on the documentMap returns the document store file location as a URL
 * @param id the fileId used as a lookup key
 * @param documentMap the document map array.
 */
export function documentIdToDocStoreUrl(id: string, documentMap: DocumentMap[]): string {
  const target: DocumentMap = documentMap.find(e => e.id === id);
  return target ? target.url : null;
}
