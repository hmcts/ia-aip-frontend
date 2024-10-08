import express, { NextFunction, Request, Response } from 'express';
import {
  getYourHearingNeedsPage,
  postYourHearingNeedsPage,
  setupYourHearingNeedsController
} from '../../../../app/controllers/hearing-requirements/your-hearing-needs';

import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Hearing RequirementsYour Hearing Needs controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let hearingRequirements: HearingRequirements;
  hearingRequirements = {
    'datesToAvoid': {
      'isDateCannotAttend': true,
      'dates': [{
        'date': {
          'year': '2022',
          'month': '11',
          'day': '11'
        },
        'reason': 'some reason'
      }, {
        'date': {
          'year': '2022',
          'month': '11',
          'day': '12'
        },
        'reason': 'some reason'
      }]
    },
    'witnessesOnHearing': true,
    'isAppellantAttendingTheHearing': true,
    'isAppellantGivingOralEvidence': true,
    'witnessesOutsideUK': true,
    'witnessNames': [
      {
        'witnessGivenNames': 'sabah u din',
        'witnessFamilyName': 'irfan'
      },
      {
        'witnessGivenNames': 'John',
        'witnessFamilyName': 'Smith'
      }
    ],
    'isHearingLoopNeeded': true,
    'isHearingRoomNeeded': true,
    'isInterpreterServicesNeeded': true,
    'isAnyWitnessInterpreterRequired': true,
    'otherNeeds': {
      'multimediaEvidence': true,
      'bringOwnMultimediaEquipment': true,
      'singleSexAppointment': true,
      'singleSexTypeAppointment': 'All male',
      'singleSexAppointmentReason': 'single sex appointment reason',
      'privateAppointment': true,
      'privateAppointmentReason': 'sdfsd fsd fs',
      'healthConditions': true,
      'healthConditionsReason': 'health condition reason',
      'pastExperiences': true,
      'pastExperiencesReason': 'post expression reason',
      'anythingElse': true,
      'anythingElseReason': 'anything else reason',
      'remoteVideoCall': true,
      'remoteVideoCallDescription': '',
      'bringOwnMultimediaEquipmentReason': ''
    }
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
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
          hearingRequirements: JSON.parse(JSON.stringify(hearingRequirements))
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupYourHearingNeedsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupYourHearingNeedsController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.yourHearingNeeds);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.yourHearingNeeds);
    });
  });

  describe('getYourHearingNeedsPage', () => {
    it('should render getYourHearingNeedsPage', () => {
      getYourHearingNeedsPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk');
    });

    it('should render getYourHearingNeedsPage with requirements', () => {

      const expectedArgs = {
        pageTitle: 'Your hearing needs',
        previousPage: paths.common.overview,
        summarySections: [{
          'title': '1. Attendance',
          'summaryLists': [{
            'title': 'Witnesses',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will any witnesses come to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Witnesses names'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'sabah u din irfan'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witness-names',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witness-names',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses take part in the hearing from outside the UK?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Appellant',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will the appellant come to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Evidence',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will the appellant give oral evidence at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }
          ]
        }, {
          'title': '2. Access needs',
          'summaryLists': [{
            'title': 'Interpreter',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Who are you requesting support for?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Interpreter support for me personally<br>Interpreter support for one or more witnesses'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What kind of interpreter do you need to request?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Spoken language interpreter<br>Sign language interpreter'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us about your language requirements'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Maghreb'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us about your sign language requirements'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'input sign language manually'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Select which witnesses need an interpreter'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witnesses-interpreter-needs',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What kind of interpreter will John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Spoken language interpreter<br>Sign language interpreter'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Which spoken language interpreter does John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Japanese'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Which sign language interpreter does John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith input sign language manually'
              }
            }]
          }, {
            'title': 'Step-free access',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses need step-free access?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Hearing loop',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses need a hearing loop?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }]
        }, {
          'title': '3. Other needs',
          'summaryLists': [{
            'title': 'Multimedia evidence',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you bring any video or audio evidence to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you bring the equipment to play this evidence?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'All-female or all-male appointment',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need an all-female or all-male hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What type of hearing will you need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'All male'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us why you need an all-male hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'single sex appointment reason'
              }
            }]
          }, {
            'title': 'Private appointment',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need a private hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us why you need a private hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>sdfsd fsd fs</pre>'
              }
            }]
          }, {
            'title': 'Physical or mental health conditions',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Do you have any physical or mental health conditions that may affect you at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us how any physical or mental health conditions you have may affect you at the hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>health condition reason</pre>'
              }
            }]
          }, {
            'title': 'Past experiences',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Have you had any past experiences that may affect you at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us how any past experiences may affect you at the hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>post expression reason</pre>'
              }
            }]
          }, {
            'title': 'Anything else',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need anything else at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us what you will need and why you need it'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>anything else reason</pre>'
              }
            }]
          }]
        }, {
          'title': '4. Dates to avoid',
          'summaryLists': [{
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Are there any dates you cannot go to the appointment?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Dates to avoid'
              },
              'value': {
                'html': '<b>Date</b><br><pre>11 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              }
            }, {
              'key': {
                'text': null
              },
              'value': {
                'html': '<b>Date</b><br><pre>12 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              }
            }]
          }]
        }]
      };

      req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.appellantInterpreterSpokenLanguage = { languageRefData: { value: { label: 'Maghreb', code: 'ara-mag' } } };
      req.session.appeal.hearingRequirements.appellantInterpreterSignLanguage = { languageManualEntry: ['Yes'], languageManualEntryDescription: 'input sign language manually' };

      req.session.appeal.hearingRequirements.witnessListElement2 = { 'value': [{ 'code': 'John Smith', 'label': 'John Smith' }], 'list_items': [{ 'code': 'John Smith', 'label': 'John Smith' }] };
      req.session.appeal.hearingRequirements.witness2InterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.witness2InterpreterSpokenLanguage = { languageRefData: { value: { label: 'Japanese', code: 'jpn' } } };
      req.session.appeal.hearingRequirements.witness2InterpreterSignLanguage = { languageManualEntry: ['Yes'], languageManualEntryDescription: 'John Smith input sign language manually' };
      getYourHearingNeedsPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', expectedArgs);
    });

    it('should render getYourHearingNeedsPage with requirements - attendance', () => {
      req.session.appeal.hearingRequirements.isAppellantAttendingTheHearing = false;
      req.session.appeal.hearingRequirements.isAppellantGivingOralEvidence = false;
      const expectedArgs = {
        pageTitle: 'Your hearing needs',
        previousPage: paths.common.overview,
        summarySections: [{
          'title': '1. Attendance',
          'summaryLists': [{
            'title': 'Witnesses',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will any witnesses come to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Witnesses names'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'sabah u din irfan'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witness-names',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witness-names',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses take part in the hearing from outside the UK?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Appellant',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will the appellant come to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'No'
              }
            }]
          }, {
            'title': 'Evidence',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will the appellant give oral evidence at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'No'
              }
            }]
          }
          ]
        }, {
          'title': '2. Access needs',
          'summaryLists': [{
            'title': 'Interpreter',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Who are you requesting support for?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Interpreter support for me personally<br>Interpreter support for one or more witnesses'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What kind of interpreter do you need to request?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Spoken language interpreter<br>Sign language interpreter'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us about your language requirements'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Maghreb'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us about your sign language requirements'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'input sign language manually'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Select which witnesses need an interpreter'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witnesses-interpreter-needs',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What kind of interpreter will John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Spoken language interpreter<br>Sign language interpreter'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Which spoken language interpreter does John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Japanese'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Which sign language interpreter does John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith input sign language manually'
              }
            }]
          }, {
            'title': 'Step-free access',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses need step-free access?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Hearing loop',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses need a hearing loop?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }]
        }, {
          'title': '3. Other needs',
          'summaryLists': [{
            'title': 'Multimedia evidence',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you bring any video or audio evidence to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you bring the equipment to play this evidence?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'All-female or all-male appointment',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need an all-female or all-male hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What type of hearing will you need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'All male'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us why you need an all-male hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'single sex appointment reason'
              }
            }]
          }, {
            'title': 'Private appointment',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need a private hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us why you need a private hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>sdfsd fsd fs</pre>'
              }
            }]
          }, {
            'title': 'Physical or mental health conditions',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Do you have any physical or mental health conditions that may affect you at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us how any physical or mental health conditions you have may affect you at the hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>health condition reason</pre>'
              }
            }]
          }, {
            'title': 'Past experiences',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Have you had any past experiences that may affect you at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us how any past experiences may affect you at the hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>post expression reason</pre>'
              }
            }]
          }, {
            'title': 'Anything else',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need anything else at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us what you will need and why you need it'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>anything else reason</pre>'
              }
            }]
          }]
        }, {
          'title': '4. Dates to avoid',
          'summaryLists': [{
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Are there any dates you cannot go to the appointment?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Dates to avoid'
              },
              'value': {
                'html': '<b>Date</b><br><pre>11 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              }
            }, {
              'key': {
                'text': null
              },
              'value': {
                'html': '<b>Date</b><br><pre>12 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              }
            }]
          }]
        }]
      };

      req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.appellantInterpreterSpokenLanguage = { languageRefData: { value: { label: 'Maghreb', code: 'ara-mag' } } };
      req.session.appeal.hearingRequirements.appellantInterpreterSignLanguage = { languageManualEntry: ['Yes'], languageManualEntryDescription: 'input sign language manually' };

      req.session.appeal.hearingRequirements.witnessListElement2 = { 'value': [{ 'code': 'John Smith', 'label': 'John Smith' }], 'list_items': [{ 'code': 'John Smith', 'label': 'John Smith' }] };
      req.session.appeal.hearingRequirements.witness2InterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.witness2InterpreterSpokenLanguage = { languageRefData: { value: { label: 'Japanese', code: 'jpn' } } };
      req.session.appeal.hearingRequirements.witness2InterpreterSignLanguage = { languageManualEntry: ['Yes'], languageManualEntryDescription: 'John Smith input sign language manually' };
      getYourHearingNeedsPage(req as Request, res as Response, next);
      getYourHearingNeedsPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', expectedArgs);
    });

    it('should render getYourHearingNeedsPage with requirements - no attendance', () => {

      req.session.appeal.hearingRequirements.isAppellantAttendingTheHearing = undefined;
      req.session.appeal.hearingRequirements.isAppellantGivingOralEvidence = undefined;

      const expectedArgs = {
        pageTitle: 'Your hearing needs',
        previousPage: paths.common.overview,
        summarySections: [{
          'title': '1. Witnesses',
          'summaryLists': [{
            'title': 'Witnesses',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will any witnesses come to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Witnesses names'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'sabah u din irfan'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witness-names',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witness-names',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses take part in the hearing from outside the UK?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }
          ]
        }, {
          'title': '2. Access needs',
          'summaryLists': [{
            'title': 'Interpreter',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Who are you requesting support for?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Interpreter support for me personally<br>Interpreter support for one or more witnesses'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What kind of interpreter do you need to request?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Spoken language interpreter<br>Sign language interpreter'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us about your language requirements'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Maghreb'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us about your sign language requirements'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'input sign language manually'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Select which witnesses need an interpreter'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witnesses-interpreter-needs',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What kind of interpreter will John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Spoken language interpreter<br>Sign language interpreter'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Which spoken language interpreter does John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Japanese'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Which sign language interpreter does John Smith need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'John Smith input sign language manually'
              }
            }]
          }, {
            'title': 'Step-free access',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses need step-free access?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Hearing loop',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses need a hearing loop?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }]
        }, {
          'title': '3. Other needs',
          'summaryLists': [{
            'title': 'Multimedia evidence',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you bring any video or audio evidence to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you bring the equipment to play this evidence?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'All-female or all-male appointment',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need an all-female or all-male hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What type of hearing will you need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'All male'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us why you need an all-male hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'single sex appointment reason'
              }
            }]
          }, {
            'title': 'Private appointment',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need a private hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us why you need a private hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>sdfsd fsd fs</pre>'
              }
            }]
          }, {
            'title': 'Physical or mental health conditions',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Do you have any physical or mental health conditions that may affect you at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us how any physical or mental health conditions you have may affect you at the hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>health condition reason</pre>'
              }
            }]
          }, {
            'title': 'Past experiences',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Have you had any past experiences that may affect you at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us how any past experiences may affect you at the hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>post expression reason</pre>'
              }
            }]
          }, {
            'title': 'Anything else',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need anything else at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us what you will need and why you need it'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>anything else reason</pre>'
              }
            }]
          }]
        }, {
          'title': '4. Dates to avoid',
          'summaryLists': [{
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Are there any dates you cannot go to the appointment?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Dates to avoid'
              },
              'value': {
                'html': '<b>Date</b><br><pre>11 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              }
            }, {
              'key': {
                'text': null
              },
              'value': {
                'html': '<b>Date</b><br><pre>12 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              }
            }]
          }]
        }]
      };

      req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.appellantInterpreterSpokenLanguage = { languageRefData: { value: { label: 'Maghreb', code: 'ara-mag' } } };
      req.session.appeal.hearingRequirements.appellantInterpreterSignLanguage = { languageManualEntry: ['Yes'], languageManualEntryDescription: 'input sign language manually' };

      req.session.appeal.hearingRequirements.witnessListElement2 = { 'value': [{ 'code': 'John Smith', 'label': 'John Smith' }], 'list_items': [{ 'code': 'John Smith', 'label': 'John Smith' }] };
      req.session.appeal.hearingRequirements.witness2InterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.witness2InterpreterSpokenLanguage = { languageRefData: { value: { label: 'Japanese', code: 'jpn' } } };
      req.session.appeal.hearingRequirements.witness2InterpreterSignLanguage = { languageManualEntry: ['Yes'], languageManualEntryDescription: 'John Smith input sign language manually' };
      getYourHearingNeedsPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', expectedArgs);
    });

    it('should render getYourHearingNeedsPage with requirements if user selected no witnesses with spoken and sign language interpreter', () => {

      const expectedArgs = {
        pageTitle: 'Your hearing needs',
        previousPage: paths.common.overview,
        summarySections: [{
          'title': '1. Attendance',
          'summaryLists': [{
            'title': 'Witnesses',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will any witnesses come to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'No'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses take part in the hearing from outside the UK?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Appellant',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will the appellant come to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Evidence',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will the appellant give oral evidence at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }
          ]
        }, {
          'title': '2. Access needs',
          'summaryLists': [{
            'title': 'Interpreter',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need an interpreter at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What kind of interpreter do you need to request?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Spoken language interpreter<br>Sign language interpreter'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us about your language requirements'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Maghreb'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us about your sign language requirements'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'input sign language manually'
              }
            }]
          }, {
            'title': 'Step-free access',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses need step-free access?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'Hearing loop',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you or any witnesses need a hearing loop?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }]
        }, {
          'title': '3. Other needs',
          'summaryLists': [{
            'title': 'Multimedia evidence',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you bring any video or audio evidence to the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you bring the equipment to play this evidence?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }]
          }, {
            'title': 'All-female or all-male appointment',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need an all-female or all-male hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'What type of hearing will you need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'All male'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us why you need an all-male hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'single sex appointment reason'
              }
            }]
          }, {
            'title': 'Private appointment',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need a private hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us why you need a private hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>sdfsd fsd fs</pre>'
              }
            }]
          }, {
            'title': 'Physical or mental health conditions',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Do you have any physical or mental health conditions that may affect you at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us how any physical or mental health conditions you have may affect you at the hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>health condition reason</pre>'
              }
            }]
          }, {
            'title': 'Past experiences',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Have you had any past experiences that may affect you at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us how any past experiences may affect you at the hearing'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>post expression reason</pre>'
              }
            }]
          }, {
            'title': 'Anything else',
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Will you need anything else at the hearing?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Tell us what you will need and why you need it'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': '<pre>anything else reason</pre>'
              }
            }]
          }]
        }, {
          'title': '4. Dates to avoid',
          'summaryLists': [{
            'summaryRows': [{
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Are there any dates you cannot go to the appointment?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Yes'
              }
            }, {
              'key': {
                'text': 'Dates to avoid'
              },
              'value': {
                'html': '<b>Date</b><br><pre>11 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              }
            }, {
              'key': {
                'text': null
              },
              'value': {
                'html': '<b>Date</b><br><pre>12 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              }
            }]
          }]
        }]
      };

      req.session.appeal.hearingRequirements.witnessesOnHearing = false;
      req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.appellantInterpreterSpokenLanguage = { languageRefData: { value: { label: 'Maghreb', code: 'ara-mag' } } };
      req.session.appeal.hearingRequirements.appellantInterpreterSignLanguage = { languageManualEntry: ['Yes'], languageManualEntryDescription: 'input sign language manually' };
      getYourHearingNeedsPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', expectedArgs);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getYourHearingNeedsPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postYourHearingNeedsPage', () => {
    it('should submit and redirect to your hearing page', async () => {
      await postYourHearingNeedsPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);

      await postYourHearingNeedsPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
