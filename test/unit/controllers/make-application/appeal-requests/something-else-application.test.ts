import { NextFunction, Request, Response } from 'express';
import { getOtherAppealApplication, postOtherAppealApplication } from '../../../../../app/controllers/make-application/appeal-requests/something-else-application';
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

  describe('getOtherAppealApplication', () => {
    it('should render details-question-page', () => {
      const question = {
        name: 'makeAnApplicationDetails',
        value: req.session.appeal.makeAnApplicationDetails,
        description: i18n.pages.makeApplication.askSomethingElse.description,
        hint: i18n.pages.makeApplication.askSomethingElse.hint
      };
      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        title: i18n.pages.makeApplication.askSomethingElse.title,
        formAction: paths.makeApplication.other,
        supportingEvidence: true,
        ableToAddEvidenceTitle: i18n.pages.makeApplication.askSomethingElse.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: i18n.pages.makeApplication.askSomethingElse.ableToAddEvidenceAdvice,
        question
      };

      getOtherAppealApplication(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('make-application/details-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);

      getOtherAppealApplication(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postOtherAppealApplication', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      postOtherAppealApplication(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
