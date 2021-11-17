import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { countryList } from '../../data/country-list';
import { Events } from '../../data/events';
import { appealOutOfTimeMiddleware } from '../../middleware/outOfTime-middleware';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import PaymentService from '../../service/payments-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { formatTextForCYA } from '../../utils/utils';
import { statementOfTruthValidation } from '../../utils/validations/fields-validations';

function payForApplicationNeeded(req: Request): boolean {
  const { appealType } = req.session.appeal.application;
  const { paAppealTypeAipPaymentOption } = req.session.appeal;
  let payNow = false;
  payNow = payNow || appealType === 'protection' && paAppealTypeAipPaymentOption === 'payNow';
  payNow = payNow || ['refusalOfEu', 'refusalOfHumanRights'].includes(appealType);
  return payNow;
}

async function createSummaryRowsFrom(req: Request) {
  const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
  const { application } = req.session.appeal;
  const appealTypeNames: string[] = application.appealType.split(',').map(appealType => {
    return i18n.appealTypes[appealType].name;
  });
  const nationality = application.personalDetails.stateless === 'isStateless' ? 'Stateless' : countryList.find(country => country.value === application.personalDetails.nationality).name;
  const editParameter = '?edit';
  const rows = [
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber,
      [ application.homeOfficeRefNumber ],
      paths.appealStarted.details + editParameter
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.dateLetterSent,
      [ application.dateLetterSent.day, moment.months(parseInt(application.dateLetterSent.month, 10) - 1), application.dateLetterSent.year ],
      paths.appealStarted.letterSent + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.homeOfficeDecisionLetter,
      application.homeOfficeLetter.map(evidence => `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`),
      paths.appealStarted.homeOfficeDecisionLetter + editParameter,
      Delimiter.BREAK_LINE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.name,
      [ application.personalDetails.givenNames, application.personalDetails.familyName ],
      paths.appealStarted.name + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.dob,
      [ application.personalDetails.dob.day, moment.months(parseInt(application.personalDetails.dob.month, 10) - 1), application.personalDetails.dob.year ],
      paths.appealStarted.dob + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.nationality,
      [ nationality ],
      paths.appealStarted.nationality + editParameter
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.addressDetails,
      [ ...Object.values(application.personalDetails.address) ],
      paths.appealStarted.enterAddress + editParameter,
      Delimiter.BREAK_LINE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.contactDetails,
      [ application.contactDetails.email, application.contactDetails.phone ],
      paths.appealStarted.contactDetails + editParameter,
      Delimiter.BREAK_LINE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.appealType,
      [ appealTypeNames ],
      paths.appealStarted.typeOfAppeal + editParameter
    )
  ];

  if (application.isAppealLate) {
    const lateAppealValue = [ formatTextForCYA(application.lateAppeal.reason) ];
    if (application.lateAppeal.evidence) {
      const urlHtml = `<p class="govuk-!-font-weight-bold">${i18n.pages.checkYourAnswers.rowTitles.supportingEvidence}</p><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${application.lateAppeal.evidence.fileId}'>${application.lateAppeal.evidence.name}</a>`;
      lateAppealValue.push(urlHtml);
    }
    const lateAppealRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealLate, lateAppealValue, paths.appealStarted.appealLate);
    rows.push(lateAppealRow);
  }

  if (paymentsFlag) {
    let decisionType: string;
    if (['revocationOfProtection', 'deprivation'].includes(application.appealType)) {
      decisionType = req.session.appeal.application.rpDcAppealHearingOption;
    } else if (['protection', 'refusalOfHumanRights', 'refusalOfEu'].includes(application.appealType)) {
      decisionType = req.session.appeal.application.decisionHearingFeeOption;
    }
    const decisionTypeRow = addSummaryRow(i18n.pages.checkYourAnswers.decisionType, [ i18n.pages.checkYourAnswers[decisionType] ], paths.appealStarted.decisionType);
    rows.push(decisionTypeRow);

    const { paAppealTypeAipPaymentOption = null } = req.session.appeal;
    if (paAppealTypeAipPaymentOption) {
      const payNowRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.paymentType,
        [ i18n.pages.checkYourAnswers[paAppealTypeAipPaymentOption]],
        paths.appealStarted.payNow + editParameter
      );
      rows.push(payNowRow);
    }
  }
  return rows;
}

