import express, { NextFunction, Request, Response } from 'express';
import {
  addMoreWitnessPostAction,
  getWitnessNamesPage, postWitnessNamesPage, removeWitnessPostAction,
  setupWitnessNamesController
} from '../../../../app/controllers/hearing-requirements/hearing-witness-names';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Hearing Requirements - Witness Section: Witness names controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  let summaryList = [{ summaryRows: [{ key: { text: 'GivenName1 GivenName2 FamilyName' }, value: { html : '' }, actions: { items: [ { href: '/hearing-witness-names/remove?name=GivenName1%20GivenName2%20FamilyName' , text : 'Remove' }] } } ], title: 'Added witnesses' } ];
  const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          hearingRequirements: {
            witnessNames: [
              {
                'witnessPartyId': '1',
                'witnessGivenNames': 'GivenName1 GivenName2',
                'witnessFamilyName': 'FamilyName'
              }
            ]
          }
        }
      }
    } as unknown as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupWitnessNamesController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupWitnessNamesController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingWitnessNames);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingWitnessNames);
    });
  });

  describe('getWitnessNamesPage', () => {
    it('should render template', () => {

      const expectedArgs = {
        previousPage: previousPage,
        witnessAction: '/hearing-witness-names',
        summaryList: summaryList,
        isShowingAddButton: true
      };

      getWitnessNamesPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs);
    });

    it('should not show the add button if the witnesses size is equal to 10', async () => {

      let witnessNames: WitnessName[] = [];
      let summaryList: SummaryList[] = [{
        title: 'Added witnesses',
        summaryRows: null
      }];
      summaryList[0].summaryRows = [];
      for (let i: number = 0; i < 10; i++) {
        witnessNames.push({ 'witnessGivenNames': 'GivenName' + i + ' GivenName' + i, 'witnessFamilyName': 'FamilyName' });
        summaryList[0].summaryRows.push({ key: { text: 'GivenName' + i + ' GivenName' + i + ' FamilyName' }, value: { html: '' }, actions: { items: [{ href: '/hearing-witness-names/remove?name=GivenName' + i + '%20GivenName' + i + '%20FamilyName', text: 'Remove' }] } });
      }

      req.session.appeal.hearingRequirements.witnessNames = witnessNames;

      const expectedArgs = {
        previousPage: previousPage,
        witnessAction: '/hearing-witness-names',
        summaryList: summaryList,
        isShowingAddButton: false
      };
      getWitnessNamesPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs);

    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getWitnessNamesPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postWitnessNamesPage', () => {
    it('should fail validation and render template with errors', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [];
      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const expectedError = {
        witnesses: {
          href: '#witnesses',
          key: 'witnesses',
          text: 'Enter a witness name'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: previousPage,
        witnessAction: '/hearing-witness-names',
        summaryList: [ { summaryRows: [], title: 'Added witnesses' } ],
        isShowingAddButton: true
      };
      expect(res.render).to.have.been.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs);

    });

    it('should validate and redirect to next page', async () => {
      req.body['witnessName'] = 'My witness name';
      req.body['witnessFamilyName'] = 'Family name';
      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.witnessOutsideUK);
    });

    it('should catch error and call next with error', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [];
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('addMoreWitnessPostAction', () => {
    it('should fail validation and render template with errors', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [];
      await addMoreWitnessPostAction()(req as Request, res as Response, next);
      const expectedError = {
        witnessName: {
          key: 'witnessName',
          text: '"witnessName" is required',
          href: '#witnessName'
        },
        witnessFamilyName: {
          key: 'witnessFamilyName',
          text: '"witnessFamilyName" is required',
          href: '#witnessFamilyName'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: previousPage,
        witnessAction: '/hearing-witness-names',
        summaryList: [ { summaryRows: [], title: 'Added witnesses' } ],
        isShowingAddButton: true
      };
      expect(res.render).to.have.been.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs);

    });

    it('should add name in session and redirect to names page', async () => {
      req.body['witnessName'] = 'My witness name';
      req.body['witnessFamilyName'] = 'Family name';
      await addMoreWitnessPostAction()(req as Request, res as Response, next);
      const witnessName: WitnessName = {
        'witnessPartyId': req.session.appeal.hearingRequirements.witnessNames[1].witnessPartyId,
        'witnessGivenNames': 'My witness name',
        'witnessFamilyName': 'Family name'
      };
      expect(req.session.appeal.hearingRequirements.witnessNames).to.deep.include(witnessName);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingWitnessNames);
    });

    it('should catch error and call next with error', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [];
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('removeWitnessPostAction', () => {

    it('should remove witness name from session and redirect to names page', async () => {
      req.query = { name : 'GivenName1 GivenName2 FamilyName' };
      await removeWitnessPostAction()(req as Request, res as Response, next);
      const witnessName: WitnessName = {
        'witnessGivenNames': 'GivenName1 GivenName2',
        'witnessFamilyName': 'FamilyName'
      };
      expect(req.session.appeal.hearingRequirements.witnessNames).to.not.deep.include(witnessName);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingWitnessNames);
    });

    it('should clear cached old witness information and relocate their index', async () => {
      const witnessNamesList: WitnessName[] = [
        {
          'witnessGivenNames': 'witness',
          'witnessFamilyName': 'chan'
        },
        {
          'witnessGivenNames': 'witness',
          'witnessFamilyName': 'pang'
        }
      ];
      const formattedWitnessChanName = 'witness chan';
      const formattedWitnessPangName = 'witness pang';
      req.query = { name : formattedWitnessChanName };
      req.session.appeal.hearingRequirements.witnessListElement1 = { 'list_items': [{ 'label': formattedWitnessChanName } ] };
      req.session.appeal.hearingRequirements.witnessListElement2 = { 'list_items': [{ 'label': formattedWitnessPangName } ] };
      req.session.appeal.hearingRequirements.witnessNames = witnessNamesList;
      await removeWitnessPostAction()(req as Request, res as Response, next);

      expect(req.session.appeal.hearingRequirements.witnessNames).to.not.deep.include(witnessNamesList[0]);
      expect(req.session.appeal.hearingRequirements.witnessListElement1.list_items[0].label).to.be.equal(formattedWitnessPangName);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingWitnessNames);
    });

    it('should catch error and call next with error', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [];
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
