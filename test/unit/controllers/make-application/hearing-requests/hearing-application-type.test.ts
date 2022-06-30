import express, { NextFunction, Request, Response } from 'express';
import { getHearingApplicationType, postHearingApplicationType, setupHearingApplicationTypeController } from '../../../../../app/controllers/make-application/hearing-requests/hearing-application-type';
import { paths } from '../../../../../app/paths';
import i18n from '../../../../../locale/en.json';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing applications types controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let question;

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
    question = {
      title: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.title,
      heading: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.heading,
      name: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.name,
      titleIsheading: true,
      options: [
        {
          value: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingSooner.value,
          text: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingSooner.text,
          checked: false
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingLater.value,
          text: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingLater.text,
          checked: false
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.changeHearingLocation.value,
          text: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.changeHearingLocation.text,
          checked: false
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.askForSomething.value,
          text: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.askForSomething.text,
          checked: false
        }
      ],
      inline: false
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHearingApplicationTypeController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingApplicationTypeController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.askChangeHearing);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.askChangeHearing);
    });
  });

  describe('getHearingApplicationType', () => {
    it('should render', () => {
      req.query.error = undefined;
      req.session.appeal.hearingApplicationType = question.options[0].value;
      question.options[0].checked = true;

      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        pageTitle: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.title,
        formAction: paths.makeApplication.askChangeHearing,
        question,
        saveAndContinue: false
      };
      getHearingApplicationType(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('make-application/application-type-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render with error', () => {
      req.query.error = 'the error';
      const errorList = [
        {
          key: 'askToChangeSomethingAboutYourHearing',
          text: 'Select what you want to ask to change about your hearing',
          href: '#askToChangeSomethingAboutYourHearing'
        }
      ];
      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        pageTitle: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.title,
        formAction: paths.makeApplication.askChangeHearing,
        question,
        errorList,
        saveAndContinue: false
      };
      getHearingApplicationType(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('make-application/application-type-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch error and call next with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getHearingApplicationType(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postHearingApplicationType', () => {
    it('should render', async () => {
      req.body[i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.name] = 'askHearingSooner';
      postHearingApplicationType(req as Request, res as Response, next);

      expect(req.session.appeal.hearingApplicationType === 'askHearingSooner');
      expect(res.redirect).to.have.been.calledWith(paths.makeApplication.askHearingSooner);
    });

    it('should catch an error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      postHearingApplicationType(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });

    it('should redirect with error', async () => {
      req.body[i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.name] = null;
      postHearingApplicationType(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.makeApplication.askChangeHearing}?error=askToChangeSomethingAboutYourHearing`);
    });
  });
});
