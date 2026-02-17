import { NextFunction, Request, Response } from 'express';
import { getLinkOrUnlinkAppealApplication, postLinkOrUnlinkAppealApplication } from '../../../../../app/controllers/make-application/appeal-requests/link-or-unlink-appeal-application';
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

  describe('getLinkOrUnlinkAppealApplication', () => {
    it('should render details-question-page', () => {
      const question = {
        name: 'makeAnApplicationDetails',
        value: req.session.appeal.makeAnApplicationDetails,
        description: i18n.pages.makeApplication.askLinkUnlink.description,
        hint: i18n.pages.makeApplication.askLinkUnlink.hint
      };
      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        title: i18n.pages.makeApplication.askLinkUnlink.title,
        formAction: paths.makeApplication.linkOrUnlink,
        supportingEvidence: true,
        ableToAddEvidenceTitle: i18n.pages.makeApplication.askLinkUnlink.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: i18n.pages.makeApplication.askLinkUnlink.ableToAddEvidenceAdvice,
        question
      };

      getLinkOrUnlinkAppealApplication(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('make-application/details-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getLinkOrUnlinkAppealApplication(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postLinkOrUnlinkAppealApplication', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postLinkOrUnlinkAppealApplication(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
});
