import express, { Request, Response } from 'express';
import {
  getCheckAndSendPage,
  postCheckAndSendPage,
  setupHearingRequirementsCYAController
} from '../../../../app/controllers/hearing-requirements/check-and-send';

import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

describe('Hearing Requirements Check and Send controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
  let submitRefactoredStub: sinon.SinonStub;
  const hearingRequirements: HearingRequirements = {
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
          application: {},
          hearingRequirements: JSON.parse(JSON.stringify(hearingRequirements))
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;
    submitStub = sandbox.stub();
    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();
    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
    updateAppealService = {
      submitEventRefactored: submitRefactoredStub,
      submitEvent: submitStub.returns({ state: 'hearingRequirementsSubmitted' })
    } as Partial<UpdateAppealService>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupCmaRequirementsCYAController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingRequirementsCYAController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.checkAndSend)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.checkAndSend)).to.equal(true);
    });
  });

  describe('getCheckAndSendPage', () => {
    it('should render CYA template page', () => {
      getCheckAndSendPage(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/check-and-send.njk')).to.equal(true);
    });

    it('should render CYA template page with requirements', () => {

      const expectedArgs = {
        pageTitle: 'Check your answers',
        formAction: paths.submitHearingRequirements.checkAndSend,
        previousPage: paths.submitHearingRequirements.taskList,
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witnesses?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-outside-uk?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }]
          }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-support-appellant-Witnesses',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-types',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-spoken-language-selection',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-sign-language-selection',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
                'html': 'sabah u din irfan'
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
                'html': 'What kind of interpreter will sabah u din irfan need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Spoken language interpreter<br>Sign language interpreter'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-types?selectedWitnesses=0',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Which spoken language interpreter does sabah u din irfan need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'Japanese'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-spoken-language-selection?selectedWitnesses=0',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Question'
              },
              'value': {
                'html': 'Which sign language interpreter does sabah u din irfan need?'
              }
            }, {
              'key': {
                'text': 'Answer'
              },
              'value': {
                'html': 'sabah u din irfan input sign language manually'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-sign-language-selection?selectedWitnesses=0',
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-types?selectedWitnesses=1',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-spoken-language-selection?selectedWitnesses=1',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-sign-language-selection?selectedWitnesses=1',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-step-free-access?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-hearing-loop?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-multimedia-evidence?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-multimedia-evidence-equipment?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-single-sex?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-single-sex-type?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-single-sex-type-male?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-private?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-private-reason?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-physical-mental-health?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-physical-mental-health-reasons?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-past-experiences?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-past-experiences-reasons?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-anything-else?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-anything-else-reasons?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-dates-avoid?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Dates to avoid'
              },
              'value': {
                'html': '<b>Date</b><br><pre>11 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-dates-avoid-enter/0?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': null
              },
              'value': {
                'html': '<b>Date</b><br><pre>12 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-dates-avoid-enter/1?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }]
          }]
        }]
      };

      req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.appellantInterpreterSpokenLanguage = {
        languageRefData: {
          value: {
            label: 'Maghreb',
            code: 'ara-mag'
          }
        }
      };
      req.session.appeal.hearingRequirements.appellantInterpreterSignLanguage = {
        languageManualEntry: ['Yes'],
        languageManualEntryDescription: 'input sign language manually'
      };

      req.session.appeal.hearingRequirements.witnessListElement2 = {
        'value': [{
          'code': 'John Smith',
          'label': 'John Smith'
        }], 'list_items': [{ 'code': 'John Smith', 'label': 'John Smith' }]
      };
      req.session.appeal.hearingRequirements.witness2InterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.witness2InterpreterSpokenLanguage = {
        languageRefData: {
          value: {
            label: 'Japanese',
            code: 'jpn'
          }
        }
      };
      req.session.appeal.hearingRequirements.witness2InterpreterSignLanguage = {
        languageManualEntry: ['Yes'],
        languageManualEntryDescription: 'John Smith input sign language manually'
      };

      req.session.appeal.hearingRequirements.witnessListElement1 = {
        'value': [{
          'code': 'sabah u din irfan',
          'label': 'sabah u din irfan'
        }], 'list_items': [{ 'code': 'sabah u din irfan', 'label': 'sabah u din irfan' }]
      };
      req.session.appeal.hearingRequirements.witness1InterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.witness1InterpreterSpokenLanguage = {
        languageRefData: {
          value: {
            label: 'Japanese',
            code: 'jpn'
          }
        }
      };
      req.session.appeal.hearingRequirements.witness1InterpreterSignLanguage = {
        languageManualEntry: ['Yes'],
        languageManualEntryDescription: 'sabah u din irfan input sign language manually'
      };
      getCheckAndSendPage(req as Request, res as Response, next);

      expect(renderStub.calledWith('templates/check-and-send.njk', expectedArgs)).to.equal(true);
    });

    it('should render CYA template page with requirements when there is no witnesses with spoken and sign language interpreter', () => {

      const expectedArgs = {
        pageTitle: 'Check your answers',
        formAction: paths.submitHearingRequirements.checkAndSend,
        previousPage: paths.submitHearingRequirements.taskList,
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
                'html': 'No'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-witnesses?edit',
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-outside-uk?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }]
          }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-types',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-spoken-language-selection',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-interpreter-sign-language-selection',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-step-free-access?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-hearing-loop?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-multimedia-evidence?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-multimedia-evidence-equipment?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-single-sex?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-single-sex-type?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-single-sex-type-male?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-private?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-private-reason?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-physical-mental-health?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-physical-mental-health-reasons?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-past-experiences?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-past-experiences-reasons?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-anything-else?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-anything-else-reasons?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
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
              },
              'actions': {
                'items': [{
                  'href': '/hearing-dates-avoid?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': 'Dates to avoid'
              },
              'value': {
                'html': '<b>Date</b><br><pre>11 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-dates-avoid-enter/0?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }, {
              'key': {
                'text': null
              },
              'value': {
                'html': '<b>Date</b><br><pre>12 November 2022</pre><br><b>Reason</b><br><pre>some reason</pre>'
              },
              'actions': {
                'items': [{
                  'href': '/hearing-dates-avoid-enter/1?edit',
                  'text': 'Change',
                  'visuallyHiddenText': 'Answer'
                }]
              }
            }]
          }]
        }]
      };

      req.session.appeal.hearingRequirements.witnessesOnHearing = false;
      req.session.appeal.hearingRequirements.appellantInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];
      req.session.appeal.hearingRequirements.appellantInterpreterSpokenLanguage = {
        languageRefData: {
          value: {
            label: 'Maghreb',
            code: 'ara-mag'
          }
        }
      };
      req.session.appeal.hearingRequirements.appellantInterpreterSignLanguage = {
        languageManualEntry: ['Yes'],
        languageManualEntryDescription: 'input sign language manually'
      };
      getCheckAndSendPage(req as Request, res as Response, next);

      expect(renderStub.calledWith('templates/check-and-send.njk', expectedArgs)).to.equal(true);
    });

    describe('NLR summary section', () => {
      it('should render CYA template page with nlr fields if hasNlr but empty nlr fields', () => {
        req.session.appeal.application.hasNonLegalRep = 'Yes';
        getCheckAndSendPage(req as Request, res as Response, next);
        const expectedNlrSection = {
          title: '3. Non-legal representative', summaryLists: [
            {
              title: 'Non-legal representative', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative attend the hearing?'),
                summaryRow('Answer', '', '/hearing-non-legal-rep'),
                summaryRow('Question', 'Will your non-legal representative take part in the hearing from outside the UK?'),
                summaryRow('Answer', '', '/hearing-non-legal-rep-outside-uk'),
              ]
            }
          ]
        };
        expect(renderStub).calledWith('templates/check-and-send.njk', {
          pageTitle: 'Check your answers',
          formAction: paths.submitHearingRequirements.checkAndSend,
          previousPage: paths.submitHearingRequirements.taskList,
          summarySections: [sinon.match.object, sinon.match.object, expectedNlrSection, sinon.match.object, sinon.match.object]
        });
      });

      it('should render CYA template page with nlr fields if hasNlr Yes nlrAttending No nlrOutsideUK No ', () => {
        req.session.appeal.application.hasNonLegalRep = 'Yes';
        req.session.appeal.hearingRequirements.nlrOutsideUK = 'No';
        req.session.appeal.hearingRequirements.nlrAttending = 'No';
        getCheckAndSendPage(req as Request, res as Response, next);
        const expectedNlrSection = {
          title: '3. Non-legal representative', summaryLists: [
            {
              title: 'Non-legal representative', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative attend the hearing?'),
                summaryRow('Answer', 'No', '/hearing-non-legal-rep'),
                summaryRow('Question', 'Will your non-legal representative take part in the hearing from outside the UK?'),
                summaryRow('Answer', 'No', '/hearing-non-legal-rep-outside-uk'),
              ]
            }
          ]
        };
        expect(renderStub).calledWith('templates/check-and-send.njk', {
          pageTitle: 'Check your answers',
          formAction: paths.submitHearingRequirements.checkAndSend,
          previousPage: paths.submitHearingRequirements.taskList,
          summarySections: [sinon.match.object, sinon.match.object, expectedNlrSection, sinon.match.object, sinon.match.object]
        });
      });

      it('should render CYA template page with nlr fields if hasNlr Yes nlrAttending Yes ', () => {
        req.session.appeal.application.hasNonLegalRep = 'Yes';
        req.session.appeal.hearingRequirements.nlrOutsideUK = 'No';
        req.session.appeal.hearingRequirements.nlrAttending = 'Yes';
        req.session.appeal.hearingRequirements.isNlrInterpreterRequired = 'No';
        req.session.appeal.hearingRequirements.nlrNeedsStepFreeAccess = 'No';
        req.session.appeal.hearingRequirements.nlrNeedsHearingLoop = 'No';
        getCheckAndSendPage(req as Request, res as Response, next);
        const expectedNlrSection = {
          title: '3. Non-legal representative', summaryLists: [
            {
              title: 'Non-legal representative', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative attend the hearing?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep'),
                summaryRow('Question', 'Will your non-legal representative need an interpreter at the hearing?'),
                summaryRow('Answer', 'No', '/hearing-non-legal-rep-interpreter')
              ]
            }, {
              title: 'Step-free access', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative need step-free access?'),
                summaryRow('Answer', 'No', '/hearing-non-legal-rep-step-free-access')
              ]
            }, {
              title: 'Hearing loop', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative need a hearing loop?'),
                summaryRow('Answer', 'No', '/hearing-non-legal-rep-hearing-loop')
              ]
            },
          ]
        };
        expect(renderStub).calledWith('templates/check-and-send.njk', {
          pageTitle: 'Check your answers',
          formAction: paths.submitHearingRequirements.checkAndSend,
          previousPage: paths.submitHearingRequirements.taskList,
          summarySections: [sinon.match.object, sinon.match.object, expectedNlrSection, sinon.match.object, sinon.match.object]
        });
      });

      it('should render CYA template page with nlr fields if hasNlr Yes nlrAttending No nlrOutsideUK Yes with interpreter but undefined values', () => {
        req.session.appeal.application.hasNonLegalRep = 'Yes';
        req.session.appeal.hearingRequirements.nlrAttending = 'No';
        req.session.appeal.hearingRequirements.nlrOutsideUK = 'Yes';
        req.session.appeal.hearingRequirements.isNlrInterpreterRequired = 'Yes';
        req.session.appeal.hearingRequirements.nlrNeedsStepFreeAccess = 'Yes';
        req.session.appeal.hearingRequirements.nlrNeedsHearingLoop = 'Yes';
        req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = undefined;
        req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = undefined;
        getCheckAndSendPage(req as Request, res as Response, next);
        const expectedNlrSection = {
          title: '3. Non-legal representative', summaryLists: [
            {
              title: 'Non-legal representative', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative attend the hearing?'),
                summaryRow('Answer', 'No', '/hearing-non-legal-rep'),
                summaryRow('Question', 'Will your non-legal representative take part in the hearing from outside the UK?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-outside-uk'),
                summaryRow('Question', 'Will your non-legal representative need an interpreter at the hearing?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-interpreter')
              ]
            }, {
              title: 'Interpreter', summaryRows: [
                summaryRow('Question', 'What kind of interpreter do you need to request for your non-legal representative?'),
                summaryRow('Answer', '', '/hearing-non-legal-rep-interpreter-types')
              ]
            }, {
              title: 'Step-free access', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative need step-free access?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-step-free-access')
              ]
            }, {
              title: 'Hearing loop', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative need a hearing loop?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-hearing-loop')
              ]
            },
          ]
        };

        expect(renderStub).calledWith('templates/check-and-send.njk', {
          pageTitle: 'Check your answers',
          formAction: paths.submitHearingRequirements.checkAndSend,
          previousPage: paths.submitHearingRequirements.taskList,
          summarySections: [sinon.match.object, sinon.match.object, expectedNlrSection, sinon.match.object, sinon.match.object]
        });
      });

      it('should render CYA template page with nlr fields if hasNlr Yes nlrAttending No nlrOutsideUK Yes with interpreter but no choice', () => {
        req.session.appeal.application.hasNonLegalRep = 'Yes';
        req.session.appeal.hearingRequirements.nlrAttending = 'No';
        req.session.appeal.hearingRequirements.nlrOutsideUK = 'Yes';
        req.session.appeal.hearingRequirements.isNlrInterpreterRequired = 'Yes';
        req.session.appeal.hearingRequirements.nlrNeedsStepFreeAccess = 'Yes';
        req.session.appeal.hearingRequirements.nlrNeedsHearingLoop = 'Yes';
        req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = 'something' as any;
        req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = 'something' as any;
        req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['invalid'];

        getCheckAndSendPage(req as Request, res as Response, next);
        const expectedNlrSection = {
          title: '3. Non-legal representative', summaryLists: [
            {
              title: 'Non-legal representative', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative attend the hearing?'),
                summaryRow('Answer', 'No', '/hearing-non-legal-rep'),
                summaryRow('Question', 'Will your non-legal representative take part in the hearing from outside the UK?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-outside-uk'),
                summaryRow('Question', 'Will your non-legal representative need an interpreter at the hearing?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-interpreter')
              ]
            }, {
              title: 'Interpreter', summaryRows: [
                summaryRow('Question', 'What kind of interpreter do you need to request for your non-legal representative?'),
                summaryRow('Answer', '', '/hearing-non-legal-rep-interpreter-types')
              ]
            }, {
              title: 'Step-free access', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative need step-free access?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-step-free-access')
              ]
            }, {
              title: 'Hearing loop', summaryRows: [
                summaryRow('Question', 'Will your non-legal representative need a hearing loop?'),
                summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-hearing-loop')
              ]
            },
          ]
        };

        expect(renderStub).calledWith('templates/check-and-send.njk', {
          pageTitle: 'Check your answers',
          formAction: paths.submitHearingRequirements.checkAndSend,
          previousPage: paths.submitHearingRequirements.taskList,
          summarySections: [sinon.match.object, sinon.match.object, expectedNlrSection, sinon.match.object, sinon.match.object]
        });
      });
    });

    it('should render CYA template page with nlr fields if hasNlr Yes nlrAttending No nlrOutsideUK Yes with interpreter with both choices', () => {
      req.session.appeal.application.hasNonLegalRep = 'Yes';
      req.session.appeal.hearingRequirements.nlrAttending = 'No';
      req.session.appeal.hearingRequirements.nlrOutsideUK = 'Yes';
      req.session.appeal.hearingRequirements.isNlrInterpreterRequired = 'Yes';
      req.session.appeal.hearingRequirements.nlrNeedsStepFreeAccess = 'Yes';
      req.session.appeal.hearingRequirements.nlrNeedsHearingLoop = 'Yes';
      req.session.appeal.hearingRequirements.nlrInterpreterSpokenLanguage = { languageRefData: { value: { label: 'someSpokenLanguage' } } } as any;
      req.session.appeal.hearingRequirements.nlrInterpreterSignLanguage = { languageRefData: { value: { label: 'someSignLanguage' } } } as any;
      req.session.appeal.hearingRequirements.nlrInterpreterLanguageCategory = ['spokenLanguageInterpreter', 'signLanguageInterpreter'];

      getCheckAndSendPage(req as Request, res as Response, next);
      const expectedNlrSection = {
        title: '3. Non-legal representative', summaryLists: [
          {
            title: 'Non-legal representative', summaryRows: [
              summaryRow('Question', 'Will your non-legal representative attend the hearing?'),
              summaryRow('Answer', 'No', '/hearing-non-legal-rep'),
              summaryRow('Question', 'Will your non-legal representative take part in the hearing from outside the UK?'),
              summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-outside-uk'),
              summaryRow('Question', 'Will your non-legal representative need an interpreter at the hearing?'),
              summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-interpreter')
            ]
          }, {
            title: 'Interpreter', summaryRows: [
              summaryRow('Question', 'What kind of interpreter do you need to request for your non-legal representative?'),
              summaryRow('Answer', 'Spoken language interpreter<br>Sign language interpreter', '/hearing-non-legal-rep-interpreter-types'),
              summaryRow('Question', 'Tell us about your non-legal representative\'s language requirements'),
              summaryRow('Answer', 'someSpokenLanguage', '/hearing-non-legal-rep-interpreter-spoken-language-selection'),
              summaryRow('Question', 'Tell us about your non-legal representative\'s sign language requirements'),
              summaryRow('Answer', 'someSignLanguage', '/hearing-non-legal-rep-interpreter-sign-language-selection')
            ]
          }, {
            title: 'Step-free access', summaryRows: [
              summaryRow('Question', 'Will your non-legal representative need step-free access?'),
              summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-step-free-access')
            ]
          }, {
            title: 'Hearing loop', summaryRows: [
              summaryRow('Question', 'Will your non-legal representative need a hearing loop?'),
              summaryRow('Answer', 'Yes', '/hearing-non-legal-rep-hearing-loop')
            ]
          },
        ]
      };

      expect(renderStub).calledWith('templates/check-and-send.njk', {
        pageTitle: 'Check your answers',
        formAction: paths.submitHearingRequirements.checkAndSend,
        previousPage: paths.submitHearingRequirements.taskList,
        summarySections: [sinon.match.object, sinon.match.object, expectedNlrSection, sinon.match.object, sinon.match.object]
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getCheckAndSendPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postCheckAndSendPage', () => {
    it('should submit and redirect to confirmation page', async () => {
      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      // expect(req.session.appeal.hearingRequirements).to.deep.equal(hearingRequirements);
      // expect(submitStub.calledWith(Events.SUBMIT_HEARING_REQUIREMENTS, req)).to.equal(true);
      // expect(req.session.appeal.appealStatus).to.equal('hearingRequirementsSubmitted');
      expect(redirectStub.calledWith(paths.submitHearingRequirements.confirmation)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.redirect = redirectStub.throws(error);

      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

})
;

function summaryRow(key: string, value: string, changeLink?: string): SummaryRow {
  const row = {
    'key': {
      'text': key
    },
    'value': {
      'html': value
    }
  };
  if (changeLink) {
    row['actions'] = {
      'items': [
        {
          'href': changeLink + '?edit',
          'text': 'Change',
          'visuallyHiddenText': key
        }
      ]
    };
  }
  return row;
}
