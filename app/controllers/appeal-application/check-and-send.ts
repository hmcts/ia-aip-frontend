import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import i18n from '../../../locale/en.json';
import { appealTypes } from '../../data/appeal-types';
import { FEATURE_FLAGS } from '../../data/constants';
import { countryList } from '../../data/country-list';
import { Events } from '../../data/events';
import { appealOutOfTimeMiddleware } from '../../middleware/outOfTime-middleware';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import PaymentService from '../../service/payments-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getFee, payNowForApplicationNeeded } from '../../utils/payments-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { formatTextForCYA } from '../../utils/utils';
import { statementOfTruthValidation } from '../../utils/validations/fields-validations';

async function createSummaryRowsFrom(req: Request) {
  const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
  const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
  const { application } = req.session.appeal;
  const appealTypeNames: string[] = application.appealType.split(',').map(appealTypeInstance => {
    return i18n.appealTypes[appealTypeInstance].name;
  });
  const nationality = application.personalDetails.stateless === 'isStateless' ? 'Stateless' : countryList.find(country => country.value === application.personalDetails.nationality).name;
  const appealType = appealTypes.find(appeal => appeal.value === application.appealType).name;
  const editParameter = '?edit';
  const appellantInUk: boolean = (application.appellantInUk === 'Yes') || false;

  const rows = [
    addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.appellantInUk,
        [ application.appellantInUk ],
        paths.appealStarted.appealOutOfCountry + editParameter
    ),
    addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.appealType,
        [appealType],
        paths.appealStarted.typeOfAppeal + editParameter
    )
  ];

  if (application.dateClientLeaveUk && application.dateClientLeaveUk.year && application.appealType === 'protection') {
    const decisionLetterReceivedDateRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.whatDateDidYouLeaveTheUKAfterYourProtectionClaimWasRefused,
        [application.dateClientLeaveUk.day, moment.months(parseInt(application.dateClientLeaveUk.month, 10) - 1), application.dateClientLeaveUk.year],
        paths.appealStarted.oocProtectionDepartureDate + editParameter,
        Delimiter.SPACE);
    rows.push(decisionLetterReceivedDateRow);
  }

  if (application.outsideUkWhenApplicationMade && application.outsideUkWhenApplicationMade !== null) {
    const gwfReferenceNumberRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.outsideUKWhenApplicationWasMade,
        [application.outsideUkWhenApplicationMade],
        paths.appealStarted.oocHrEea + editParameter);
    rows.push(gwfReferenceNumberRow);
  }

  if (application.dateClientLeaveUk && application.dateClientLeaveUk.year && application.appealType !== 'protection') {
    const decisionLetterReceivedDateRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.whatDateDidYouLeaveTheUKAfterYourApplicationToStayInTheCountryWasRefused,
        [application.dateClientLeaveUk.day, moment.months(parseInt(application.dateClientLeaveUk.month, 10) - 1), application.dateClientLeaveUk.year],
        paths.appealStarted.oocHrInside + editParameter,
        Delimiter.SPACE);
    rows.push(decisionLetterReceivedDateRow);
  }

  if (application.gwfReferenceNumber && application.gwfReferenceNumber !== null) {
    const gwfReferenceNumberRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.gwfReferenceNumber,
        [application.gwfReferenceNumber],
        paths.appealStarted.gwfReference + editParameter);
    rows.push(gwfReferenceNumberRow);
  } else {
    const homeOfficeRefNumberRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber,
        [application.homeOfficeRefNumber],
        paths.appealStarted.details + editParameter);
    rows.push(homeOfficeRefNumberRow);
  }

  if (application.decisionLetterReceivedDate && application.decisionLetterReceivedDate.year) {
    const decisionLetterReceivedDateRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.dateLetterReceived,
        [application.decisionLetterReceivedDate.day, moment.months(parseInt(application.decisionLetterReceivedDate.month, 10) - 1), application.decisionLetterReceivedDate.year],
        paths.appealStarted.letterReceived + editParameter,
        Delimiter.SPACE);
    rows.push(decisionLetterReceivedDateRow);
  } else {
    const dateLetterSentRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.dateLetterSent,
        [application.dateLetterSent.day, moment.months(parseInt(application.dateLetterSent.month, 10) - 1), application.dateLetterSent.year],
        paths.appealStarted.letterSent + editParameter,
        Delimiter.SPACE);
    rows.push(dateLetterSentRow);
  }

  const rowsCont = [
    addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.homeOfficeDecisionLetter,
        application.homeOfficeLetter.map(evidence => `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`),
        paths.appealStarted.homeOfficeDecisionLetter + editParameter,
        Delimiter.BREAK_LINE
    ),
    addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.name,
        [application.personalDetails.givenNames, application.personalDetails.familyName],
        paths.appealStarted.name + editParameter,
        Delimiter.SPACE
    ),
    addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.dob,
        [application.personalDetails.dob.day, moment.months(parseInt(application.personalDetails.dob.month, 10) - 1), application.personalDetails.dob.year],
        paths.appealStarted.dob + editParameter,
        Delimiter.SPACE
    ),
    addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.nationality,
        [ nationality ],
        paths.appealStarted.nationality + editParameter
    )
  ];

  if (application.appellantInUk) {

    if (appellantInUk) {
      const addressInUk = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.addressDetails,
          [...Object.values(application.personalDetails.address)],
          paths.appealStarted.enterAddress + editParameter,
          Delimiter.BREAK_LINE);
      rows.push(addressInUk);
    }

    if (!appellantInUk && application.appellantOutOfCountryAddress) {
      const oocAddress = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.addressDetails,
          [...Object.values(application.appellantOutOfCountryAddress)],
          paths.appealStarted.oocAddress + editParameter);
      rows.push(oocAddress);
    }

    const contactDetails = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.contactDetails,
        [ application.contactDetails.email, application.contactDetails.phone ],
        paths.appealStarted.contactDetails + editParameter,
        Delimiter.BREAK_LINE);

    rows.push(contactDetails);
  }

  if (application.hasSponsor) {

    const hasSponsor = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.hasSponsor,
        [...Object.values(application.hasSponsor)],
        paths.appealStarted.hasSponsor + editParameter);
    rows.push(hasSponsor);

    if (['Yes'].includes(application.hasSponsor)) {

      const hasSponsorName = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.sponsorNameForDisplay,
          [...Object.values(application.sponsorNameForDisplay)],
          paths.appealStarted.sponsorName + editParameter);

      const hasSponsorAddress = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.sponsorAddressDetails,
          [...Object.values(application.sponsorAddress)],
          paths.appealStarted.sponsorAddress + editParameter,
          Delimiter.BREAK_LINE);

      const hasSponsorContactDetails = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.sponsorContactDetails,
          [ application.sponsorContactDetails.email, application.sponsorContactDetails.phone ],
          paths.appealStarted.sponsorContactDetails + editParameter,
          Delimiter.BREAK_LINE);

      const hasSponsorAuthorisation = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.sponsorAuthorisation,
          [...Object.values(application.sponsorAuthorisation)],
          paths.appealStarted.sponsorAuthorisation + editParameter);

      rows.push(hasSponsorName);
      rows.push(hasSponsorAddress);
      rows.push(hasSponsorContactDetails);
      rows.push(hasSponsorAuthorisation);
    }

    const appealTypeRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealType,
        [appealTypeNames],
        paths.appealStarted.typeOfAppeal + editParameter,
        Delimiter.BREAK_LINE);
    rows.push(appealTypeRow);
  }

  rows.push(...rowsCont);

  if (paymentsFlag) {
    let decisionType: string;
    if (['revocationOfProtection', 'deprivation'].includes(application.appealType)) {
      decisionType = req.session.appeal.application.rpDcAppealHearingOption;
    } else if (['protection', 'refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].includes(application.appealType)) {
      decisionType = req.session.appeal.application.decisionHearingFeeOption;
    }
    const decisionTypeRow = addSummaryRow(i18n.pages.checkYourAnswers.decisionType, [i18n.pages.checkYourAnswers[decisionType]], paths.appealStarted.decisionType);
    rows.push(decisionTypeRow);

    const { paAppealTypeAipPaymentOption = null } = req.session.appeal;
    if (paAppealTypeAipPaymentOption) {
      const payNowRow = addSummaryRow(
          i18n.pages.checkYourAnswers.rowTitles.paymentType,
          [i18n.pages.checkYourAnswers[paAppealTypeAipPaymentOption]],
          paths.appealStarted.payNow + editParameter
      );
      rows.push(payNowRow);
    }
  }

  if (dlrmFeeRemissionFlag) {
    const application = req.session.appeal.application;
    const remissionOption = application.remissionOption;
    const asylumSupportRefNumber = application.asylumSupportRefNumber;
    const helpWithFeesOption = application.helpWithFeesOption;
    const helpWithFeesRefNumber = application.helpWithFeesRefNumber;
    const localAuthorityLetter = application.localAuthorityLetters;
    if (remissionOption) {
      const feeStatementRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.feeStatement,
        [i18n.pages.remissionOptionPage.options[remissionOption].text],
          paths.appealStarted.feeSupport + editParameter
      );
      rows.push(feeStatementRow);
    }
    if (asylumSupportRefNumber) {
      const asylumSupportRefNumberRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.asylumSupportRefNumber,
        [asylumSupportRefNumber],
        paths.appealStarted.asylumSupport + editParameter
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
        paths.appealStarted.helpWithFees + editParameter
      );
      rows.push(helpWithFeesRow);
    }
    if (helpWithFeesRefNumber) {
      const helpWithFeeRefNumberRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.helpWithFeesRefNumber,
        [helpWithFeesRefNumber],
        paths.appealStarted.helpWithFeesReferenceNumber + editParameter
      );
      rows.push(helpWithFeeRefNumberRow);
    }
    if (localAuthorityLetter && localAuthorityLetter.length > 0) {
      const localAuthorityLetterRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.localAuthorityLetter,
        application.localAuthorityLetters.map(evidence => `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`),
        paths.appealStarted.localAuthorityLetter + editParameter,
        Delimiter.BREAK_LINE
      );
      rows.push(localAuthorityLetterRow);
    }
  }

  if (application.isAppealLate) {
    const lateAppealValue = [formatTextForCYA(application.lateAppeal.reason)];
    if (application.lateAppeal.evidence) {
      const urlHtml = `<p class="govuk-!-font-weight-bold">${i18n.pages.checkYourAnswers.rowTitles.supportingEvidence}</p><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${application.lateAppeal.evidence.fileId}'>${application.lateAppeal.evidence.name}</a>`;
      lateAppealValue.push(urlHtml);
    }
    const lateAppealRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealLate, lateAppealValue, paths.appealStarted.appealLate);
    rows.push(lateAppealRow);
  }

  return rows;
}

