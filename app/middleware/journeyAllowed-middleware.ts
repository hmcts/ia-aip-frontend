import { NextFunction, Request, Response } from 'express';
import { paths } from '../paths';
import { hasPendingTimeExtension } from '../utils/utils';

function pathGetter(pathsCopy: any, req: Request): string[] {
  return Object.values(pathsCopy).map((path: string) => {
    if (Object.keys(req.params).length === 0) return path;
    const matches = path.match(/\/:([^\/]+)\/?$/);
    if (!matches) return path;
    if (matches[1] && req.params[matches[1]]) {
      return path.replace(new RegExp(`:${matches[1]}`), `${req.params[matches[1]]}`);
    }
  });
}

const isJourneyAllowedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const currentPath: string = req.path;
  const appealStatusPaths = pathGetter({ ...paths[req.session.appeal.appealStatus] }, req);
  const commonPaths = pathGetter({ ...paths.common }, req);
  const makeApplicationPaths = pathGetter({ ...paths.makeApplication }, req);
  const nonLegalRepPaths = pathGetter({ ...paths.nonLegalRep }, req);
  const startRepresentingYourselfPaths = pathGetter({ ...paths.startRepresentingYourself }, req);
  const ftpaPaths = pathGetter({ ...paths.ftpa }, req);

  let allowedPaths: string[];
  if (req.session.isNonLegalRep) {
    const nonLegalRepForbiddenCommonPaths: string[] = [
      paths.common.changeRepresentation,
      paths.common.changeRepresentationDownload,
      paths.common.askForMoreTimeReason,
      paths.common.askForMoreTimeCancel,
      paths.common.askForMoreTimeSupportingEvidence,
      paths.common.askForMoreTimeSupportingEvidenceUpload,
      paths.common.askForMoreTimeSupportingEvidenceSubmit,
      paths.common.askForMoreTimeSupportingEvidenceDelete,
      paths.common.askForMoreTimeCheckAndSend,
      paths.common.askForMoreTimeConfirmation,
      paths.common.provideMoreEvidenceForm,
      paths.common.provideMoreEvidenceUploadFile,
      paths.common.provideMoreEvidenceDeleteFile,
      paths.common.provideMoreEvidenceCheck,
      paths.common.provideMoreEvidenceConfirmation,
      paths.common.yourEvidence,
      paths.common.yourAddendumEvidence,
      paths.common.lrEvidence,
      paths.common.homeOfficeAddendumEvidence,
      paths.common.newEvidence,
      paths.common.whyEvidenceLate,
      paths.common.finishPayment,
      paths.common.payLater,
      paths.common.payImmediately,
      paths.common.confirmationPayment,
      paths.common.clarifyingQuestionsAnswersSentConfirmation
    ];
    allowedPaths = [
      ...commonPaths.filter(path => !nonLegalRepForbiddenCommonPaths.includes(path)),
      ...startRepresentingYourselfPaths,
      paths.nonLegalRep.joinAppeal,
      paths.nonLegalRep.joinAppealConfirmation,
      paths.nonLegalRep.joinAppealConfirmDetails,
      paths.nonLegalRep.updateName,
      paths.nonLegalRep.updateAddress,
      paths.nonLegalRep.updateContactDetails,
      paths.nonLegalRep.updateDetailsCheckAndSend,
      paths.nonLegalRep.updateDetailsConfirmation
    ];
  } else {
    allowedPaths = [
      ...appealStatusPaths,
      ...commonPaths,
      ...makeApplicationPaths,
      ...nonLegalRepPaths,
      ...startRepresentingYourselfPaths,
      ...ftpaPaths
    ];
  }
  const allowed: boolean = allowedPaths.includes(currentPath) ||
    currentPath.startsWith(paths.common.documentViewer);
  if (allowed) {
    return next();
  }
  return res.redirect(paths.common.forbidden);
};

const isTimeExtensionsInProgress = (req: Request, res: Response, next: NextFunction) => {
  if (!hasPendingTimeExtension(req.session.appeal)) {
    return next();
  }
  return res.redirect(paths.common.forbidden);
};

export {
  isJourneyAllowedMiddleware,
  isTimeExtensionsInProgress
};
