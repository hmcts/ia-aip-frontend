import express, { NextFunction, Request, Response } from 'express';
import {
  getCheckAndSend,
  postCheckAndSend,
  setupCheckAndSendController
} from '../../../../app/controllers/case-building/check-and-send';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { addSummaryRow, Delimiter } from '../../../../app/utils/summary-list';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Case Building - Check and send Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  let routerGetStub: sinon.SinonStub;
  let routerPostStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {},
          caseBuilding: {
            applicationReason: 'a reason'
          }
        } as Partial<Appeal>
      } as Partial<Express.Session>
    } as Partial<Request>;

    res = {
      redirect: sandbox.spy(),
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    routerGetStub = sandbox.stub(express.Router as never, 'get');
    routerPostStub = sandbox.stub(express.Router as never, 'post');
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupCheckAndSendController', () => {
    it('should setup the routes', () => {
      setupCheckAndSendController(updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.reasonForAppeal.checkAndSend);
      expect(routerPostStub).to.have.been.calledWith(paths.reasonForAppeal.checkAndSend);
    });
  });

  describe('getCheckAndSend', () => {
    it('should render case-building/reasons-for-appeal/check-and-send-page.njk with supporting evidences', () => {
      const summaryRows = [
        addSummaryRow(i18n.common.cya.questionRowTitle, [ i18n.pages.reasonForAppeal.heading ], null),
        addSummaryRow(i18n.common.cya.answerRowTitle, [ req.session.appeal.caseBuilding.applicationReason ], paths.reasonForAppeal.reason),
        addSummaryRow(i18n.common.cya.supportingEvidenceRowTitle, [ 'File1.png', 'File2.png' ], paths.reasonForAppeal.supportingEvidenceUpload, Delimiter.BREAK_LINE)
      ];
      req.session.appeal.caseBuilding.evidences = {
        '1-File1.png': {
          'id': '1-File1.png',
          'url': '#',
          'name': 'File1.png'
        },
        '2-File2.png': {
          'id': '2-File2.png',
          'url': '#',
          'name': 'File2.png'
        }
      };

      getCheckAndSend(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('case-building/reasons-for-appeal/check-and-send-page.njk', {
        summaryRows,
        previousPage: paths.reasonForAppeal.reason
      });
    });

    it('should render case-building/reasons-for-appeal/check-and-send-page.njk without supporting evidences', () => {
      const summaryRows = [
        addSummaryRow(i18n.common.cya.questionRowTitle, [ i18n.pages.reasonForAppeal.heading ], null),
        addSummaryRow(i18n.common.cya.answerRowTitle, [ req.session.appeal.caseBuilding.applicationReason ], paths.reasonForAppeal.reason)
      ];

      getCheckAndSend(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('case-building/reasons-for-appeal/check-and-send-page.njk', {
        summaryRows,
        previousPage: paths.reasonForAppeal.reason
      });
    });

    it('should call next with error render if something happens', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getCheckAndSend(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postCheckAndSend', () => {
    it('should redirect to confirmation page when click save and continue', async () => {
      req.body = {};
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(updateAppealService.submitEvent).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.reasonForAppeal.confirmation);
    });

    it('should redirect to timeline page when click save for later', async () => {
      req.body = { saveForLater: 'saveForLater' };
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.caseBuilding.timeline);
    });

    it('should call next with error render if someting happens', async () => {
      req.body = {};
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
