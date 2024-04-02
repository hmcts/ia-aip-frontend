import { NextFunction, Request, Response } from 'express';
import {
  createSummaryRowsFrom,
  getCheckYourAnswersRefund,
  postCheckYourAnswersRefund,
  setupCheckYourAnswersRefundController
} from '../../../../app/controllers/ask-for-fee-remission/check-your-answers-refund';

import { FEATURE_FLAGS } from '../../../../app/data/constants';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { addSummaryRow } from '../../../../app/utils/summary-list';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

function getMockedSummaryRows(appealType = 'protection'): SummaryRow[] {
  return [{
    key: { text: 'In the UK' },
    value: { html: 'No' },
    actions: { items: [{ href: '/in-the-uk?edit', text: 'Change' }] }
  }, {
    key: { text: 'Appeal type' },
    value: { html: 'Protection' },
    actions: { items: [{ href: '/appeal-type?edit', text: 'Change' }] }
  }, {
    key: { text: 'What date did you leave the UK after your Protection claim was refused?' },
    value: { html: '19 February 2022' },
    actions: { items: [{ href: '/ooc-protection-departure-date?edit', text: 'Change' }] }
  }, {
    key: { text: 'Outside UK when application was made' },
    value: { html: 'No' },
    actions: { items: [{ href: '/ooc-hr-eea?edit', text: 'Change' }] }
  }, {
    key: { text: 'Home Office reference number' },
    value: { html: 'A1234567' },
    actions: { items: [{ href: '/home-office-reference-number?edit', text: 'Change' }] }
  }, {
    key: { text: 'Date letter received' },
    value: { html: '16 February 2020' },
    actions: { items: [{ href: '/date-letter-received?edit', text: 'Change' }] }
  }, {
    key: { text: 'Address' },
    value: { html: '28 The Street, Ukraine, 2378' },
    actions: { items: [{ href: '/out-of-country-address?edit', text: 'Change' }] }
  }, {
    key: { text: 'Contact details' },
    value: { html: 'pedro.jimenez@example.net<br>07123456789' },
    actions: { items: [{ href: '/contact-preferences?edit', text: 'Change' }] }
  }, {
    key: { text: 'Sponsor' },
    value: { html: 'Yes' },
    actions: { items: [{ href: '/has-sponsor?edit', text: 'Change' }] }
  }, {
    key: { text: 'Sponsor\'s name' },
    value: { html: 'Frank Smith' },
    actions: { items: [{ href: '/sponsor-name?edit', text: 'Change' }] }
  }, {
    key: { text: 'Sponsor\'s address' },
    value: { html: '39 The Street,<br>Ashtead<br>United Kingdom<br>KT21 1AA' },
    actions: { items: [{ href: '/sponsor-address?edit', text: 'Change' }] }
  }, {
    key: { text: 'Sponsor\'s contact details' },
    value: { html: 'frank.smith@example.net<br>07177777777' },
    actions: { items: [{ href: '/sponsor-contact-preferences?edit', text: 'Change' }] }
  }, {
    key: { text: 'Sponsor has access to information' },
    value: { html: 'Yes' },
    actions: { items: [{ href: '/sponsor-authorisation?edit', text: 'Change' }] }
  }, {
    key: { text: 'Appeal type' },
    value: { html: i18n.appealTypes[appealType].name },
    actions: { items: [{ href: '/appeal-type?edit', text: 'Change' }] }
  }, {
    key: { text: 'Home Office decision letter' },
    value: { html: '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/anId\'>name</a>' },
    actions: { items: [{ href: '/home-office-upload-decision-letter?edit', text: 'Change' }] }
  }, {
    key: { text: 'Name' },
    value: { html: 'Pedro Jimenez' },
    actions: { items: [{ href: '/name?edit', text: 'Change' }] }
  }, {
    key: { text: 'Date of birth' },
    value: { html: '10 October 1980' },
    actions: { items: [{ href: '/date-birth?edit', text: 'Change' }] }
  }, {
    key: { text: 'Nationality' },
    value: { html: 'Austria' },
    actions: { items: [{ href: '/nationality?edit', text: 'Change' }] }
  }];
}

