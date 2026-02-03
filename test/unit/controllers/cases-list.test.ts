import { NextFunction, Request, Response } from 'express';
import { getCasesList, getCreateNewAppeal, setupCasesListController } from '../../../app/controllers/cases-list';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { expect, sinon } from '../../utils/testUtils';

describe('Cases List Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        casesList: [
          {
            id: '1234',
            appealReferenceNumber: 'PA/0001/2022',
            state: 'appealStarted',
            appellantGivenNames: 'John',
            appellantFamilyName: 'Smith'
          },
          {
            id: '1235',
            appealReferenceNumber: 'PA/0002/2022',
            state: 'appealSubmitted',
            appellantGivenNames: 'Jane',
            appellantFamilyName: 'Doe'
          }
        ]
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      redirect: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as any;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render cases-list.njk with cases from session', () => {
    getCasesList(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledWith('cases-list.njk', {
      previousPage: paths.common.overview,
      createNewAppealUrl: paths.common.createNewAppeal,
      cases: req.session.casesList
    });
  });

  it('should render with empty array when no casesList in session', () => {
    req.session.casesList = undefined;

    getCasesList(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledWith('cases-list.njk', {
      previousPage: paths.common.overview,
      createNewAppealUrl: paths.common.createNewAppeal,
      cases: []
    });
  });

  it('should call next with error on failure', () => {
    const error = new Error('something went wrong');
    res.render = sandbox.stub().throws(error);

    getCasesList(req as Request, res as Response, next);

    expect(next).to.have.been.calledWith(error);
  });

  it('should set up the controller with the correct path', () => {
    const updateAppealService = {} as UpdateAppealService;
    const router = setupCasesListController(updateAppealService);
    expect(router).to.not.be.null;
  });

  describe('getCreateNewAppeal', () => {
    it('should call createNewAppeal and redirect to overview', async () => {
      const mockAppeal = { ccdCaseId: '12345' } as Appeal;
      const updateAppealService = {
        createNewAppeal: sandbox.stub().resolves(mockAppeal)
      } as Partial<UpdateAppealService>;

      await getCreateNewAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.createNewAppeal).to.have.been.calledWith(req);
      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('create failed');
      const updateAppealService = {
        createNewAppeal: sandbox.stub().rejects(error)
      } as Partial<UpdateAppealService>;

      await getCreateNewAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
