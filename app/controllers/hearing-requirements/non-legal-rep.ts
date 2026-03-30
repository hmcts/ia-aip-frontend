import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';

import { paths } from '../../paths';
import RefDataService from '../../service/ref-data-service';
import UpdateAppealService from '../../service/update-appeal-service';
import * as HearingUtils from '../../utils/hearing-requirements-utils';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import {
  interpreterLanguageSelectionValidation,
  interpreterTypesSelectionValidation,
  yesOrNoRequiredValidation
} from '../../utils/validations/fields-validations';

const spokenLanguageInterpreterString = 'spokenLanguageInterpreter';
  const signLanguageInterpreterString = 'signLanguageInterpreter';
const commonRefDataSpokenLanguageDataType = 'InterpreterLanguage';
const commonRefDataSignLanguageDataType = 'SignLanguage';

function getNlrAttending(req: Request, res: Response, next: NextFunction) {
  try {
    return HearingUtils.nlrRadioRender(req, res, next, 'nlrAttending', paths.submitHearingRequirements.taskList);
  } catch (e) {
    next(e);
  }
}

function postNlrAttending(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.hearingRequirements.nlrNeedsSection.nlrAttendingRequired);
      if (validation) {
        return HearingUtils.nlrRadioRender(req, res, next, 'nlrAttending', paths.submitHearingRequirements.taskList, validation);
      }
      const selectedValue = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          nlrAttending: selectedValue
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...appeal,
        ...appealUpdated
      };
      return res.redirect(selectedValue == 'Yes' ? paths.submitHearingRequirements.taskList : paths.submitHearingRequirements.nlrOutsideUK);
    } catch (e) {
      next(e);
    }
  };
}

function getNlrOutsideUK(req: Request, res: Response, next: NextFunction) {
  try {
    return HearingUtils.nlrRadioRender(req, res, next, 'nlrOutsideUK', paths.submitHearingRequirements.nlrAttending);
  } catch (e) {
    next(e);
  }
}

function postNlrOutsideUK(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.hearingRequirements.nlrNeedsSection.nlrOutsideUKRequired);
      if (validation) {
        return HearingUtils.nlrRadioRender(req, res, next, 'nlrOutsideUK', paths.submitHearingRequirements.nlrAttending, validation);
      }

      const selectedValue = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          nlrOutsideUK: selectedValue
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...appeal,
        ...appealUpdated
      };
      return res.redirect(paths.submitHearingRequirements.taskList);
    } catch (e) {
      next(e);
    }
  };
}

function getNlrNeeds(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('hearing-requirements/nlr-needs.njk', {
      previousPage: paths.submitHearingRequirements.taskList
    });
  } catch (error) {
    next(error);
  }
}

function getIsNlrInterpreterRequiredPage(req: Request, res: Response, next: NextFunction) {
  try {
    return HearingUtils.nlrRadioRender(req, res, next, 'isNlrInterpreterRequired', paths.submitHearingRequirements.nlrNeeds);
  } catch (e) {
    next(e);
  }
}

function postIsNlrInterpreterRequiredPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.hearingRequirements.nlrNeedsSection.isNlrInterpreterRequiredRequired);
      if (validation) {
        return HearingUtils.nlrRadioRender(req, res, next, 'isNlrInterpreterRequired', paths.submitHearingRequirements.nlrNeeds, validation);
      }

      const selectedValue = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          isNlrInterpreterRequired: selectedValue
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...appeal,
        ...appealUpdated
      };

      return res.redirect(selectedValue === 'Yes' ? paths.submitHearingRequirements.nlrHearingInterpreterTypes
        : paths.submitHearingRequirements.nlrNeedsHearingLoop);
    } catch (e) {
      next(e);
    }
  };
}

