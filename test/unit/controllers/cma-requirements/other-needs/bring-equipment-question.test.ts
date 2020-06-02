import express, { NextFunction, Request, Response } from 'express';
import {
  getBringMultimediaEquipmentQuestion, postBringMultimediaEquipmentQuestion,
  setupBringMultimediaEquipmentQuestionController
} from '../../../../../app/controllers/cma-requirements/other-needs/bring-equipment-question';
import { paths } from '../../../../../app/paths';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Bring Equipment Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          cmaRequirements: {
            otherNeeds: {}
          }
        } as Partial<Appeal>
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupBringMultimediaEquipmentQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupBringMultimediaEquipmentQuestionController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion);
    });
  });

  describe('getBringMultimediaEquipmentQuestion', () => {
    it('should render question page', () => {

      getBringMultimediaEquipmentQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/appointment-multimedia-evidence',
        pageTitle: 'Will you bring the equipment to play this evidence?',
        previousPage: '/appointment-other-needs',
        question: {
          description: 'For example, a laptop or DVD player.',
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Will you bring the equipment to play this evidence?'
        }
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getBringMultimediaEquipmentQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postBringMultimediaEquipmentQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postBringMultimediaEquipmentQuestion(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk');
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postBringMultimediaEquipmentQuestion(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment);
      expect(req.session.appeal.cmaRequirements.otherNeeds.bringOwnMultimediaEquipment).to.be.true;
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postBringMultimediaEquipmentQuestion(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason);
      expect(req.session.appeal.cmaRequirements.otherNeeds.bringOwnMultimediaEquipment).to.be.false;
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postBringMultimediaEquipmentQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
