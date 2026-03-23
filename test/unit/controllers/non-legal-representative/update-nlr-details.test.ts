import { Request, Response } from 'express';
import {
  getNlrName,
  getNlrAddress,
  getNlrContactDetails,
  getUpdateNlrDetailsCheckAndSend,
  getUpdateNlrDetailsConfirmation,
  setupNlrUpdatePhoneNumberControllers,
} from '../../../../app/controllers/non-legal-representative/update-nlr-details';
import { Events } from '../../../../app/data/events';
import { isJourneyAllowedMiddleware } from '../../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Update phone number controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
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
          application: {},
          documentMap: []
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupNlrUpdatePhoneNumberControllers', () => {
    it('should return the correct routers', () => {
      const express = require('express');
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [isJourneyAllowedMiddleware];

      setupNlrUpdatePhoneNumberControllers(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateName, middleware, getNlrName)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updateName, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateAddress, middleware, getNlrAddress)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updateAddress, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateContactDetails, middleware, getNlrContactDetails)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updateContactDetails, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateDetailsCheckAndSend, middleware, getUpdateNlrDetailsCheckAndSend)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updateDetailsCheckAndSend, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updateDetailsConfirmation, middleware, getUpdateNlrDetailsConfirmation)).to.equal(true);
    });
  });
});
