import express, { NextFunction, Request, Response } from 'express';
import {
  getAppealDetailsViewer,
  getReasonsForAppealViewer,
  setupDetailViewersController
} from '../../../app/controllers/detail-viewers';
import { paths } from '../../../app/paths';
import { addSummaryRowNoChange, Delimiter } from '../../../app/utils/summary-list';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';
import { expectedMultipleEventsData } from '../mockData/events/expectations';

describe('Reasons For Appeal - Check and send Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let routerGetStub: sinon.SinonStub;
  let routerPostStub: sinon.SinonStub;

  const editParameter = '?edit';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {},
          reasonsForAppeal: {
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
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDetailViewersController', () => {
    it('should setup the routes', () => {
      setupDetailViewersController();
      expect(routerGetStub).to.have.been.calledWith(paths.detailsViewers.appealDetails);
      expect(routerGetStub).to.have.been.calledWith(paths.detailsViewers.reasonsForAppeal);
    });
  });

  describe('getCheckAndSend', () => {
    it('should render detail-viewers/appeal-details-viewer.njk', () => {

      req.session.appeal.history = expectedMultipleEventsData;

      const summaryRows = [
        addSummaryRowNoChange(i18n.pages.overviewPage.timeline.reasonsForAppealCheckAnswersHistory.whyYouThinkHomeOfficeIsWrong, ['HELLO']),
        addSummaryRowNoChange(i18n.pages.reasonsForAppealUpload.title, [ '404 1.png<br>500.png' ], Delimiter.BREAK_LINE)
      ];
      getReasonsForAppealViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/reasons-for-appeal-details-viewer.njk', {
        data: summaryRows,
        previousPage: paths.overview
      });
    });
  });
});
