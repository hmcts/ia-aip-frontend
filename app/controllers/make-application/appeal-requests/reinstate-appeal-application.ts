import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { applicationTypes } from '../../../data/application-types';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getReinstateAppealApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askReinstate: createStructuredError('askReinstate', i18n.validationErrors.makeApplication.askReinstate)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askReinstate.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askReinstate.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askReinstate.title,
    formAction: paths.makeApplication.reinstate,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askReinstate.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askReinstate.ableToAddEvidenceAdvice,
    previousPage: paths.common.overview
  };
  req.session.appeal.makeAnApplicationTypes = {
    value: {
      code: 'reinstate',
      label: applicationTypes.reinstate.type
    }
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postReinstateAppealApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceReinstate;
  const redirectToErrorPath = `${paths.makeApplication.reinstate}?error=askReinstate`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getReinstateAppealApplication,
  postReinstateAppealApplication
};
