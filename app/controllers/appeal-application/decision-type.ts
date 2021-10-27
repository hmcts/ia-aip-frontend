import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { appealTypes } from '../../data/appeal-types';
import { Events } from '../../data/events';
import { PageSetup } from '../../interfaces/PageSetup';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { decisionTypeValidation } from '../../utils/validations/fields-validations';

function getDecisionTypeQuestion(application: AppealApplication) {
  let hint: string;
  let decision: string;
  if (['revocationOfProtection', 'deprivation'].includes(application.appealType)) {
    hint = i18n.pages.decisionType.hint.withoutFee;
    decision = application.rpDcAppealHearingOption || null;
  } else if (['protection', 'refusalOfHumanRights', 'refusalOfEu'].includes(application.appealType)) {
    hint = i18n.pages.decisionType.hint.withFee;
    decision = application.decisionHearingFeeOption || null;
  }
  const question = {
    title: i18n.pages.decisionType.title,
    hint,
    options: [
      {
        value: i18n.pages.decisionType.options.withHearing.value,
        text: i18n.pages.decisionType.options.withHearing.text,
        checked: decision === i18n.pages.decisionType.options.withHearing.value
      },
      {
        value: i18n.pages.decisionType.options.withoutHearing.value,
        text: i18n.pages.decisionType.options.withoutHearing.text,
        checked: decision === i18n.pages.decisionType.options.withoutHearing.value
      }
    ],
    inline: false
  };
  return question;
}

async function getDecisionType(req: Request, res: Response, next: NextFunction) {
  try {
    const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, 'online-card-payments-feature', false);
    if (!paymentsFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('templates/radio-question-page.njk', {
      previousPage: paths.appealStarted.typeOfAppeal,
      pageTitle: i18n.pages.decisionType.title,
      formAction: paths.appealStarted.decisionType,
      question: getDecisionTypeQuestion(req.session.appeal.application),
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function postDecisionType(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, 'online-card-payments-feature', false);
      if (!paymentsFlag) return res.redirect(paths.common.overview);
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = decisionTypeValidation(req.body);
      const { appealType } = req.session.appeal.application;
      if (validation) {
        return res.render('templates/radio-question-page.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.typeOfAppeal,
          pageTitle: i18n.pages.decisionType.title,
          formAction: paths.appealStarted.decisionType,
          question: getDecisionTypeQuestion(req.session.appeal.application),
          saveAndContinue: true
        });
      }
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          rpDcAppealHearingOption: ['revocationOfProtection', 'deprivation'].includes(appealType) ? req.body['answer'] : '',
          decisionHearingFeeOption: ['protection', 'refusalOfHumanRights', 'refusalOfEu'].includes(appealType) ? req.body['answer'] : ''
        }
      };

      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], paymentsFlag);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      const defaultRedirect = req.session.appeal.application.appealType === 'protection' ? paths.appealStarted.payNow : paths.appealStarted.taskList;
      let redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

@PageSetup.register
class SetupDecisionTypeController {
  initialise(middleware: any[], updateAppealService): Router {
    const router = Router();
    router.get(paths.appealStarted.decisionType, middleware, getDecisionType);
    router.post(paths.appealStarted.decisionType, middleware, postDecisionType(updateAppealService));
    return router;
  }
}

export {
  SetupDecisionTypeController,
  getDecisionType,
  getDecisionTypeQuestion,
  postDecisionType
};
