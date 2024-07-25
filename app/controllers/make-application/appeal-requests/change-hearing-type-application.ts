import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { applicationTypes } from '../../../data/application-types';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getChangeHearingTypeApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askChangeHearingType: createStructuredError('askChangeHearingType', i18n.validationErrors.makeApplication.askChangeHearingType)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askChangeHearingType.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askChangeHearingType.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askChangeHearingType.title,
    formAction: paths.makeApplication.changeHearingType,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askChangeHearingType.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askChangeHearingType.ableToAddEvidenceAdvice,
    previousPage: paths.common.overview
  };
  req.session.appeal.makeAnApplicationTypes = {
    value: {
      code: 'changeHearingType',
      label: applicationTypes.changeHearingType.type
    }
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postChangeHearingTypeApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceChangeHearingType;
  const redirectToErrorPath = `${paths.makeApplication.changeHearingType}?error=askChangeHearingType`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getChangeHearingTypeApplication,
  postChangeHearingTypeApplication
};
