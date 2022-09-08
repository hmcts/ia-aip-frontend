import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { applicationTypes } from '../../../data/application-types';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';
import { makeApplicationControllersHelper } from '../make-application-controllers-helper';

function getJudgeReviewApplication(req: Request, res: Response, next: NextFunction) {
  const config = {
    validationErrors: {
      askJudgeReview: createStructuredError('askJudgeReview', i18n.validationErrors.makeApplication.askJudgeReview)
    },
    makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askJudgeReview.description,
    makeAnApplicationDetailsHint: i18n.pages.makeApplication.askJudgeReview.hint,
    makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askJudgeReview.title,
    formAction: paths.makeApplication.judgesReview,
    ableToAddEvidenceTitle: i18n.pages.makeApplication.askJudgeReview.ableToAddEvidenceTitle,
    ableToAddEvidenceAdvice: i18n.pages.makeApplication.askJudgeReview.ableToAddEvidenceAdvice,
    previousPage: paths.common.overview
  };
  req.session.appeal.makeAnApplicationTypes = {
    value: {
      code: 'judgesReview',
      label: applicationTypes.judgesReview.type
    }
  };
  return makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req, res, next, config);
}

function postJudgeReviewApplication(req: Request, res: Response, next: NextFunction) {
  const redirectToSuccessPath = paths.makeApplication.supportingEvidenceJudgesReview;
  const redirectToErrorPath = `${paths.makeApplication.judgesReview}?error=askJudgeReview`;
  return makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req, res, next, redirectToSuccessPath, redirectToErrorPath);
}

export {
  getJudgeReviewApplication,
  postJudgeReviewApplication
};
