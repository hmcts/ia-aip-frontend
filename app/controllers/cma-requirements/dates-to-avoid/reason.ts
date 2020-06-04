import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: paths.awaitingCmaRequirements.datesToAvoidEnterDate,
  formAction: paths.awaitingCmaRequirements.datesToAvoidReason,
  pageTitle: i18n.pages.cmaRequirements.datesToAvoidSection.reason.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.datesToAvoidSection.reason.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getDatesToAvoidReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { datesToAvoid } = req.session.appeal.cmaRequirements;
    const last: DateToAvoid = datesToAvoid[datesToAvoid.length - 1];

    pageContent.question.value = last.reason ? last.reason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postDatesToAvoidReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.datesToAvoid.reasonRequired;

      const onSuccess = () => {
        const { datesToAvoid } = req.session.appeal.cmaRequirements;
        const last: DateToAvoid = datesToAvoid[datesToAvoid.length - 1];
        last.reason = req.body['reason'];

        return req.body['saveForLater']
          ? handleCmaRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate);
      };

      return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function setupDatesToAvoidReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.datesToAvoidReason, middleware, getDatesToAvoidReason);
  router.post(paths.awaitingCmaRequirements.datesToAvoidReason, middleware, postDatesToAvoidReason(updateAppealService));

  return router;
}

export {
  setupDatesToAvoidReasonController,
  getDatesToAvoidReason,
  postDatesToAvoidReason
};
