import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import { helpWithFeesRefNumberValidation } from '../../utils/validations/fields-validations';

async function getHelpWithFeesRefNumber(req: Request, res: Response, next: NextFunction) {
  try {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
    const helpWithFeesReferenceNumber = req.session.appeal.application.lateHelpWithFeesRefNumber || null;

    return res.render('appeal-application/fee-support/help-with-fees-reference-number.njk', {
      previousPage: previousPage,
      formAction: paths.common.helpWithFeesReferenceNumberRefund,
      helpWithFeesReferenceNumber,
      refundJourney: true,
      errors: req.session.validationErrors || null
    });
  } catch (error) {
    next(error);
  }
}

function postHelpWithFeesRefNumber() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);

    try {
      const validation = helpWithFeesRefNumberValidation(req.body);
      if (validation) {
        return res.render('appeal-application/fee-support/help-with-fees-reference-number.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.common.helpWithFeesReferenceNumberRefund,
          pageTitle: i18n.pages.helpWithFeesReference.title,
          formAction: paths.common.helpWithFeesReferenceNumberRefund,
          refundJourney: true
        });
      }
      const selectedValue = req.body['helpWithFeesRefNumber'];
      const application = req.session.appeal.application;
      application.lateHelpWithFeesRefNumber = selectedValue;
      resetJourneyValues(application);
      return res.redirect(paths.common.checkYourAnswersRefund);
    } catch (error) {
      next(error);
    }
  };
}

// Function used in CYA page edit mode, when the start page option is changed other values should be reset and the journey should start from the new selected option
function resetJourneyValues(application: AppealApplication) {
  application.lateAsylumSupportRefNumber = null;
  application.lateLocalAuthorityLetters = null;
}

function setupHelpWithFeesReferenceNumberRefundController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.common.helpWithFeesReferenceNumberRefund, middleware, getHelpWithFeesRefNumber);
  router.post(paths.common.helpWithFeesReferenceNumberRefund, middleware, postHelpWithFeesRefNumber());
  return router;
}

export {
  getHelpWithFeesRefNumber,
  postHelpWithFeesRefNumber,
  setupHelpWithFeesReferenceNumberRefundController,
  resetJourneyValues
};
