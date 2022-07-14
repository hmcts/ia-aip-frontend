import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getTransferHearingApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askChangeLocation: createStructuredError('askChangeLocation', i18n.validationErrors.makeApplication.askChangeLocation)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.hearingRequests.askChangeLocation.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.hearingRequests.askChangeLocation.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.hearingRequests.askChangeLocation.title,
    formAction: paths.makeApplication.transfer,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.hearingRequests.askChangeLocation.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.hearingRequests.askChangeLocation.ableToAddEvidenceAdvice
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postTransferHearingApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceTransfer;
  const redirectToErrorPath = `${paths.makeApplication.transfer}?error=askChangeLocation`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getTransferHearingApplication,
  postTransferHearingApplication
};
