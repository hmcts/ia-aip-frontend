import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { deportationOrderOptionsValidation } from '../../utils/validations/fields-validations';

function getDeportationOrderOptionsQuestion(appeal: Appeal) {

  const deportationOrderOption = appeal.application.deportationOrderOptions;
  return {
    options: [
      {
        value: i18n.pages.deportationOrder.options.yes.value,
        text: i18n.pages.deportationOrder.options.yes.text,
        checked: deportationOrderOption === i18n.pages.deportationOrder.options.yes.value
      },
      {
        value: i18n.pages.deportationOrder.options.no.value,
        text: i18n.pages.deportationOrder.options.no.text,
        checked: deportationOrderOption === i18n.pages.deportationOrder.options.no.value
      }
    ],
    inline: true
  };
}

async function getDeportationOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const dlrmInternalFeatureFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_INTERNAL_FEATURE_FLAG, false);
    if (!dlrmInternalFeatureFlag) return res.redirect(paths.common.overview);

    const appeal = req.session.appeal;
    appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('templates/deportation-order.njk', {
      previousPage: paths.appealStarted.homeOfficeDecisionLetter,
      formAction: paths.appealStarted.deportationOrder,
      question: getDeportationOrderOptionsQuestion(req.session.appeal)
    });
  } catch (error) {
    next(error);
  }
}

function postDeportationOrder(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dlrmInternalFeatureFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_INTERNAL_FEATURE_FLAG, false);
    if (!dlrmInternalFeatureFlag) return res.redirect(paths.common.overview);

    async function persistAppeal(appeal: Appeal) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = deportationOrderOptionsValidation(req.body);
      if (validation) {
        return res.render('templates/deportation-order.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.homeOfficeDecisionLetter,
          formAction: paths.appealStarted.deportationOrder,
          question: getDeportationOrderOptionsQuestion(req.session.appeal)
        });
      }

      const selectedValue = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          deportationOrderOptions: selectedValue
        }
      };

      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      await persistAppeal(appeal);
      const defaultRedirect = paths.appealStarted.taskList;
      const redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupDeportationOrderController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.deportationOrder, middleware, getDeportationOrder);
  router.post(paths.appealStarted.deportationOrder, middleware, postDeportationOrder(updateAppealService));
  return router;
}

export {
  setupDeportationOrderController,
  getDeportationOrder,
  postDeportationOrder,
  getDeportationOrderOptionsQuestion
};
