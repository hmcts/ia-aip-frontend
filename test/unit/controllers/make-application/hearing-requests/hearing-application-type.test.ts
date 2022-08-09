import { NextFunction, Request, Response } from 'express';
import { getHearingApplicationType, postHearingApplicationType } from '../../../../../app/controllers/make-application/hearing-requests/hearing-application-type';
import { applicationTypes } from '../../../../../app/data/application-types';
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
      title: i18n.pages.makeApplication.askChangeHearing.title,
      heading: i18n.pages.makeApplication.askChangeHearing.question.heading,
      name: i18n.pages.makeApplication.askChangeHearing.question.name,
      titleIsheading: true,
      options: [
        {
          value: i18n.pages.makeApplication.askChangeHearing.question.options.askHearingSooner.value,
          text: i18n.pages.makeApplication.askChangeHearing.question.options.askHearingSooner.text,
          checked: false
        },
        {
          value: i18n.pages.makeApplication.askChangeHearing.question.options.askChangeDate.value,
          text: i18n.pages.makeApplication.askChangeHearing.question.options.askChangeDate.text,
          checked: false
        },
        {
          value: i18n.pages.makeApplication.askChangeHearing.question.options.askChangeLocation.value,
          text: i18n.pages.makeApplication.askChangeHearing.question.options.askChangeLocation.text,
          checked: false
        },
        {
          value: i18n.pages.makeApplication.askChangeHearing.question.options.askUpdateHearingRequirements.value,
          text: i18n.pages.makeApplication.askChangeHearing.question.options.askUpdateHearingRequirements.text,
          checked: false
        }
      ],
      inline: false
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getHearingApplicationType', () => {
    it('should render', () => {
      req.query.error = undefined;
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: question.options[0].value,
          label: applicationTypes[question.options[0].value].type
        }
      };
      question.options[0].checked = true;

      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        pageTitle: i18n.pages.makeApplication.askChangeHearing.title,
        formAction: paths.makeApplication.askChangeHearing,
        question,
        saveAndContinue: false
      };
      getHearingApplicationType(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('make-application/radio-button-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render with error', () => {
      req.query.error = 'the error';
      const errorList = [
        {
          key: 'askChangeHearing',
          text: 'Select what you want to ask to change about your hearing',
          href: '#askChangeHearing'
        }
      ];
      const expectedRenderPayload = {
        previousPage: paths.common.overview,
        pageTitle: i18n.pages.makeApplication.askChangeHearing.title,
        formAction: paths.makeApplication.askChangeHearing,
        question,
        errorList,
        saveAndContinue: false
      };
      getHearingApplicationType(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('make-application/radio-button-question-page.njk', {
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
      req.body[i18n.pages.makeApplication.askChangeHearing.question.name] = 'expedite';
      postHearingApplicationType(req as Request, res as Response, next);

      expect(req.session.appeal.makeAnApplicationTypes.value.code === 'expedite');
      expect(res.redirect).to.have.been.calledWith(paths.makeApplication.expedite);
    });

    it('should catch an error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      postHearingApplicationType(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });

    it('should redirect with error', async () => {
      req.body[i18n.pages.makeApplication.askChangeHearing.question.name] = null;
      postHearingApplicationType(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.makeApplication.askChangeHearing}?error=askChangeHearing`);
    });
  });
});
