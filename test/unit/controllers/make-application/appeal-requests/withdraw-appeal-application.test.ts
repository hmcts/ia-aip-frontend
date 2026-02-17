import { NextFunction, Request, Response } from 'express';
import { getWithdrawAppealApplication, postWithdrawAppealApplication } from '../../../../../app/controllers/make-application/appeal-requests/withdraw-appeal-application';
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
      locals: {},
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getWithdrawAppealApplication', () => {
    it('should render details-question-page', () => {
      const question = {
        name: 'makeAnApplicationDetails',
        value: req.session.appeal.makeAnApplicationDetails,
        description: i18n.pages.makeApplication.askWithdraw.description,
        hint: i18n.pages.makeApplication.askWithdraw.hint
      };
      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        title: i18n.pages.makeApplication.askWithdraw.title,
        formAction: paths.makeApplication.withdraw,
        supportingEvidence: true,
        ableToAddEvidenceTitle: i18n.pages.makeApplication.askWithdraw.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: i18n.pages.makeApplication.askWithdraw.ableToAddEvidenceAdvice,
        question
      };

      getWithdrawAppealApplication(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('make-application/details-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getWithdrawAppealApplication(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postWithdrawAppealApplication', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postWithdrawAppealApplication(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
});
