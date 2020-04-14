import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';

function getCheckAndSend(req: Request, res: Response, next: NextFunction): void {
  try {
    const editParameter: string = '?edit';
    let previousPage: string = paths.reasonsForAppeal.supportingEvidence;

    const summaryRows = [
      addSummaryRow(i18n.common.cya.questionRowTitle, [ i18n.pages.reasonForAppeal.heading ], null),
      addSummaryRow(i18n.common.cya.answerRowTitle, [ req.session.appeal.reasonsForAppeal.applicationReason ], paths.reasonsForAppeal.decision + editParameter)
    ];

    if (_.has(req.session.appeal.reasonsForAppeal, 'evidences')) {

      const evidences: Evidence[] = req.session.appeal.reasonsForAppeal.evidences || [];

      if (evidences.length) {
        const evidenceText = evidences.map((evidence) => {
          return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.detailsViewers.document}/${evidence.fileId}'>${evidence.name}</a>`;
        });

        summaryRows.push(addSummaryRow(i18n.common.cya.supportingEvidenceRowTitle, evidenceText, paths.reasonsForAppeal.supportingEvidenceUpload + editParameter, Delimiter.BREAK_LINE));
        previousPage = paths.reasonsForAppeal.supportingEvidenceUpload;
      }
    }

    return res.render('reasons-for-appeal/check-and-send-page.njk', {
      summaryRows,
      previousPage: previousPage
    });
  } catch (error) {
    next(error);
  }
}

function postCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body)) {
        return getConditionalRedirectUrl(req, res, paths.overview + '?saved');
      }
      const updatedAppeal = await updateAppealService.submitEvent(Events.SUBMIT_REASONS_FOR_APPEAL, req);
      req.session.appeal.appealStatus = updatedAppeal.state;
      return res.redirect(paths.reasonsForAppeal.confirmation);
    } catch (error) {
      next(error);
    }
  };
}

function setupCheckAndSendController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.reasonsForAppeal.checkAndSend, getCheckAndSend);
  router.post(paths.reasonsForAppeal.checkAndSend, postCheckAndSend(updateAppealService));
  return router;
}

export {
  getCheckAndSend,
  postCheckAndSend,
  setupCheckAndSendController
};
