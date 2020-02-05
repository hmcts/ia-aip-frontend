import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';

function getCheckAndSend(req: Request, res: Response, next: NextFunction): void {
  try {
    const summaryRows = [
      addSummaryRow(i18n.common.cya.questionRowTitle, [ i18n.pages.reasonForAppeal.heading ], null),
      addSummaryRow(i18n.common.cya.answerRowTitle, [ req.session.appeal.reasonsForAppeal.applicationReason ], paths.reasonsForAppeal.reason)
    ];

    if (_.has(req.session.appeal.reasonsForAppeal, 'evidences')) {

      const evidences: Evidences = req.session.appeal.reasonsForAppeal.evidences;
      const evidenceNames: string[] = Object.values(evidences).map((evidence) => evidence.name);
      summaryRows.push(addSummaryRow(i18n.common.cya.supportingEvidenceRowTitle, evidenceNames, paths.reasonsForAppeal.supportingEvidenceUpload, Delimiter.BREAK_LINE));
    }

    return res.render('reasons-for-appeal/check-and-send-page.njk', {
      summaryRows,
      previousPage: paths.reasonsForAppeal.reason
    });
  } catch (error) {
    next(error);
  }
}

function postCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: confirm we need a statement of truth
      if (!shouldValidateWhenSaveForLater(req.body)) {
        return res.redirect(paths.caseBuilding.timeline);
      }
      await updateAppealService.submitEvent(Events.SUBMIT_APPEAL, req);
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
