import { NextFunction, Request, Response } from 'express';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { makeApplicationControllersHelper } from './make-application-controllers-helper';

function getProvideSupportingEvidenceYesOrNo(req: Request, res: Response, next: NextFunction) {
  const previousPage = paths.makeApplication[`${req.session.appeal.makeAnApplicationTypes.value.code}`];
  const formAction = makeApplicationControllersHelper.getPath('supportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code);
  return makeApplicationControllersHelper.getProvideSupportingEvidenceYesOrNo(req, res, next, previousPage, formAction);
}

function postProvideSupportingEvidenceYesOrNo(req: Request, res: Response, next: NextFunction) {
  const config = {
    pathToProvideSupportingEvidence: makeApplicationControllersHelper.getPath('provideSupportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code),
    pathToSupportingEvidence: makeApplicationControllersHelper.getPath('supportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code),
    pathToCheckAnswer: makeApplicationControllersHelper.getPath('checkAnswer', req.session.appeal.makeAnApplicationTypes.value.code)
  };
  return makeApplicationControllersHelper.postProvideSupportingEvidenceYesOrNo(req, res, next, config);
}

function getProvideSupportingEvidence(req: Request, res: Response, next: NextFunction) {
  const config = {
    evidenceUploadAction: paths.makeApplication.provideSupportingEvidenceUploadFile,
    evidenceCTA: paths.makeApplication.provideSupportingEvidenceDeleteFile,
    previousPage: makeApplicationControllersHelper.getPath('supportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code),
    pathToSupportingEvidence: makeApplicationControllersHelper.getPath('supportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code)
  };
  return makeApplicationControllersHelper.getProvideSupportingEvidence(req, res, next, config);
}

function postProvideSupportingEvidence(req: Request, res: Response, next: NextFunction) {
  const config = {
    pathToCheckYourAnswer: makeApplicationControllersHelper.getPath('checkAnswer', req.session.appeal.makeAnApplicationTypes.value.code),
    pathToProvideSupportingEvidence: makeApplicationControllersHelper.getPath('provideSupportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code)
  };
  return makeApplicationControllersHelper.postProvideSupportingEvidence(req, res, next, config);
}

function getProvideSupportingEvidenceCheckAndSend(req: Request, res: Response, next: NextFunction) {
  const pathToProvideSupportingEvidence = makeApplicationControllersHelper.getPath('provideSupportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code);
  const pathToMakeApplicationDetails = makeApplicationControllersHelper.getPath('', req.session.appeal.makeAnApplicationTypes.value.code);
  const config = {
    pathToProvideSupportingEvidenceNoLeadingSlash: pathToProvideSupportingEvidence ? pathToProvideSupportingEvidence.slice(1) : '',
    pathToMakeApplicationDetailsNoLeadingSlash: pathToMakeApplicationDetails ? pathToMakeApplicationDetails.slice(1) : '',
    pathToProvideSupportingEvidence,
    pathToSupportingEvidence: makeApplicationControllersHelper.getPath('supportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code),
    pathToCheckYourAnswer: makeApplicationControllersHelper.getPath('checkAnswer', req.session.appeal.makeAnApplicationTypes.value.code)
  };
  return makeApplicationControllersHelper.getProvideSupportingEvidenceCheckAndSend(req, res, next, config);
}

function postProvideSupportingEvidenceCheckAndSend(updateAppealService: UpdateAppealService) {
  return makeApplicationControllersHelper.postProvideSupportingEvidenceCheckAndSend(updateAppealService);
}

function getRequestSent(req: Request, res: Response, next: NextFunction) {
  return makeApplicationControllersHelper.getRequestSent(req, res, next);
}

function uploadSupportingEvidence(documentManagementService: DocumentManagementService) {
  return makeApplicationControllersHelper.uploadSupportingEvidence(documentManagementService);
}

function deleteSupportingEvidence(documentManagementService: DocumentManagementService) {
  return makeApplicationControllersHelper.deleteSupportingEvidence(documentManagementService);
}

export {
  getProvideSupportingEvidenceYesOrNo,
  getProvideSupportingEvidence,
  getProvideSupportingEvidenceCheckAndSend,
  getRequestSent,
  postProvideSupportingEvidence,
  postProvideSupportingEvidenceYesOrNo,
  postProvideSupportingEvidenceCheckAndSend,
  uploadSupportingEvidence,
  deleteSupportingEvidence
};
