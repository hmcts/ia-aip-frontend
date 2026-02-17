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
  let next: sinon.SinonStub;
  const summaryList = [{ summaryRows: [{ key: { text: 'GivenName1 GivenName2 FamilyName' }, value: { html : '' }, actions: { items: [ { href: '/hearing-witness-names/remove?name=GivenName1%20GivenName2%20FamilyName' , text : 'Remove', visuallyHiddenText: 'GivenName1 GivenName2 FamilyName' }] } } ], title: 'Added witnesses' } ];
  const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;

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
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;

    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.hearingWitnessNames)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.hearingWitnessNames)).to.equal(true);
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
      expect(renderStub.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs)).to.equal(true);
    });

    it('should not show the add button if the witnesses size is equal to 10', async () => {

      const witnessNames: WitnessName[] = [];
      const summaryList: SummaryList[] = [{
        title: 'Added witnesses',
        summaryRows: null
      }];
      summaryList[0].summaryRows = [];
      for (let i: number = 0; i < 10; i++) {
        witnessNames.push({ 'witnessGivenNames': 'GivenName' + i + ' GivenName' + i, 'witnessFamilyName': 'FamilyName' });
        summaryList[0].summaryRows.push({ key: { text: 'GivenName' + i + ' GivenName' + i + ' FamilyName' }, value: { html: '' }, actions: { items: [{ href: '/hearing-witness-names/remove?name=GivenName' + i + '%20GivenName' + i + '%20FamilyName', text: 'Remove', visuallyHiddenText: 'GivenName' + i + ' GivenName' + i + ' FamilyName' }] } });
      }

      req.session.appeal.hearingRequirements.witnessNames = witnessNames;

      const expectedArgs = {
        previousPage: previousPage,
        witnessAction: '/hearing-witness-names',
        summaryList: summaryList,
        isShowingAddButton: false
      };
      getWitnessNamesPage(req as Request, res as Response, next);
      expect(renderStub.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs)).to.equal(true);

    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getWitnessNamesPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      expect(renderStub.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs)).to.equal(true);

    });

    it('should validate and redirect to next page', async () => {
      req.body['witnessName'] = 'My witness name';
      req.body['witnessFamilyName'] = 'Family name';
      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.witnessOutsideUK)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [];
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      expect(renderStub.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs)).to.equal(true);

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
      expect(redirectStub.calledWith(paths.submitHearingRequirements.hearingWitnessNames)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [];
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      expect(redirectStub.calledWith(paths.submitHearingRequirements.hearingWitnessNames)).to.equal(true);
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
      expect(req.session.appeal.hearingRequirements.witnessListElement1.list_items[0].label).to.equal(formattedWitnessPangName);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.hearingWitnessNames)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      req.session.appeal.hearingRequirements.witnessNames = [];
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postWitnessNamesPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
