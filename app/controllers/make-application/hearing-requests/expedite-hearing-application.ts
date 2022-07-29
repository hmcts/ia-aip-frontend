import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getExpediteHearingApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askHearingSooner: createStructuredError('askHearingSooner', i18n.validationErrors.makeApplication.askHearingSooner)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askHearingSooner.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askHearingSooner.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askHearingSooner.title,
    formAction: paths.makeApplication.expedite,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askHearingSooner.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askHearingSooner.ableToAddEvidenceAdvice
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postExpediteHearingApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceExpedite;
  const redirectToErrorPath = `${paths.makeApplication.expedite}?error=askHearingSooner`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getExpediteHearingApplication,
  postExpediteHearingApplication
};