async function getCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
    const summaryRows = await createSummaryRowsFrom(req);
    const { appealType, decisionHearingFeeOption } = req.session.appeal.application;
    const { paAppealTypeAipPaymentOption = null, feeWithHearing = null, feeWithoutHearing = null } = req.session.appeal;
    let fee;
    let payNow;
    if (paymentsFlag && payForApplicationNeeded(req)) {
      payNow = appealType === 'protection' && paAppealTypeAipPaymentOption === 'payLater' ? false : true;
      fee = getFee(req);
    }
    return res.render('appeal-application/check-and-send.njk', {
      summaryRows,
      previousPage: paths.appealStarted.taskList,
      ...(paymentsFlag && payForApplicationNeeded(req)) && { fee: fee.calculated_amount },
      ...paymentsFlag && { payNow }
    });
  } catch (error) {
    next(error);
  }
}

function getFee(req: Request) {
  let fee;
  const { decisionHearingFeeOption } = req.session.appeal.application;
  const { feeWithHearing = null, feeWithoutHearing = null } = req.session.appeal;
  fee = decisionHearingFeeOption === 'decisionWithHearing' ? feeWithHearing : feeWithoutHearing;
  return {
    calculated_amount: fee,
    code: req.session.appeal.feeCode,
    version: req.session.appeal.feeVersion
  };
}

function postCheckAndSend(updateAppealService: UpdateAppealService, paymentService: PaymentService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body;
    try {
      const validationResult = statementOfTruthValidation(request);
      if (validationResult) {
        const summaryRows = await createSummaryRowsFrom(req);
        return res.render('appeal-application/check-and-send.njk', {
          summaryRows: summaryRows,
          error: validationResult,
          errorList: Object.values(validationResult),
          previousPage: paths.appealStarted.taskList
        });
      }
      const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
      if (paymentsFlag && payForApplicationNeeded(req)) {
        const fee = getFee(req);
        return await paymentService.initiatePayment(req, res, fee);
      }
      const { appeal } = req.session;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.SUBMIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
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

function getFinishPayment(updateAppealService: UpdateAppealService, paymentService: PaymentService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentDetails = JSON.parse(await paymentService.getPaymentDetails(req, req.session.appeal.paymentReference));

      if (paymentDetails.status === 'Success') {
        const appeal: Appeal = {
          ...req.session.appeal,
          paymentStatus: 'Paid',
          paymentDate: paymentDetails.status_histories.filter(event => event.status === 'Success')[0].date_created,
          isFeePaymentEnabled: 'Yes'
        };
        req.app.locals.logger.trace(`Payment success`, 'Finishing payment');
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.SUBMIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        res.redirect(paths.appealSubmitted.confirmation);
      } else {
        req.app.locals.logger.exception(`Payment error with status ${paymentDetails.status}`, 'Finishing payment');
      }
    } catch (error) {
      next(error);
    }
  };
}

function setupCheckAndSendController(middleware: Middleware[], updateAppealService: UpdateAppealService, paymentService: PaymentService): Router {
  const router = Router();
  router.get(paths.appealStarted.checkAndSend, middleware, appealOutOfTimeMiddleware, getCheckAndSend);
  router.post(paths.appealStarted.checkAndSend, middleware, postCheckAndSend(updateAppealService, paymentService));
  router.get(paths.common.finishPayment, middleware, getFinishPayment(updateAppealService, paymentService));
  return router;
}

export {
  createSummaryRowsFrom,
  setupCheckAndSendController,
  getCheckAndSend,
  getFinishPayment,
  postCheckAndSend
};
