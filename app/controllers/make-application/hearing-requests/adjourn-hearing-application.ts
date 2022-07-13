import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getAdjournHearingApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askHearingSooner: createStructuredError('askChangeDate', i18n.validationErrors.makeApplication.askChangeDate)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.hearingRequests.askChangeDate.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.hearingRequests.askChangeDate.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.hearingRequests.askChangeDate.title,
    formAction: paths.makeApplication.adjourn,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.hearingRequests.askChangeDate.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.hearingRequests.askChangeDate.ableToAddEvidenceAdvice
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postAdjournHearingApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceAdjourn;
  const redirectToErrorPath = `${paths.makeApplication.adjourn}?error=askChangeDate`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getAdjournHearingApplication,
  postAdjournHearingApplication
};
