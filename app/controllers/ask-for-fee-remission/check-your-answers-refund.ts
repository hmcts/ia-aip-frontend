import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';

async function getCheckYourAnswersRefund(req: Request, res: Response, next: NextFunction) {
  try {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    const summaryRows = await createSummaryRowsFrom(req);
    return res.render('ask-for-fee-remission/check-and-send.njk', {
      previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
      summaryRows
    });
  } catch (error) {
    next(error);
  }
}

function postCheckYourAnswersRefund(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
      if (!refundFeatureEnabled) return res.redirect(paths.common.overview);

      const { appeal } = req.session;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.REQUEST_FEE_REMISSION, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.appealSubmitted.confirmation);
    } catch (error) {
      next(error);
    }
  };
}

async function createSummaryRowsFrom(req: Request) {
  const application = req.session.appeal.application;
  const editParameter = '?edit';
  const remissionOption = application.remissionOption;
  const asylumSupportRefNumber = application.asylumSupportRefNumber;
  const helpWithFeesOption = application.helpWithFeesOption;
  const helpWithFeesRefNumber = application.helpWithFeesRefNumber;
  const localAuthorityLetter = application.localAuthorityLetters;
  const rows = [];
  if (remissionOption) {
    const feeStatementRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.feeStatement,
      [i18n.pages.remissionOptionPage.options[remissionOption].text],
      paths.appealSubmitted.feeSupportRefund + editParameter
    );
    rows.push(feeStatementRow);
  }
  if (asylumSupportRefNumber) {
    const asylumSupportRefNumberRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.asylumSupportRefNumber,
      [asylumSupportRefNumber],
      paths.appealSubmitted.asylumSupportRefund + editParameter
    );
    rows.push(asylumSupportRefNumberRow);
  }
  if (helpWithFeesOption) {
    let helpWithFeeValue = '';
    if (helpWithFeesOption === 'wantToApply') {
      helpWithFeeValue = i18n.pages.helpWithFees.checkAndSendWantToApply;
    } else if (helpWithFeesOption === 'willPayForAppeal') {
      helpWithFeeValue = i18n.pages.helpWithFees.checkAndSendWillPayForAppeal;
    } else {
      helpWithFeeValue = i18n.pages.helpWithFees.options[helpWithFeesOption].text;
    }

    const helpWithFeesRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.helpWithFees,
      [helpWithFeeValue],
      paths.appealSubmitted.helpWithFeesRefund + editParameter
    );
    rows.push(helpWithFeesRow);
  }
  if (helpWithFeesRefNumber) {
    const helpWithFeeRefNumberRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.helpWithFeesRefNumber,
      [helpWithFeesRefNumber],
      paths.appealSubmitted.helpWithFeesReferenceNumberRefund + editParameter
    );
    rows.push(helpWithFeeRefNumberRow);
  }
  if (localAuthorityLetter && localAuthorityLetter.length > 0) {
    const localAuthorityLetterRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.localAuthorityLetter,
      application.localAuthorityLetters.map(evidence => `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`),
      paths.appealSubmitted.localAuthorityLetterRefund + editParameter,
      Delimiter.BREAK_LINE
    );
    rows.push(localAuthorityLetterRow);
  }
}

function setupCheckYourAnswersRefundController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealSubmitted.checkYourAnswersRefund, middleware, getCheckYourAnswersRefund);
  router.post(paths.appealSubmitted.checkYourAnswersRefund, middleware, postCheckYourAnswersRefund(updateAppealService));
  return router;
}

export {
  getCheckYourAnswersRefund,
  setupCheckYourAnswersRefundController,
  createSummaryRowsFrom
};
