import type { Request } from 'express-serve-static-core';
import Logger from '../../../app/utils/logger';
import {
  appealHasNoRemissionOption,
  appealHasRemissionOption,
  getDecisionReasonRowForAppealDetails,
  getFeeSupportStatusForAppealDetails,
  getPaymentStatusRow,
  hasFeeRemissionDecision,
  paymentForAppealHasBeenMade
} from '../../../app/utils/remission-utils';
import { addSummaryRow } from '../../../app/utils/summary-list';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Remission fields utils', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Request<Params>;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: {}
          }
        }
      } as Partial<Appeal>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Request;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('appeal has remission option', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.application.remissionOption = 'asylumSupportFromHo';

    const remissionOptiondata = [
      {
        remissionOption: 'asylumSupportFromHo',
        helpWithFeesOption: null,
        helpWithFeesRefNumber: null,
        expectedResponse: true,
        description: 'asylumSupportFromHo option selected'
      },
      {
        remissionOption: 'feeWaiverFromHo',
        helpWithFeesOption: null,
        helpWithFeesRefNumber: null,
        expectedResponse: true,
        description: 'feeWaiverFromHo option selected'
      },
      {
        remissionOption: 'under18GetSupportFromLocalAuthority',
        helpWithFeesOption: null,
        helpWithFeesRefNumber: null,
        expectedResponse: true,
        description: 'under18GetSupportFromLocalAuthority option selected'
      },
      {
        remissionOption: 'parentGetSupportFromLocalAuthority',
        helpWithFeesOption: null,
        helpWithFeesRefNumber: null,
        expectedResponse: true,
        description: 'parentGetSupportFromLocalAuthority option selected'
      },
      {
        remissionOption: 'noneOfTheseStatements',
        helpWithFeesOption: 'willPayForAppeal',
        helpWithFeesRefNumber: null,
        expectedResponse: false,
        description: 'noneOfTheseStatements option selected'
      },
      {
        remissionOption: 'noneOfTheseStatements',
        helpWithFeesOption: 'wantToApply',
        helpWithFeesRefNumber: 'HWF-123',
        expectedResponse: true,
        description: 'noneOfTheseStatements option selected'
      },
      {
        remissionOption: 'noneOfTheseStatements',
        helpWithFeesOption: 'alreadyApplied',
        helpWithFeesRefNumber: 'HWF-123',
        expectedResponse: true,
        description: 'noneOfTheseStatements option selected'
      },
      {
        remissionOption: 'noneOfTheseStatements',
        helpWithFeesOption: 'alreadyApplied',
        helpWithFeesRefNumber: null,
        expectedResponse: false,
        description: 'noneOfTheseStatements option selected'
      }
    ];

    remissionOptiondata.forEach(({
                                   remissionOption,
                                   helpWithFeesOption,
                                   helpWithFeesRefNumber,
                                   expectedResponse,
                                   description
                                 }) => {
      it(`should be ${description}`, () => {
        appeal.application.remissionOption = remissionOption;
        appeal.application.helpWithFeesOption = helpWithFeesOption;
        appeal.application.helpWithFeesRefNumber = helpWithFeesRefNumber;
        expect(appealHasRemissionOption(appeal.application)).to.be.deep.equal(expectedResponse);
      });
    });
  });

  it('appeal has no remission option', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.application.remissionOption = 'noneOfTheseStatements';
    appeal.application.helpWithFeesOption = 'willPayForAppeal';

    expect(appealHasNoRemissionOption(appeal.application)).to.be.deep.equal(true);
  });

  it('check appeal has or has not remission decision', () => {
    const { appeal } = req.session;
    const remissionOptiondata = [
      {
        remissionDecision: 'approved',
        expectedResponse: true,
        description: 'Decision approved'
      },
      {
        remissionDecision: undefined,
        expectedResponse: false,
        description: 'Decision does not exists'
      },
      {
        remissionDecision: null,
        expectedResponse: false,
        description: 'Decision does not exists'
      },
      {
        remissionDecision: '',
        expectedResponse: false,
        description: 'Decision does not exists'
      }];

    remissionOptiondata.forEach(({
                                   remissionDecision,
                                   expectedResponse,
                                   description
                                 }) => {
      it(`should be ${description}`, () => {
        appeal.application.remissionDecision = remissionDecision;
        expect(hasFeeRemissionDecision(req)).to.be.deep.equal(expectedResponse);
      });
    });
  });

  it('appeal has no remission option', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.application.remissionOption = 'noneOfTheseStatements';
    appeal.application.helpWithFeesOption = 'willPayForAppeal';

    expect(appealHasNoRemissionOption(appeal.application)).to.be.deep.equal(true);
  });

  it('should return proper fee support status for appeal details', () => {
    const { appeal } = req.session;
    const testData = [
      {
        remissionDecision: 'approved',
        expectedResponse: i18n.pages.overviewPage.doThisNext.remissionDecided.feeSupportStatusApproved,
        description: 'Decision approved'
      },
      {
        remissionDecision: 'partiallyApproved',
        expectedResponse: i18n.pages.overviewPage.doThisNext.remissionDecided.feeSupportStatusPartiallyApproved,
        description: 'Decision partiallyApproved'
      },
      {
        remissionDecision: 'rejected',
        expectedResponse: i18n.pages.overviewPage.doThisNext.remissionDecided.feeSupportStatusRefused,
        description: 'Decision rejected'
      },
      {
        remissionDecision: undefined,
        expectedResponse: i18n.pages.overviewPage.doThisNext.remissionDecided.feeSupportStatusRefused,
        description: 'Decision does not exists'
      }
    ];

    testData.forEach(({
                        remissionDecision,
                        expectedResponse,
                        description
                      }) => {
      it(`should be ${description}`, () => {
        appeal.application.remissionDecision = remissionDecision;
        expect(getFeeSupportStatusForAppealDetails(req)).to.be.deep.equal(expectedResponse);
      });
    });
  });

  it('should return proper decision reason row for appeal details', () => {
    const { appeal } = req.session;
    appeal.application.amountLeftToPay = '4000';
    appeal.application.remissionDecisionReason = 'Test reason';
    const testData = [
      {
        remissionDecision: 'approved',
        expectedResponse: [],
        description: 'Decision approved'
      },
      {
        remissionDecision: 'partiallyApproved',
        expectedResponse: [
          addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.reasonForDecision,
            ['Test reason'], null),
          addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.feeToPay, ['£' + '40'], null)
        ],
        description: 'Decision partiallyApproved'
      },
      {
        remissionDecision: 'rejected',
        expectedResponse: [
          addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.reasonForDecision,
            ['Test reason'], null)
        ],
        description: 'Decision rejected'
      }
    ];

    testData.forEach(({
                        remissionDecision,
                        expectedResponse,
                        description
                      }) => {
      it(`should be ${description}`, () => {
        appeal.application.remissionDecision = remissionDecision;
        expect(getDecisionReasonRowForAppealDetails(req)).to.be.deep.equal(expectedResponse);
      });
    });
  });

  it('paymentForAppealHasBeenMade', () => {
    const { appeal } = req.session;
    appeal.history = [
      {
        'id': 'recordRemissionDecision',
        'createdDate': '2024-03-07T15:36:26.099'
      },
      {
        'id': 'recordRemissionDecision',
        'createdDate': '2024-04-07T15:36:26.099'
      },
      {
        'id': 'updateTribunalDecision',
        'createdDate': '2024-03-07T15:36:26.099'
      }
    ] as HistoryEvent[];

    const testData = [
      {
        history: [
          {
            'id': 'recordRemissionDecision',
            'createdDate': '2024-03-07T15:36:26.099'
          },
          {
            'id': 'recordRemissionDecision',
            'createdDate': '2024-04-07T15:36:26.099'
          },
          {
            'id': 'updateTribunalDecision',
            'createdDate': '2024-03-07T15:36:26.099'
          }
        ] as HistoryEvent[],
        expectedResponse: false,
        description: 'False'
      },
      {
        history: [
          {
            'id': 'paymentAppeal',
            'createdDate': '2024-03-07T15:36:26.099'
          }
        ] as HistoryEvent[],
        expectedResponse: true,
        description: 'True'
      }];

    testData.forEach(({
                        history,
                        expectedResponse,
                        description
                      }) => {
      it(`should be ${description}`, () => {
        expect(paymentForAppealHasBeenMade(req)).to.be.deep.equal(expectedResponse);
      });
    });
  });

  it('getPaymentStatusRow', () => {
    const { appeal } = req.session;
    appeal.paymentStatus = 'Paid';
    const testData = [
      {
        isLateRemissionRequest: false,
        remissionDecision: 'approved',
        history: [
          {
            'id': 'recordRemissionDecision',
            'createdDate': '2024-04-07T15:36:26.099'
          }
        ] as HistoryEvent[],
        response: 'No payment needed',
        description: 'No payment needed'
      },
      {
        isLateRemissionRequest: false,
        remissionDecision: 'partiallyApproved',
        history: [
          {
            'id': 'recordRemissionDecision',
            'createdDate': '2024-04-07T15:36:26.099'
          }
        ] as HistoryEvent[],
        response: 'Not paid',
        description: 'Not paid'
      },
      {
        isLateRemissionRequest: false,
        remissionDecision: 'partiallyApproved',
        history: [
          {
            'id': 'rejected',
            'createdDate': '2024-04-07T15:36:26.099'
          }
        ] as HistoryEvent[],
        response: 'Not paid',
        description: 'Not paid'
      },
      {
        remissionDecision: null,
        history: null,
        response: 'Paid',
        description: 'Paid'
      },
      {
        isLateRemissionRequest: true,
        remissionDecision: 'partiallyApproved',
        history: [
          {
            'id': 'recordRemissionDecision',
            'createdDate': '2024-04-07T15:36:26.099'
          },
          {
            'id': 'paymentAppeal',
            'createdDate': '2024-04-07T15:32:26.099'
          }
        ] as HistoryEvent[],
        response: 'To be refunded',
        description: 'To be refunded'
      },
      {
        isLateRemissionRequest: true,
        remissionDecision: 'approved',
        history: [
          {
            'id': 'recordRemissionDecision',
            'createdDate': '2024-04-07T15:36:26.099'
          },
          {
            'id': 'paymentAppeal',
            'createdDate': '2024-04-07T15:32:26.099'
          }
        ] as HistoryEvent[],
        response: 'To be refunded',
        description: 'To be refunded'
      },
      {
        isLateRemissionRequest: true,
        remissionDecision: 'rejected',
        history: [
          {
            'id': 'recordRemissionDecision',
            'createdDate': '2024-04-07T15:36:26.099'
          },
          {
            'id': 'paymentAppeal',
            'createdDate': '2024-04-07T15:32:26.099'
          }
        ] as HistoryEvent[],
        response: 'Paid',
        description: 'Paid'
      },
      {
        isLateRemissionRequest: false,
        remissionDecision: 'rejected',
        history: [
          {
            'id': 'recordRemissionDecision',
            'createdDate': '2024-04-07T15:36:26.099'
          },
          {
            'id': 'markAppealPaid',
            'createdDate': '2024-04-07T15:32:26.099'
          }
        ] as HistoryEvent[],
        response: 'Paid',
        description: 'Paid'
      }
    ];

    testData.forEach(({
                        remissionDecision,
                        history,
                        response,
                        description,
                        isLateRemissionRequest
                      }) => {
      appeal.application.remissionDecision = remissionDecision;
      appeal.application.isLateRemissionRequest = isLateRemissionRequest;
      appeal.history = history;
      expect(getPaymentStatusRow(req)).to.be.deep.equal(response);
    });
  });
});
