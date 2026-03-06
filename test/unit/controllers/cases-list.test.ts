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
  let updateAppealService: Partial<UpdateAppealService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
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
        ],
        refreshCasesList: false
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      redirect: sandbox.stub()
    } as unknown as Partial<Response>;

    next = sandbox.stub() as any;

    updateAppealService = {
      loadAppealsList: sandbox.stub().resolves()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render cases-list.njk with cases from session including stateName', async () => {
    await getCasesList(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedCases = [
      {
        id: '1234',
        appealReferenceNumber: 'PA/0001/2022',
        state: 'appealStarted',
        appellantGivenNames: 'John',
        appellantFamilyName: 'Smith',
        stateName: 'Appeal started'
      },
      {
        id: '1235',
        appealReferenceNumber: 'PA/0002/2022',
        state: 'appealSubmitted',
        appellantGivenNames: 'Jane',
        appellantFamilyName: 'Doe',
        stateName: 'Appeal submitted'
      }
    ];

    expect(updateAppealService.loadAppealsList).to.not.have.been.called;
    expect(res.render).to.have.been.calledWith('cases-list.njk', {
      previousPage: paths.common.overview,
      createNewAppealUrl: paths.common.createNewAppeal,
      cases: expectedCases
    });
  });

  it('should refresh cases when refreshCasesList session flag is true', async () => {
    req.session.refreshCasesList = true;

    await getCasesList(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    expect(updateAppealService.loadAppealsList).to.have.been.calledWith(req);
    expect(req.session.refreshCasesList).to.equal(false);
  });

  it('should render with empty array when no casesList in session', async () => {
    req.session.casesList = undefined;

    await getCasesList(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledWith('cases-list.njk', {
      previousPage: paths.common.overview,
      createNewAppealUrl: paths.common.createNewAppeal,
      cases: []
    });
  });

  it('should call next with error on failure', async () => {
    const error = new Error('something went wrong');
    res.render = sandbox.stub().throws(error);

    await getCasesList(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
