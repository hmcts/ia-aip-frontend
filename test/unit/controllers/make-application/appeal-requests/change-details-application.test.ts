import { NextFunction, Request, Response } from 'express';
import { getChangeDetailsApplication, postChangeDetailsApplication } from '../../../../../app/controllers/make-application/appeal-requests/change-details-application';
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

  describe('getUpdateDetailsApplication', () => {
    it('should render details-question-page', () => {
      const question = {
        name: 'makeAnApplicationDetails',
        value: req.session.appeal.makeAnApplicationDetails,
        description: i18n.pages.makeApplication.askUpdateDetails.description,
        hint: i18n.pages.makeApplication.askUpdateDetails.hint
      };
      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        title: i18n.pages.makeApplication.askUpdateDetails.title,
        formAction: paths.makeApplication.updateAppealDetails,
        supportingEvidence: true,
        ableToAddEvidenceTitle: i18n.pages.makeApplication.askUpdateDetails.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: i18n.pages.makeApplication.askUpdateDetails.ableToAddEvidenceAdvice,
        question
      };

      getChangeDetailsApplication(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('make-application/details-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);

      getChangeDetailsApplication(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postUpdateDetailsApplication', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      postChangeDetailsApplication(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
