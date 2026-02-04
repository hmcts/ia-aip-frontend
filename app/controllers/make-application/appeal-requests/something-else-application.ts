import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { applicationTypes } from '../../../data/application-types';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getOtherAppealApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askSomethingElse: createStructuredError('askSomethingElse', i18n.validationErrors.makeApplication.askSomethingElse)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askSomethingElse.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askSomethingElse.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askSomethingElse.title,
    formAction: paths.makeApplication.other,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askSomethingElse.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askSomethingElse.ableToAddEvidenceAdvice,
    previousPage: paths.common.overview
  };
  req.session.appeal.makeAnApplicationTypes = {
    value: {
      code: 'other',
      label: applicationTypes.other.type
    }
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postOtherAppealApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceOther;
  const redirectToErrorPath = `${paths.makeApplication.other}?error=askSomethingElse`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getOtherAppealApplication,
  postOtherAppealApplication
};