function getNlrInterpreterTypePage(req: Request, res: Response, next: NextFunction) {
  try {
    const nlrInterpreterLanguageCategory: string[] = req.session.appeal?.hearingRequirements?.nlrInterpreterLanguageCategory || [];

    return res.render('hearing-requirements/interpreter-types.njk', {
      previousPage: paths.submitHearingRequirements.isNlrInterpreterRequired,
      formAction: paths.submitHearingRequirements.nlrHearingInterpreterTypes,
      pageQuestion: i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title,
      checkboxHintText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint,
      interpreterSpokenLanguage: nlrInterpreterLanguageCategory.includes(spokenLanguageInterpreterString),
      interpreterSignLanguage: nlrInterpreterLanguageCategory.includes(signLanguageInterpreterString)
    });

  } catch (error) {
    next(error);
  }
}

function postNlrInterpreterTypePage(updateAppealService: UpdateAppealService) {
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
        const nlrInterpreterLanguageCategory: string[] = req.session.appeal?.hearingRequirements?.nlrInterpreterLanguageCategory || [];

        return res.render('hearing-requirements/interpreter-types.njk', {
          previousPage: paths.submitHearingRequirements.isNlrInterpreterRequired,
          formAction: paths.submitHearingRequirements.nlrHearingInterpreterTypes,
          pageQuestion: i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title,
          checkboxHintText: i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.hint,
          interpreterSpokenLanguage: nlrInterpreterLanguageCategory.includes(spokenLanguageInterpreterString),
          interpreterSignLanguage: nlrInterpreterLanguageCategory.includes(signLanguageInterpreterString),
          errorList: Object.values(validation)
        });
      }

      const interpreterLanguageCategory = req.body.selections.split(',');

      const appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          nlrInterpreterLanguageCategory: interpreterLanguageCategory
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...appeal,
        ...appealUpdated
      };

      const redirectLink = interpreterLanguageCategory.includes(spokenLanguageInterpreterString)
        ? paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection
        : paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection;
      return res.redirect(redirectLink);
    } catch (error) {
      next(error);
    }
  };
}

function getNlrHearingInterpreterSpokenLanguageSelection(refDataServiceObj: RefDataService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const interpreterLanguageType: InterpreterLanguageRefData = req.session.appeal?.hearingRequirements?.nlrInterpreterSpokenLanguage;
      const interpreterSpokenSignLanguageDynamicList: DynamicList = interpreterLanguageType?.languageRefData ||
        await HearingUtils.retrieveInterpreterDynamicListByDataType(refDataServiceObj, req, commonRefDataSpokenLanguageDataType);
      return res.render('hearing-requirements/interpreter-language-selection.njk',
        HearingUtils.getInterpreterRenderObject(interpreterLanguageType, interpreterSpokenSignLanguageDynamicList, true,
          paths.submitHearingRequirements.nlrHearingInterpreterTypes));
    } catch (error) {
      next(error);
    }
  };
}

function postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService: UpdateAppealService, refDataServiceObj: RefDataService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'languageRefData', 'languageManualEntry', 'languageManualEntryDescription')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const interpreterLanguageType: InterpreterLanguageRefData = req.session.appeal?.hearingRequirements?.nlrInterpreterSpokenLanguage;
      const interpreterSpokenSignLanguageDynamicList = interpreterLanguageType?.languageRefData ||
        await HearingUtils.retrieveInterpreterDynamicListByDataType(refDataServiceObj, req, commonRefDataSpokenLanguageDataType);
      const validation = interpreterLanguageSelectionValidation(req.body);
      if (validation) {
        return res.render('hearing-requirements/interpreter-language-selection.njk',
          HearingUtils.getInterpreterRenderObject(interpreterLanguageType, interpreterSpokenSignLanguageDynamicList, true,
            paths.submitHearingRequirements.nlrHearingInterpreterTypes, validation));
      }

      const appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          nlrInterpreterSpokenLanguage: HearingUtils.preparePostInterpreterLanguageSubmissionObj(req, interpreterSpokenSignLanguageDynamicList)
        }
      };
      const category = appeal.hearingRequirements?.nlrInterpreterLanguageCategory || [];
      const redirectLink = category.includes(signLanguageInterpreterString)
        ? paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection
        : paths.submitHearingRequirements.nlrNeedsStepFreeAccess;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...appeal,
        ...appealUpdated
      };
      return res.redirect(redirectLink);

    } catch (error) {
      next(error);
    }
  };
}

