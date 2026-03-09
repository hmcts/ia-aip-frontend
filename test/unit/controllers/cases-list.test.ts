import { NextFunction, Request, Response } from 'express';
import { getCasesList, setupCasesListController } from '../../../app/controllers/cases-list';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';
const proxyquire = require('proxyquire').noCallThru();

describe('Cases List Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  const appealStartedCase = {
    id: '1234',
    appealReferenceNumber: 'PA/0001/2022',
    state: 'appealStarted',
    appellantGivenNames: 'John',
    appellantFamilyName: 'Smith',
    stateName: 'Appeal started'
  };
  const appealSubmittedCase = {
    id: '1235',
    appealReferenceNumber: 'PA/0002/2022',
    state: 'appealSubmitted',
    appellantGivenNames: 'Jane',
    appellantFamilyName: 'Doe'
  };
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
            appellantFamilyName: 'Smith',
            stateName: 'Appeal started'
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
    const expectedCases = [appealStartedCase, appealSubmittedCase];
    expect(updateAppealService.loadAppealsList).to.not.have.been.called;
    expect(res.render).to.have.been.calledWith('cases-list.njk', {
      previousPage: paths.common.overview,
      createNewAppealUrl: paths.common.createNewAppeal,
      cases: expectedCases,
      description: i18n.pages.casesList.createAppealModal.description.replace('{{ maxDraftAppeals }}', 'MAX_DRAFT_APPEALS')
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
      cases: [],
      description: i18n.pages.casesList.createAppealModal.description.replace('{{ maxDraftAppeals }}', 'MAX_DRAFT_APPEALS')
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
    let getCreateNewAppeal;
    let configStub;
    beforeEach(() => {
      configStub = {
        get: sandbox.stub().returns(5)
      };
      getCreateNewAppeal = proxyquire('../../../app/controllers/cases-list', { config: configStub }).getCreateNewAppeal;
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call createNewAppeal and redirect to overview', async () => {
      const mockAppeal = { ccdCaseId: '12345' } as Appeal;
      const updateAppealService = {
        createNewAppeal: sandbox.stub().resolves(mockAppeal)
      } as Partial<UpdateAppealService>;

      await getCreateNewAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.createNewAppeal).to.have.been.calledWith(req);
      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('should render error if more than max draft cases', async () => {
      const expectedCases = [
        appealStartedCase,
        appealStartedCase,
        appealStartedCase,
        appealStartedCase,
        appealStartedCase
      ];
      req.session.casesList = expectedCases;
      updateAppealService.createNewAppeal = sandbox.spy();
      await getCreateNewAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const expectedError = {
        key: 'create-new-appeal',
        text: i18n.pages.casesList.tooManyDraftsError,
        href: '#create-new-appeal'
      };
      expect(updateAppealService.createNewAppeal).to.not.be.calledWith(sinon.match.any);
      expect(res.redirect).to.not.be.calledWith(paths.common.overview);
      expect(res.render).to.have.been.calledWith('cases-list.njk', {
        previousPage: paths.common.overview,
        createNewAppealUrl: paths.common.createNewAppeal,
        cases: expectedCases,
        description: i18n.pages.casesList.createAppealModal.description.replace('{{ maxDraftAppeals }}', '5'),
        errors: { 'create-new-appeal': expectedError },
        errorList: [expectedError]
      });
    });


    it('should render error if more than max draft cases with config env variable changed', async () => {
      const expectedCases = [
        appealStartedCase
      ];
      req.session.casesList = expectedCases;
      updateAppealService.createNewAppeal = sandbox.spy();
      configStub = {
        get: sandbox.stub().returns(1)
      };
      getCreateNewAppeal = proxyquire('../../../app/controllers/cases-list', { config: configStub }).getCreateNewAppeal;
      await getCreateNewAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const expectedError = {
        key: 'create-new-appeal',
        text: i18n.pages.casesList.tooManyDraftsError,
        href: '#create-new-appeal'
      };
      expect(updateAppealService.createNewAppeal).to.not.be.calledWith(sinon.match.any);
      expect(res.redirect).to.not.be.calledWith(paths.common.overview);
      expect(res.render).to.have.been.calledWith('cases-list.njk', {
        previousPage: paths.common.overview,
        createNewAppealUrl: paths.common.createNewAppeal,
        cases: expectedCases,
        description: i18n.pages.casesList.createAppealModal.description.replace('{{ maxDraftAppeals }}', '1'),
        errors: { 'create-new-appeal': expectedError },
        errorList: [expectedError]
      });
    });

    it('should not render error if less than max draft cases', async () => {
      req.session.casesList = [
        appealStartedCase,
        appealStartedCase,
        appealStartedCase,
        appealSubmittedCase,
        appealSubmittedCase,
        appealSubmittedCase,
        appealSubmittedCase,
        appealSubmittedCase,
        appealSubmittedCase,
        appealSubmittedCase,
        appealSubmittedCase,
        appealStartedCase
      ];
      updateAppealService.createNewAppeal = sandbox.spy();
      await getCreateNewAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(updateAppealService.createNewAppeal).to.be.calledWith(sinon.match.any);
      expect(res.redirect).to.be.calledWith(paths.common.overview);
      expect(res.render).to.not.be.calledWith(sinon.match.any);
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
