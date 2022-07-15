import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addSummaryRow } from '../../utils/summary-list';
import { createStructuredError } from '../../utils/validations/fields-validations';

function getProvideMakeAnApplicationDetails(req: Request, res: Response, next: NextFunction, config: any) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = config.validationErrors;
    }

    const makeAnApplicationTypes = req.session.appeal.makeAnApplicationTypes;

    if (makeAnApplicationTypes) {
      const question = {
        name: 'makeAnApplicationDetails',
        value: req.session.appeal.makeAnApplicationDetails,
        description: config.makeAnApplicationDetailsDescription,
        hint: config.makeAnApplicationDetailsHint
      };

      return res.render('make-application/details-question-page.njk', {
        previousPage: paths.makeApplication.askChangeHearing,
        title: config.makeAnApplicationDetailsTitle,
        formAction: config.formAction,
        supportingEvidence: true,
        ableToAddEvidenceTitle: config.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: config.ableToAddEvidenceAdvice,
        question,
        ...validationErrors && { error: validationErrors },
        ...validationErrors && { errorList: Object.values(validationErrors) }
      });
    } else {
      res.redirect(paths.makeApplication.askChangeHearing);
    }
  } catch (error) {
    next(error);
  }
}

function postProvideMakeAnApplicationDetails(req: Request, res: Response, next: NextFunction, redirectToSuccessPath: string, redirectToErrorPath: string) {
  try {
    const makeAnApplicationDetails = req.body['makeAnApplicationDetails'];

    if (makeAnApplicationDetails) {
      req.session.appeal = {
        ...req.session.appeal,
        makeAnApplicationDetails
      };
      res.redirect(redirectToSuccessPath);
    } else {
      res.redirect(redirectToErrorPath);
    }
  } catch (error) {
    next(error);
  }
}

function getProvideSupportingEvidenceYesOrNo(req: Request, res: Response, next: NextFunction, previousPage: string, formAction: string) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        supportingEvidenceRequired: createStructuredError('supportingEvidenceRequired', i18n.validationErrors.makeApplication.supportingEvidenceRequired)
      };
    }

    const makeAnApplicationProvideEvidence = req.session.appeal.makeAnApplicationProvideEvidence;
    const question = {
      title: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.title,
      name: 'answer',
      titleIsheading: true,
      options: [
        {
          value: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.value,
          text: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.text,
          checked: makeAnApplicationProvideEvidence === i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.value
        },
        {
          value: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.no.value,
          text: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.no.text,
          checked: makeAnApplicationProvideEvidence === i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.no.value
        }
      ],
      inline: true
    };

    return res.render('make-application/radio-button-question-page.njk', {
      previousPage,
      pageTitle: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.title,
      formAction,
      question,
      ...validationErrors && { errorList: Object.values(validationErrors) },
      ...validationErrors && { error: validationErrors },
      saveAndContinue: false
    });
  } catch (error) {
    next(error);
  }
}

function postProvideSupportingEvidenceYesOrNo(req: Request, res: Response, next: NextFunction, config: any) {
  try {
    const makeAnApplicationProvideEvidence = req.body['answer'];

    if (makeAnApplicationProvideEvidence) {
      const redirectTo = makeAnApplicationProvideEvidence === i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.value
        ? config.pathToProvideSupportingEvidence
        : config.pathToCheckAnswer;

      req.session.appeal.makeAnApplicationProvideEvidence = makeAnApplicationProvideEvidence;
      res.redirect(redirectTo);
    } else {
      res.redirect(`${config.pathToSupportingEvidence}?error=supportingEvidenceRequired`);
    }
  } catch (error) {
    next(error);
  }
}

