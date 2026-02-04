import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { applicationTypes } from '../../../data/application-types';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getChangeDetailsApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askUpdateDetails: createStructuredError('askUpdateDetails', i18n.validationErrors.makeApplication.askUpdateDetails)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askUpdateDetails.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askUpdateDetails.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askUpdateDetails.title,
    formAction: paths.makeApplication.updateAppealDetails,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askUpdateDetails.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askUpdateDetails.ableToAddEvidenceAdvice,
    previousPage: paths.common.overview
  };
  req.session.appeal.makeAnApplicationTypes = {
    value: {
      code: 'updateAppealDetails',
      label: applicationTypes.updateAppealDetails.type
    }
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postChangeDetailsApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceUpdateAppealDetails;
  const redirectToErrorPath = `${paths.makeApplication.updateAppealDetails}?error=askUpdateDetails`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getChangeDetailsApplication,
  postChangeDetailsApplication
};