describe('CYA Refund Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            isAppealLate: false
          }
        }
      } as Partial<Express.Session>,
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    updateAppealService = {
      submitEventRefactored: sandbox.stub().returns({
        state: 'appealSubmitted',
        case_data: { appealReferenceNumber: 'PA/1234567' }
      })
    };

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupCheckYourAnswersRefundController', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(true);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];

      setupCheckYourAnswersRefundController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.checkYourAnswersRefund);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealSubmitted.checkYourAnswersRefund);
    });

    it('should render check-and-send.njk', async () => {
      req.session.appeal.application.lateRemissionOption = 'feeWaiverFromHo';
      const summaryRows = [{
        'key': {
          'text': 'Fee statement'
        },
        'value': {
          'html': 'I got a fee waiver from the Home Office for my application to stay in the UK'
        },
        'actions': {
          'items': [
            {
              'href': '/fee-support-refund?edit',
              'text': 'Change'
            }
          ]
        }
      }];
      await getCheckYourAnswersRefund(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('ask-for-fee-remission/check-and-send.njk', {
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        summaryRows
      });
    });

    it('should redirect to confirmation-refund page', async () => {
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          refundRequested: true
        }
      };

      await postCheckYourAnswersRefund(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.REQUEST_FEE_REMISSION, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.confirmationRefund);
    });

    it('should create fee rows when fee support values are present and dlrm-refund set aside enabled', async () => {
      req.session.appeal.application.lateRemissionOption = 'asylumSupportFromHo';
      req.session.appeal.application.lateAsylumSupportRefNumber = 'refNumber';
      req.session.appeal.application.lateHelpWithFeesRefNumber = 'HWF12345';
      req.session.appeal.application.lateLocalAuthorityLetters = [{ fileId: 'fileId', name: 'filename' }];
      const editParameter = '?edit';
      const fileLine = `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/fileId'>filename</a>`;

      const rows: any[] = await createSummaryRowsFrom(req as Request);
      const asylumSupportRefNumberRow = addSummaryRow('Asylum support reference number', ['refNumber'], paths.appealSubmitted.asylumSupportRefund + editParameter);
      const helpWithFeesRefNumberRow = addSummaryRow('Help with fees reference number', ['HWF12345'], paths.appealSubmitted.helpWithFeesReferenceNumberRefund + editParameter);
      const localAuthorityLettersRow = addSummaryRow('Local authority letter', [fileLine], paths.appealSubmitted.localAuthorityLetterRefund + editParameter);
      const mockedRows: SummaryRow[] = getMockedSummaryRows();

      mockedRows.push(asylumSupportRefNumberRow);
      mockedRows.push(helpWithFeesRefNumberRow);
      mockedRows.push(localAuthorityLettersRow);

      const helpWithFeesOptionTestData = [
        {
          input: 'wantToApply',
          expectedResponse: 'I want to apply for help with fees'
        },
        {
          input: 'alreadyApplied',
          expectedResponse: 'I have already applied for help with fees'
        }
      ];

      const remissionOptionTestData = [
        {
          input: 'asylumSupportFromHo',
          expectedResponse: 'I get asylum support from the Home Office'
        },
        {
          input: 'feeWaiverFromHo',
          expectedResponse: 'I got a fee waiver from the Home Office for my application to stay in the UK'
        },
        {
          input: 'under18GetSupportFromLocalAuthority',
          expectedResponse: 'I am under 18 and get housing or other support from the local authority'
        },
        {
          input: 'parentGetSupportFromLocalAuthority',
          expectedResponse: 'I am the parent, guardian or sponsor of someone under 18 who gets housing or other support from the local authority'
        },
        {
          input: 'iWantToGetHelpWithFees',
          expectedResponse: 'None of these statements apply to me'
        }
      ];

      helpWithFeesOptionTestData.forEach(({ input, expectedResponse }) => {
        req.session.appeal.application.lateHelpWithFeesOption = input;
        const helpWithFeesRow = addSummaryRow('Help with fees', [expectedResponse], paths.appealSubmitted.helpWithFeesRefund + editParameter);
        mockedRows.push(helpWithFeesRow);

        remissionOptionTestData.forEach(({ input, expectedResponse }) => {
          it('Should correctly build the rows', () => {
            req.session.appeal.application.lateRemissionOption = input;
            const remissionOptionRow = addSummaryRow('Fee statement', [expectedResponse], paths.appealSubmitted.feeSupportRefund + editParameter);
            mockedRows.push(remissionOptionRow);
            expect(rows).to.be.deep.equal(mockedRows);
            mockedRows.pop();
          });
        });
        mockedRows.pop();
      });
    });
  });

  describe('When Flag is switched off expectations', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(false);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await getCheckYourAnswersRefund(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await postCheckYourAnswersRefund(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });
});