function getProvideSupportingEvidence(req: Request, res: Response, next: NextFunction, config: any) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`])
      };

    }

    const content = {
      title: i18n.pages.makeApplication.provideSupportingEvidence.title,
      adviceHeader: i18n.pages.makeApplication.provideSupportingEvidence.adviceHeader,
      advice: i18n.pages.makeApplication.provideSupportingEvidence.advice,
      evidenceUploadAction: config.evidenceUploadAction,
      evidences: req.session.appeal.makeAnApplicationEvidence || [],
      evidenceCTA: config.evidenceCTA,
      previousPage: config.previousPage,
      ...validationErrors && { errorList: Object.values(validationErrors) },
      ...validationErrors && { error: validationErrors },
      formSubmitAction: config.pathToProvideSupportingEvidence
    };

    return res.render('make-application/supporting-evidence-upload-page.njk', content);
  } catch (e) {
    next(e);
  }
}

function postProvideSupportingEvidence(req: Request, res: Response, next: NextFunction, config: any) {
  try {
    if ((req.session.appeal.makeAnApplicationEvidence || []).length > 0) {
      res.redirect(config.pathToCheckYourAnswer);
    } else {
      res.redirect(`${config.pathToProvideSupportingEvidence}?error=noFileSelected`);
    }
  } catch (error) {
    next(error);
  }
}

function getProvideSupportingEvidenceCheckAndSend(req: Request, res: Response, next: NextFunction, config: any) {
  try {
    const summaryLists: SummaryList[] = buildSupportingEvidenceDocumentsSummaryList(req, config.pathToProvideSupportingEvidenceNoLeadingSlash, config.pathToMakeApplicationDetailsNoLeadingSlash);
    const previousPage = req.session.appeal.makeAnApplicationProvideEvidence === i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.value
      ? config.pathToProvideSupportingEvidence
      : config.pathToSupportingEvidence;

    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.makeApplication.checkYourAnswers.title,
      continuePath: config.pathToCheckYourAnswer,
      previousPage,
      summaryLists
    });
  } catch (e) {
    next(e);
  }
}

function postProvideSupportingEvidenceCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      delete (req.session.appeal.makeAnApplicationProvideEvidence);
      const appeal: Appeal = {
        ...req.session.appeal
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.MAKE_AN_APPLICATION, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);

      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      delete (req.session.appeal.makeAnApplicationDetails);
      delete (req.session.appeal.makeAnApplicationTypes);
      req.session.appeal.makeAnApplicationEvidence = [];

      return res.redirect(paths.makeApplication.requestSent);
    } catch (e) {
      next(e);
    }
  };
}

function getRequestSent(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('templates/confirmation-page.njk', {
      title: i18n.pages.makeApplication.requestSent.title,
      whatNextContent: i18n.pages.makeApplication.requestSent.whatNextContent
    });
  } catch (e) {
    next(e);
  }
}

function uploadSupportingEvidence(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redirectTo = getPath('provideSupportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code);
      if (!req.file) {
        return res.redirect(`${redirectTo}?error=noFileSelected`);
      }

      const supportingEvidenceDocument: DocumentUploadResponse = await documentManagementService.uploadFile(req);
      const makeAnApplicationEvidence: Evidence[] = [...(req.session.appeal.makeAnApplicationEvidence || [])];
      makeAnApplicationEvidence.push({
        name: supportingEvidenceDocument.name,
        fileId: supportingEvidenceDocument.fileId
      });

      req.session.appeal = {
        ...req.session.appeal,
        makeAnApplicationEvidence
      };

      return res.redirect(redirectTo);
    } catch (e) {
      next(e);
    }
  };
}

function deleteSupportingEvidence(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redirectTo = getPath('provideSupportingEvidence', req.session.appeal.makeAnApplicationTypes.value.code);
      if (req.query.id) {
        const makeAnApplicationEvidence: Evidence[] = [...(req.session.appeal.makeAnApplicationEvidence || []).filter(document => document.fileId !== req.query.id)];
        const documentMap: DocumentMap[] = [...(req.session.appeal.documentMap || []).filter(document => document.id !== req.query.id)];

        await documentManagementService.deleteFile(req, req.query.id as string);

        req.session.appeal.makeAnApplicationEvidence = makeAnApplicationEvidence;
        req.session.appeal.documentMap = documentMap;
      }
      return res.redirect(redirectTo);
    } catch (e) {
      next(e);
    }
  };
}

function buildSupportingEvidenceDocumentsSummaryList(req: Request, pathToProvideSupportingEvidenceNoLeadingSlash: string, pathToMakeApplicationDetailsNoLeadingSlash: string): SummaryList[] {
  const summaryLists: SummaryList[] = [];
  const summaryRows: SummaryRow[] = [];
  const makeAnApplicationDetails = req.session.appeal.makeAnApplicationDetails;
  const makeAnApplicationEvidence = req.session.appeal.makeAnApplicationEvidence;
  if (makeAnApplicationDetails) {
    summaryRows.push(
      addSummaryRow(
        i18n.pages.makeApplication.checkYourAnswers.rows[0],
        [`<p>${i18n.pages.makeApplication.hearingRequests.askHearingSooner.hint}</p>`]
      ),
      addSummaryRow(
        i18n.pages.makeApplication.checkYourAnswers.rows[1],
        [`<p>${makeAnApplicationDetails}</p>`],
        pathToMakeApplicationDetailsNoLeadingSlash
      )
    );
  }
  if (makeAnApplicationEvidence && makeAnApplicationEvidence.length > 0) {
    makeAnApplicationEvidence.forEach((evidence: Evidence) => {
      summaryRows.push(
        addSummaryRow(
          i18n.pages.makeApplication.checkYourAnswers.rows[2],
          [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`],
          pathToProvideSupportingEvidenceNoLeadingSlash
        )
      );
    });
  }
  summaryLists.push({
    summaryRows
  });

  return summaryLists;
}

export function getPath(pathPrefix: string, applicationType: string): string {
  const key = pathPrefix ? (applicationType ? (pathPrefix + applicationType.charAt(0).toUpperCase() + applicationType.slice(1)) : pathPrefix) : applicationType;
  return paths.makeApplication[`${key}`];
}

export const makeApplicationControllersHelper = {
  getProvideMakeAnApplicationDetails,
  getProvideSupportingEvidenceYesOrNo,
  getProvideSupportingEvidence,
  getProvideSupportingEvidenceCheckAndSend,
  getRequestSent,
  postProvideMakeAnApplicationDetails,
  postProvideSupportingEvidence,
  postProvideSupportingEvidenceYesOrNo,
  postProvideSupportingEvidenceCheckAndSend,
  uploadSupportingEvidence,
  deleteSupportingEvidence,
  buildSupportingEvidenceDocumentsSummaryList,
  getPath
};
