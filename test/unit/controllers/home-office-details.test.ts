import express, { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import {
  getDateLetterReceived,
  getDateLetterSent,
  getHomeOfficeDetails,
  postDateLetterReceived,
  postDateLetterSent,
  postHomeOfficeDetails,
  setupHomeOfficeDetailsController
} from '../../../app/controllers/appeal-application/home-office-details';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Home Office Details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            isAppealLate: false
          }
        } as Appeal
      } as Partial<Express.Session>,
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = {
      submitEvent: sandbox.stub(),
      submitEventRefactored: sandbox.stub().returns({
        case_data: {
          homeOfficeReferenceNumber: 'A1234567'
        }
      })
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHomeOfficeDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];

      setupHomeOfficeDetailsController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.details);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.details);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.letterSent);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.letterSent);
    });
  });

  describe('getHomeOfficeDetails', () => {
    it('should render home-office/details.njk', function () {
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/details.njk');
    });

    it('when called with edit param should render home-office/details.njk and update session', function () {
      req.query = { 'edit': '' };
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/details.njk');
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postHomeOfficeDetails', () => {
    it('should validate and redirect home-office/details.njk', async () => {
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          homeOfficeRefNumber: '1212-0099-0089-1080'
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          homeOfficeRefNumber: '1212-0099-0089-1080'
        }
      } as Appeal);
      req.body['homeOfficeRefNumber'] = '1212-0099-0089-1080';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.homeOfficeRefNumber).to.be.eql('1212-0099-0089-1080');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.letterReceived);
    });

    it('when save for later should validate and redirect task-list.njk', async () => {
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          homeOfficeRefNumber: '1212-0099-0089-1080'
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          homeOfficeRefNumber: 'A1234567'
        }
      } as Appeal);
      req.body['homeOfficeRefNumber'] = '1212-0099-0089-1080';
      req.body['saveForLater'] = 'saveForLater';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.homeOfficeRefNumber).to.be.eql('A1234567');
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('when in edit mode should validate and redirect check-and-send.njk and reset isEdit flag', async () => {
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          homeOfficeRefNumber: '1212-0099-0089-1080',
          isEdit: true
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          homeOfficeRefNumber: '1212-0099-0089-1080'
        }
      } as Appeal);
      req.session.appeal.application.isEdit = true;
      req.body['homeOfficeRefNumber'] = '1212-0099-0089-1080';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.homeOfficeRefNumber).to.be.eql('1212-0099-0089-1080');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('should fail validation and render home-office/details.njk with error', async () => {
      // req.body['homeOfficeRefNumber'] = 'notValid';
      // req.body['homeOfficeRefNumber'] = '1212-0099-0089-1080';
      req.body['homeOfficeRefNumber'] = 'A1234567';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        href: '#homeOfficeRefNumber',
        key: 'homeOfficeRefNumber',
        text: 'Enter the Home Office reference number in the correct format'
      };
      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office/details.njk',
        {
          errors: {
            homeOfficeRefNumber: error
          },
          errorList: [error],
          homeOfficeRefNumber: 'A1234567',
          previousPage: paths.appealStarted.taskList
        });
    });

    it('when save for later should fail validation and render home-office/details.njk with error', async () => {
      req.body['homeOfficeRefNumber'] = 'notValid';
      req.body['saveForLater'] = 'saveForLater';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        href: '#homeOfficeRefNumber',
        key: 'homeOfficeRefNumber',
        text: 'Enter the Home Office reference number in the correct format'
      };
      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office/details.njk',
        {
          errors: {
            homeOfficeRefNumber: error
          },
          errorList: [error],
          homeOfficeRefNumber: 'notValid',
          previousPage: paths.appealStarted.taskList
        });
    });

    it('when save and continue should fail validation due to blank home office reference and render home-office/details.njk with error', async () => {
      req.body['homeOfficeRefNumber'] = '';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        href: '#homeOfficeRefNumber',
        key: 'homeOfficeRefNumber',
        text: 'Enter the Home Office reference number'
      };
      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office/details.njk',
        {
          errors: {
            homeOfficeRefNumber: error
          },
          errorList: [error],
          homeOfficeRefNumber: '',
          previousPage: paths.appealStarted.taskList
        });
    });

    it('should redirect to path list when save for later and home office ref numnber is blank', async () => {
      req.body['homeOfficeRefNumber'] = '';
      req.body['saveForLater'] = 'saveForLater';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getDateLetterSent', () => {
    it('should render home-office/letter-sent.njk', () => {
      getDateLetterSent(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk');
    });

    it('when called with edit param should render home-office/letter-sent.njk and update session', () => {
      req.query = { 'edit': '' };

      getDateLetterSent(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk');
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getDateLetterSent(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDateLetterSent', () => {
    describe('appeal on time', () => {
      const date = moment().subtract(14, 'd');
      let appeal: Appeal;
      let day: string;
      let month: string;
      let year: string;
      beforeEach(() => {
        day = date.format('DD');
        month = date.format('MM');
        year = date.format('YYYY');
        req.body['day'] = day;
        req.body['month'] = month;
        req.body['year'] = year;
        appeal = {
          ...req.session.appeal,
          application: {
            ...req.session.appeal.application,
            dateLetterSent: {
              day,
              month,
              year
            }
          }
        };
        updateAppealService.submitEventRefactored = sandbox.stub().returns({
          application: {
            dateLetterSent: {
              day,
              month,
              year
            },
            isAppealLate: false
          }
        } as Appeal);
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should validate and redirect to Task list page and set isAppealLate flag to false', async () => {
        await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        const { dateLetterSent } = req.session.appeal.application;

        expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
        expect(dateLetterSent.day).to.be.eql(day);
        expect(dateLetterSent.month).to.be.eql(month);
        expect(dateLetterSent.year).to.be.eql(year);
        expect(req.session.appeal.application.isAppealLate).to.be.eq(false);
        expect(res.redirect).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
      });

      it('should validate and redirect to CYA page and reset isEdit flag, and set isAppealLate flag to false', async () => {
        req.session.appeal.application.isEdit = true;
        appeal.application.isEdit = true;
        await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        const { dateLetterSent } = req.session.appeal.application;

        expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
        expect(dateLetterSent.day).to.be.eql(day);
        expect(dateLetterSent.month).to.be.eql(month);
        expect(dateLetterSent.year).to.be.eql(year);
        expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
        expect(req.session.appeal.application.isEdit).to.be.undefined;
        expect(req.session.appeal.application.isAppealLate).to.be.eq(false);
      });
    });

    describe('appeal out of time', () => {
      const date = moment().subtract(15, 'd');
      let appeal: Appeal;
      let day: string;
      let month: string;
      let year: string;
      beforeEach(() => {
        day = date.format('DD');
        month = date.format('MM');
        year = date.format('YYYY');
        req.body['day'] = date.format('DD');
        req.body['month'] = date.format('MM');
        req.body['year'] = date.format('YYYY');
        appeal = {
          ...req.session.appeal,
          application: {
            ...req.session.appeal.application,
            dateLetterSent: {
              day,
              month,
              year
            },
            isAppealLate: true
          }
        };
        updateAppealService.submitEventRefactored = sandbox.stub().returns({
          application: {
            dateLetterSent: {
              day,
              month,
              year
            },
            isAppealLate: true
          }
        } as Appeal);
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should validate and redirect to Task list page and set isAppealLate flag to true', async () => {
        await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        const { dateLetterSent } = req.session.appeal.application;

        expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
        expect(dateLetterSent.day).to.be.eql(day);
        expect(dateLetterSent.month).to.be.eql(month);
        expect(dateLetterSent.year).to.be.eql(year);
        expect(req.session.appeal.application.isAppealLate).to.be.eq(true);
        expect(res.redirect).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
      });

      it('should validate and redirect to CYA page and reset isEdit flag and set isAppealLate flag to true', async () => {
        req.session.appeal.application.isEdit = true;
        appeal.application.isEdit = true;
        await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        const { dateLetterSent } = req.session.appeal.application;

        expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
        expect(dateLetterSent.day).to.be.eql(day);
        expect(dateLetterSent.month).to.be.eql(month);
        expect(dateLetterSent.year).to.be.eql(year);
        expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
        expect(req.session.appeal.application.isEdit).to.be.undefined;
        expect(req.session.appeal.application.isAppealLate).to.be.eq(true);
      });

      it('should validate and set isAppealLate to true and redirect to task list page', async () => {
        await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        const { dateLetterSent } = req.session.appeal.application;

        expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
        expect(dateLetterSent.day).to.be.eql(day);
        expect(dateLetterSent.month).to.be.eql(month);
        expect(dateLetterSent.year).to.be.eql(year);
        expect(res.redirect).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
        expect(req.session.appeal.application.isAppealLate).to.be.eq(true);
      });

      it('when save for later should validate and set isAppealLate to true redirect to overview page', async () => {
        req.body.saveForLater = 'saveForLater';
        await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        const { dateLetterSent } = req.session.appeal.application;

        expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
        expect(dateLetterSent.day).to.be.eql(day);
        expect(dateLetterSent.month).to.be.eql(month);
        expect(dateLetterSent.year).to.be.eql(year);
        expect(req.session.appeal.application.isAppealLate).to.be.eq(true);
        expect(res.redirect).to.have.been.calledWith(`${paths.common.overview}?saved`);
      });

      it('should validate and redirect to Appeal Late page and isEdit flag is not updated', async () => {
        req.session.appeal.application.isEdit = true;
        appeal.application.isEdit = true;
        await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        const { dateLetterSent } = req.session.appeal.application;

        expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
        expect(dateLetterSent.day).to.be.eql(day);
        expect(dateLetterSent.month).to.be.eql(month);
        expect(dateLetterSent.year).to.be.eql(year);
        expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
        expect(req.session.appeal.application.isAppealLate).to.be.eq(true);
        expect(req.session.appeal.application.isEdit).to.be.undefined;
      });

    });

    it('should redirect to task list when save for later and blank date', async () => {
      req.body['day'] = '';
      req.body['month'] = '';
      req.body['year'] = '';
      req.body.saveForLater = 'saveForLater';
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should fail validation if the date is in the future and render error', async () => {
      const date = moment().add(10, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk');
    });

    it('should fail validation and render error', async () => {
      req.body['day'] = '1';
      req.body['month'] = '1';
      req.body['year'] = moment().year() + 1;
      const dateError = {
        text: 'The date letter was sent must be in the past',
        href: '#date',
        key: 'date'
      };
      const error = {
        date: dateError
      };
      const errorList = [dateError];
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk',
        {
          error,
          errorList,
          dateLetterSent: { ...req.body },
          previousPage: paths.appealStarted.details
        }
      );
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getDateLetterSent', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render hr-inside.njk', async () => {
      req.session.appeal.application.dateLetterSent = {
        day: '1',
        month: '1',
        year: '2022'
      };
      getDateLetterSent(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/letter-sent.njk', {
        dateLetterSent: req.session.appeal.application.dateLetterSent,
        previousPage: paths.appealStarted.details
      });
    });

    it('getOocHrInside should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getDateLetterSent(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDateLetterSent', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.day = 1;
      req.body.month = 1;
      req.body.year = 2022;

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: true,
          dateLetterSent: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          }
        }
      };

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          isAppealLate: true,
          dateLetterSent: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          }
        }
      } as Appeal);
    });

    it('should validate and redirect to the type of appeal page', async () => {
      req.body['day'] = 1;
      req.body['month'] = 1;
      req.body['year'] = 2022;
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
    });

    it('should fail validation and render hr-inside.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'day',
        text: 'Date letter sent must include a day, month and year',
        href: '#day'
      };

      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/letter-sent.njk', {
        error: { day: expectedError },
        errorList: [expectedError],
        dateLetterSent: {
          ...req.body
        },
        previousPage: paths.appealStarted.details
      });
    });

    it('postDateLetterSent should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'dateLetterSent': undefined };
      res.render = sandbox.stub().throws(error);
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getDateLetterReceived', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render letter-received.njk', async () => {
      req.session.appeal.application.decisionLetterReceivedDate = {
        day: '1',
        month: '1',
        year: '2022'
      };
      getDateLetterReceived(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/letter-received.njk', {
        decisionLetterReceivedDate: req.session.appeal.application.decisionLetterReceivedDate,
        previousPage: paths.appealStarted.details
      });
    });

    it('getDateLetterReceived should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getDateLetterReceived(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDateLetterReceived', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.day = 1;
      req.body.month = 11;
      req.body.year = 1993;

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: true,
          decisionLetterReceivedDate: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          }
        }
      };

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          isAppealLate: true,
          decisionLetterReceivedDate: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          }
        }
      } as Appeal);
    });

    it('should validate and redirect to the home office upload decision letter page', async () => {
      req.body['day'] = 1;
      req.body['month'] = 11;
      req.body['year'] = 1993;
      await postDateLetterReceived(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
    });

    it('should fail validation and render letter-received.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'day',
        text: 'Date letter sent must include a day, month and year',
        href: '#day'
      };

      await postDateLetterReceived(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/letter-received.njk', {
        error: { day: expectedError },
        errorList: [expectedError],
        decisionLetterReceivedDate: {
          ...req.body
        },
        previousPage: paths.appealStarted.gwfReference
      });
    });

    it('postDateLetterReceived should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'decisionLetterReceivedDate': undefined };
      res.render = sandbox.stub().throws(error);
      await postDateLetterReceived(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
