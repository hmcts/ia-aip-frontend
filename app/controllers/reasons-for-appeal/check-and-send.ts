import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { formatTextForCYA, handleNlrStatementValidation, hasActiveNlr, nowIsoDate } from '../../utils/utils';

function getCheckAndSendRenderArgs(req: Request): RenderArgs {
  const editParameter: string = '?edit';
  let previousPage: string = paths.awaitingReasonsForAppeal.supportingEvidence;

  const formattedReason = formatTextForCYA(req.session.appeal.reasonsForAppeal.applicationReason);

  const summaryRows = [
    addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.reasonForAppeal.heading], null),
    addSummaryRow(i18n.common.cya.answerRowTitle, [formattedReason], paths.awaitingReasonsForAppeal.decision + editParameter)
  ];

  if (_.has(req.session.appeal.reasonsForAppeal, 'evidences')) {
    const evidences: Evidence[] = req.session.appeal.reasonsForAppeal.evidences || [];
    const evidenceNames: string[] = evidences.map((evidence) => evidence.name);
    if (evidenceNames.length) {
      const evidenceText = evidences.map((evidence) => {
        return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`;
      });

      summaryRows.push(addSummaryRow(i18n.common.cya.supportingEvidenceRowTitle, evidenceText, paths.awaitingReasonsForAppeal.supportingEvidenceUpload + editParameter, Delimiter.BREAK_LINE));
      previousPage = paths.awaitingReasonsForAppeal.supportingEvidenceUpload;
    }
  }

  return {
    renderPath: 'templates/check-and-send.njk',
    renderObj: {
      summaryRows,
      previousPage: previousPage,
      hasNlr: hasActiveNlr(req.session.appeal),
      formAction: paths.awaitingReasonsForAppeal.checkAndSend
    }
  };
}

function getCheckAndSend(req: Request, res: Response, next: NextFunction): void {
  try {
    const { renderPath, renderObj } = getCheckAndSendRenderArgs(req);
    return res.render(renderPath, renderObj);
  } catch (error) {
    next(error);
  }
}

function postCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body)) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (hasActiveNlr(req.session.appeal)) {
        const canContinue = handleNlrStatementValidation(req, res, getCheckAndSendRenderArgs(req));
        if (!canContinue) {
          return;
        }
      }
      const appeal: Appeal = {
        ...req.session.appeal,
        reasonsForAppeal: {
          ...req.session.appeal.reasonsForAppeal,
          uploadDate: nowIsoDate()
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.SUBMIT_REASONS_FOR_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.refreshCasesList = true;
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.reasonsForAppealSubmitted.confirmation);
    } catch (error) {
      next(error);
    }
  };
}

function setupCheckAndSendController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingReasonsForAppeal.checkAndSend, middleware, getCheckAndSend);
  router.post(paths.awaitingReasonsForAppeal.checkAndSend, middleware, postCheckAndSend(updateAppealService));
  return router;
}

export {
  getCheckAndSend,
  postCheckAndSend,
  setupCheckAndSendController
};
