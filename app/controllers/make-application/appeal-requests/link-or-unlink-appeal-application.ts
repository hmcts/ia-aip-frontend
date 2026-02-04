import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { applicationTypes } from '../../../data/application-types';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getLinkOrUnlinkAppealApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askLinkUnlink: createStructuredError('askLinkUnlink', i18n.validationErrors.makeApplication.askLinkUnlink)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askLinkUnlink.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askLinkUnlink.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askLinkUnlink.title,
    formAction: paths.makeApplication.linkOrUnlink,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askLinkUnlink.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askLinkUnlink.ableToAddEvidenceAdvice,
    previousPage: paths.common.overview
  };
  req.session.appeal.makeAnApplicationTypes = {
    value: {
      code: 'linkOrUnlink',
      label: applicationTypes.linkOrUnlink.type
    }
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postLinkOrUnlinkAppealApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceLinkOrUnlink;
  const redirectToErrorPath = `${paths.makeApplication.linkOrUnlink}?error=askLinkUnlink`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getLinkOrUnlinkAppealApplication,
  postLinkOrUnlinkAppealApplication
};
