import { NextFunction, Request, Response } from 'express';
import { getReinstateAppealApplication, postReinstateAppealApplication } from '../../../../../app/controllers/make-application/appeal-requests/reinstate-appeal-application';
import { paths } from '../../../../../app/paths';
import i18n from '../../../../../locale/en.json';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Appeal application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
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
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();
    res = {
      render: renderStub,
      redirect: redirectStub,
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
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

      expect(renderStub).to.be.calledWith('make-application/details-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getReinstateAppealApplication(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postReinstateAppealApplication', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postReinstateAppealApplication(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
});