function getCheckAndSend(paymentService: PaymentService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultFlag = (process.env.DEFAULT_LAUNCH_DARKLY_FLAG === 'true');
      const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, defaultFlag);
      const summaryRows = await createSummaryRowsFrom(req);
      const { paymentReference = null } = req.session.appeal;
      let fee;
      let appealPaid;
      const payNow = payNowForApplicationNeeded(req);
      if (paymentsFlag && payNow) {
        fee = getFee(req.session.appeal);
        const paymentDetails = paymentReference ? JSON.parse(await paymentService.getPaymentDetails(req, paymentReference)) : null;
        appealPaid = paymentDetails && paymentDetails.status === 'Success';
      }
      return res.render('appeal-application/check-and-send.njk', {
        summaryRows,
        previousPage: paths.appealStarted.taskList,
        ...(paymentsFlag && payNow) && { fee: fee.calculated_amount },
        ...(paymentsFlag && !appealPaid) && { payNow },
        ...(paymentsFlag && appealPaid) && { appealPaid }
      });
    } catch (error) {
      next(error);
    }
  };
}

function postCheckAndSend(updateAppealService: UpdateAppealService, paymentService: PaymentService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body;
    try {
      const defaultFlag = (process.env.DEFAULT_LAUNCH_DARKLY_FLAG === 'true');
      const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, defaultFlag);
      const payNow = payNowForApplicationNeeded(req);
      const validationResult = statementOfTruthValidation(request);
      if (validationResult) {
        const summaryRows = await createSummaryRowsFrom(req);
        const { paymentReference = null } = req.session.appeal;
        let appealPaid;
        let fee;
        if (paymentsFlag && payNow) {
          fee = getFee(req.session.appeal);
          const paymentDetails = paymentReference ? JSON.parse(await paymentService.getPaymentDetails(req, paymentReference)) : null;
          appealPaid = paymentDetails && paymentDetails.status === 'Success';
        }
        return res.render('appeal-application/check-and-send.njk', {
          summaryRows,
          error: validationResult,
          ...(paymentsFlag && payNow) && { fee: fee.calculated_amount },
          ...(paymentsFlag && !appealPaid) && { payNow },
          ...(paymentsFlag && appealPaid) && { appealPaid },
          errorList: Object.values(validationResult),
          previousPage: paths.appealStarted.taskList
        });
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

function getPayLater(paymentService: PaymentService, payingImmediately: boolean) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
      if (!paymentsFlag) return res.redirect(paths.common.overview);
      const fee = getFee(req.session.appeal);
      req.session.payingImmediately = payingImmediately;
      return await paymentService.initiatePayment(req, res, fee);
    } catch (error) {
      next(error);
    }
  };
}

