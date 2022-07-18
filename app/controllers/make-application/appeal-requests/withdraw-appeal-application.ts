import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { applicationTypes } from '../../../data/application-types';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getWithdrawAppealApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askWithdraw: createStructuredError('askWithdraw', i18n.validationErrors.makeApplication.askWithdraw)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askWithdraw.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askWithdraw.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askWithdraw.title,
    formAction: paths.makeApplication.withdraw,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askWithdraw.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askWithdraw.ableToAddEvidenceAdvice,
    previousPage: paths.common.overview
  };
  req.session.appeal.makeAnApplicationTypes = {
    value: {
      code: 'withdraw',
      label: applicationTypes.withdraw.type
    }
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postWithdrawAppealApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceWithdraw;
  const redirectToErrorPath = `${paths.makeApplication.withdraw}?error=askWithdraw`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getWithdrawAppealApplication,
  postWithdrawAppealApplication
};
