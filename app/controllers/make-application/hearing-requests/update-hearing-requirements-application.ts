import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getUpdateHearingRequirementsApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askUpdateHearingRequirements: createStructuredError('askUpdateHearingRequirements', i18n.validationErrors.makeApplication.askUpdateHearingRequirements)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.hearingRequests.askUpdateHearingRequirements.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.hearingRequests.askUpdateHearingRequirements.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.hearingRequests.askUpdateHearingRequirements.title,
    formAction: paths.makeApplication.updateHearingRequirements,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.hearingRequests.askUpdateHearingRequirements.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.hearingRequests.askUpdateHearingRequirements.ableToAddEvidenceAdvice
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postUpdateHearingRequirementsApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceUpdateHearingRequirements;
  const redirectToErrorPath = `${paths.makeApplication.updateHearingRequirements}?error=askUpdateHearingRequirements`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getUpdateHearingRequirementsApplication,
  postUpdateHearingRequirementsApplication
};
