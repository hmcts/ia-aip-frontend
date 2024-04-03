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
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    try {
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          refundRequested: true
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.REQUEST_FEE_REMISSION, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], refundFeatureEnabled);

      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.appealSubmitted.confirmationRefund);
    } catch (error) {
      next(error);
    }
  };
}

async function createSummaryRowsFrom(req: Request) {
  const application = req.session.appeal.application;
  const editParameter = '?edit';
  const lateRemissionOption = application.lateRemissionOption;
  const lateAsylumSupportRefNumber = application.lateAsylumSupportRefNumber;
  const lateHelpWithFeesOption = application.lateHelpWithFeesOption;
  const lateHelpWithFeesRefNumber = application.lateHelpWithFeesRefNumber;
  const lateLocalAuthorityLetters = application.lateLocalAuthorityLetters;
  const rows = [];

  if (lateRemissionOption) {
    let rowValue = [i18n.pages.remissionOptionPage.options[lateRemissionOption].text];
    if (lateRemissionOption === 'iWantToGetHelpWithFees') {
      rowValue = [i18n.pages.remissionOptionPage.noneOfTheseStatements];
    }
    const feeStatementRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.feeStatement,
      rowValue,
      paths.appealSubmitted.feeSupportRefund + editParameter
    );
    rows.push(feeStatementRow);
  }

  if (lateAsylumSupportRefNumber) {
    const asylumSupportRefNumberRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.asylumSupportRefNumber,
      [lateAsylumSupportRefNumber],
      paths.appealSubmitted.asylumSupportRefund + editParameter
    );
    rows.push(asylumSupportRefNumberRow);
  }

  if (lateHelpWithFeesOption && lateHelpWithFeesOption !== 'willPayForAppeal') {
    let helpWithFeeValue = '';
    if (lateHelpWithFeesOption === 'wantToApply') {
      helpWithFeeValue = i18n.pages.helpWithFees.checkAndSendWantToApply;
    } else {
      helpWithFeeValue = i18n.pages.helpWithFees.options[lateHelpWithFeesOption].text;
    }
    const helpWithFeesRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.helpWithFees,
      [helpWithFeeValue],
      paths.appealSubmitted.helpWithFeesRefund + editParameter
    );
    rows.push(helpWithFeesRow);
  }

  if (lateHelpWithFeesRefNumber) {
    const helpWithFeeRefNumberRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.helpWithFeesRefNumber,
      [lateHelpWithFeesRefNumber],
      paths.appealSubmitted.helpWithFeesReferenceNumberRefund + editParameter
    );
    rows.push(helpWithFeeRefNumberRow);
  }

  if (lateLocalAuthorityLetters && lateLocalAuthorityLetters.length > 0) {
    const localAuthorityLetterRow = addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.localAuthorityLetter,
      application.lateLocalAuthorityLetters.map(evidence => `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`),
      paths.appealSubmitted.localAuthorityLetterRefund + editParameter,
      Delimiter.BREAK_LINE
    );
    rows.push(localAuthorityLetterRow);
  }
  return rows;
}

function setupCheckYourAnswersRefundController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealSubmitted.checkYourAnswersRefund, middleware, getCheckYourAnswersRefund);
  router.post(paths.appealSubmitted.checkYourAnswersRefund, middleware, postCheckYourAnswersRefund(updateAppealService));
  return router;
}

export {
  getCheckYourAnswersRefund,
  postCheckYourAnswersRefund,
  setupCheckYourAnswersRefundController,
  createSummaryRowsFrom
};