function getNlrHearingInterpreterSignLanguageSelection(refDataServiceObj: RefDataService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const interpreterLanguageType: InterpreterLanguageRefData = req.session.appeal?.hearingRequirements?.nlrInterpreterSignLanguage;
      const interpreterSpokenSignLanguageDynamicList: DynamicList = interpreterLanguageType?.languageRefData ||
        await HearingUtils.retrieveInterpreterDynamicListByDataType(refDataServiceObj, req, commonRefDataSignLanguageDataType);
      const category = req.session.appeal?.hearingRequirements?.nlrInterpreterLanguageCategory || [];
      const previousPage = category.includes(spokenLanguageInterpreterString) ? paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection
        : paths.submitHearingRequirements.nlrHearingInterpreterTypes;
      return res.render('hearing-requirements/interpreter-language-selection.njk',
        HearingUtils.getInterpreterRenderObject(interpreterLanguageType, interpreterSpokenSignLanguageDynamicList, false, previousPage));
    } catch (error) {
      next(error);
    }
  };
}

function postNlrHearingInterpreterSignLanguageSelection(updateAppealService: UpdateAppealService, refDataServiceObj: RefDataService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'languageRefData', 'languageManualEntry', 'languageManualEntryDescription')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const interpreterLanguageType: InterpreterLanguageRefData = req.session.appeal?.hearingRequirements?.nlrInterpreterSignLanguage;
      const interpreterSpokenSignLanguageDynamicList = interpreterLanguageType?.languageRefData ||
        await HearingUtils.retrieveInterpreterDynamicListByDataType(refDataServiceObj, req, commonRefDataSignLanguageDataType);
      const validation = interpreterLanguageSelectionValidation(req.body);
      if (validation) {
        const category = req.session.appeal?.hearingRequirements?.nlrInterpreterLanguageCategory || [];
        const previousPage = category.includes(spokenLanguageInterpreterString) ? paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection
          : paths.submitHearingRequirements.nlrHearingInterpreterTypes;
        return res.render('hearing-requirements/interpreter-language-selection.njk',
          HearingUtils.getInterpreterRenderObject(interpreterLanguageType, interpreterSpokenSignLanguageDynamicList, false, previousPage, validation));
      }

      const appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          nlrInterpreterSignLanguage: HearingUtils.preparePostInterpreterLanguageSubmissionObj(req, interpreterSpokenSignLanguageDynamicList)
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...appeal,
        ...appealUpdated
      };
      return res.redirect(paths.submitHearingRequirements.nlrNeedsStepFreeAccess);

    } catch (error) {
      next(error);
    }
  };
}

function getNlrNeedStepFreeAccess(req: Request, res: Response, next: NextFunction) {
  try {
    return HearingUtils.nlrRadioRender(req, res, next, 'nlrNeedsStepFreeAccess', HearingUtils.getStepFreeAccessPreviousPage(req));
  } catch (e) {
    next(e);
  }
}

function postNlrNeedStepFreeAccess(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.hearingRequirements.nlrNeedsSection.nlrNeedsStepFreeAccessRequired);
      if (validation) {
        return HearingUtils.nlrRadioRender(req, res, next, 'nlrNeedsStepFreeAccess', HearingUtils.getStepFreeAccessPreviousPage(req), validation);
      }

      const selectedValue = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          nlrNeedsStepFreeAccess: selectedValue
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...appeal,
        ...appealUpdated
      };
      return res.redirect(paths.submitHearingRequirements.nlrNeedsHearingLoop);
    } catch (e) {
      next(e);
    }
  };
}