function getFinishPayment(updateAppealService: UpdateAppealService, paymentService: PaymentService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let event;
      let redirectUrl;
      const paymentDetails = JSON.parse(await paymentService.getPaymentDetails(req, req.session.appeal.paymentReference));

      if (paymentDetails.status === 'Success') {
        const appeal: Appeal = {
          ...req.session.appeal,
          paymentStatus: 'Paid',
          paymentDate: paymentDetails.status_histories.filter(event => event.status === 'Success')[0].date_created,
          isFeePaymentEnabled: 'Yes'
        };
        req.app.locals.logger.trace(`Payment success`, 'Finishing payment');
        if (req.session.appeal.appealStatus === 'appealStarted') {
          event = Events.SUBMIT_APPEAL;
          redirectUrl = paths.appealSubmitted.confirmation;
        } else {
          event = Events.PAYMENT_APPEAL;
          redirectUrl = paths.common.confirmationPayment;
        }
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(event, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(redirectUrl);
      } else {
        req.app.locals.logger.exception(`Payment error with status ${paymentDetails.status}`, 'Finishing payment');
        const url = req.session.appeal.appealStatus === 'appealStarted' ? paths.appealStarted.checkAndSend : paths.common.overview;
        return res.redirect(url);
      }
    } catch (error) {
      next(error);
    }
  };
}

function setupCheckAndSendController(middleware: Middleware[], updateAppealService: UpdateAppealService, paymentService: PaymentService): Router {
  const router = Router();
  router.get(paths.appealStarted.checkAndSend, middleware, appealOutOfTimeMiddleware, getCheckAndSend(paymentService));
  router.post(paths.appealStarted.checkAndSend, middleware, postCheckAndSend(updateAppealService, paymentService));
  router.get(paths.common.finishPayment, middleware, getFinishPayment(updateAppealService, paymentService));
  router.get(paths.common.payLater, middleware, getPayLater(paymentService, false));
  router.get(paths.common.payImmediately, middleware, getPayLater(paymentService, true));
  return router;
}

export {
  createSummaryRowsFrom,
  setupCheckAndSendController,
  getCheckAndSend,
  getFinishPayment,
  getPayLater,
  postCheckAndSend
};
