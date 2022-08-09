import { NextFunction, Request, Response } from 'express';
import { getReinstateAppealApplication, postReinstateAppealApplication } from '../../../../../app/controllers/make-application/appeal-requests/reinstate-appeal-application';
import { paths } from '../../../../../app/paths';
import i18n from '../../../../../locale/en.json';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Appeal application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

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
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getReinstateAppealApplication', () => {
    it('should render details-question-page', () => {
      const question = {
        name: 'makeAnApplicationDetails',
        value: req.session.appeal.makeAnApplicationDetails,
        description: i18n.pages.makeApplication.askReinstate.description,
        hint: i18n.pages.makeApplication.askReinstate.hint
      };
      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        title: i18n.pages.makeApplication.askReinstate.title,
        formAction: paths.makeApplication.reinstate,
        supportingEvidence: true,
        ableToAddEvidenceTitle: i18n.pages.makeApplication.askReinstate.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: i18n.pages.makeApplication.askReinstate.ableToAddEvidenceAdvice,
        question
      };

      getReinstateAppealApplication(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('make-application/details-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);

      getReinstateAppealApplication(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postReinstateAppealApplication', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      postReinstateAppealApplication(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
