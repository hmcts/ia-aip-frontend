import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getWithdrawAppealApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askChangeLocation: createStructuredError('askWithdrawAppeal', i18n.validationErrors.makeApplication.askChangeLocation)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askWithdrawAppeal.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askWithdrawAppeal.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askWithdrawAppeal.title,
    formAction: paths.makeApplication.withdraw,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askWithdrawAppeal.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askWithdrawAppeal.ableToAddEvidenceAdvice
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postWithdrawAppealApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceWithdraw;
  const redirectToErrorPath = `${paths.makeApplication.transfer}?error=askWithdrawAppeal`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getWithdrawAppealApplication,
  postWithdrawAppealApplication
};