function getNlrNeedHearingLoop(req: Request, res: Response, next: NextFunction) {
  try {
    return HearingUtils.nlrRadioRender(req, res, next, 'nlrNeedsHearingLoop', paths.submitHearingRequirements.nlrNeedsStepFreeAccess);
  } catch (e) {
    next(e);
  }
}

function postNlrNeedHearingLoop(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = yesOrNoRequiredValidation(req.body, i18n.validationErrors.hearingRequirements.nlrNeedsSection.nlrNeedsHearingLoopRequired);
      if (validation) {
        return HearingUtils.nlrRadioRender(req, res, next, 'nlrNeedsHearingLoop', paths.submitHearingRequirements.nlrNeedsStepFreeAccess, validation);
      }

      const selectedValue = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        hearingRequirements: {
          ...req.session.appeal.hearingRequirements,
          nlrNeedsHearingLoop: selectedValue
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...appeal,
        ...appealUpdated
      };
      return res.redirect(paths.submitHearingRequirements.taskList);
    } catch (e) {
      next(e);
    }
  };
}

function setupHearingNonLegalRepNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService, refDataService: RefDataService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.nlrAttending, middleware, getNlrAttending);
  router.post(paths.submitHearingRequirements.nlrAttending, middleware, postNlrAttending(updateAppealService));
  router.get(paths.submitHearingRequirements.nlrOutsideUK, middleware, getNlrOutsideUK);
  router.post(paths.submitHearingRequirements.nlrOutsideUK, middleware, postNlrOutsideUK(updateAppealService));
  router.get(paths.submitHearingRequirements.nlrNeeds, middleware, getNlrNeeds);
  router.get(paths.submitHearingRequirements.isNlrInterpreterRequired, middleware, getIsNlrInterpreterRequiredPage);
  router.post(paths.submitHearingRequirements.isNlrInterpreterRequired, middleware, postIsNlrInterpreterRequiredPage(updateAppealService));
  router.get(paths.submitHearingRequirements.nlrHearingInterpreterTypes, middleware, getNlrInterpreterTypePage);
  router.post(paths.submitHearingRequirements.nlrHearingInterpreterTypes, middleware, postNlrInterpreterTypePage(updateAppealService));
  router.get(paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection, middleware, getNlrHearingInterpreterSpokenLanguageSelection(refDataService));
  router.post(paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection, middleware, postNlrHearingInterpreterSpokenLanguageSelection(updateAppealService, refDataService));
  router.get(paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection, middleware, getNlrHearingInterpreterSignLanguageSelection(refDataService));
  router.post(paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection, middleware, postNlrHearingInterpreterSignLanguageSelection(updateAppealService, refDataService));

  router.get(paths.submitHearingRequirements.nlrNeedsStepFreeAccess, middleware, getNlrNeedStepFreeAccess);
  router.post(paths.submitHearingRequirements.nlrNeedsStepFreeAccess, middleware, postNlrNeedStepFreeAccess(updateAppealService));
  router.get(paths.submitHearingRequirements.nlrNeedsHearingLoop, middleware, getNlrNeedHearingLoop);
  router.post(paths.submitHearingRequirements.nlrNeedsHearingLoop, middleware, postNlrNeedHearingLoop(updateAppealService));
  return router;
}

export {
  setupHearingNonLegalRepNeedsController,
  getNlrAttending,
  postNlrAttending,
  getNlrOutsideUK,
  postNlrOutsideUK,
  getNlrNeeds,
  getIsNlrInterpreterRequiredPage,
  postIsNlrInterpreterRequiredPage,
  getNlrInterpreterTypePage,
  postNlrInterpreterTypePage,
  getNlrHearingInterpreterSpokenLanguageSelection,
  postNlrHearingInterpreterSpokenLanguageSelection,
  getNlrHearingInterpreterSignLanguageSelection,
  postNlrHearingInterpreterSignLanguageSelection,
  getNlrNeedStepFreeAccess,
  postNlrNeedStepFreeAccess,
  getNlrNeedHearingLoop,
  postNlrNeedHearingLoop
};
