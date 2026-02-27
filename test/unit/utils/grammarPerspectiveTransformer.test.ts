import { transformPerspectiveToThird } from '../../../app/utils/grammarPerspectiveTransformer';
import { expect } from '../../utils/testUtils';

describe('transformPerspectiveToThird', () => {
  describe('primitive values', () => {
    it('returns null unchanged', () => {
      expect(transformPerspectiveToThird(null)).to.equal(null);
    });

    it('returns undefined unchanged', () => {
      expect(transformPerspectiveToThird(undefined)).to.equal(undefined);
    });

    it('returns numbers unchanged', () => {
      expect(transformPerspectiveToThird(42)).to.equal(42);
    });

    it('returns booleans unchanged', () => {
      expect(transformPerspectiveToThird(true)).to.equal(true);
    });
  });

  describe('deepTransform behaviour', () => {

    it('transforms nested objects', () => {
      const input = {
        title: 'You disagree',
        body: {
          text: 'You must respond'
        }
      };

      const result = transformPerspectiveToThird(input);

      expect(result).to.deep.equal({
        title: 'The appellant disagrees',
        body: {
          text: 'The appellant must respond'
        }
      });
    });

    it('transforms arrays', () => {
      const input = ['You disagree', 'You must respond'];

      const result = transformPerspectiveToThird(input);

      expect(result).to.deep.equal([
        'The appellant disagrees',
        'The appellant must respond'
      ]);
    });

    it('does not mutate original object', () => {
      const input = { text: 'You disagree' };
      const clone = JSON.parse(JSON.stringify(input));

      transformPerspectiveToThird(input);

      expect(input).to.deep.equal(clone);
    });

  });

  describe('structured phrase replacements', () => {

    it('replaces "You have"', () => {
      expect(transformPerspectiveToThird('You have applied'))
        .to.equal('The appellant has applied');
    });

    it('replaces "You disagree"', () => {
      expect(transformPerspectiveToThird('You disagree'))
        .to.equal('The appellant disagrees');
    });

    it('replaces "Tell us"', () => {
      expect(transformPerspectiveToThird('Tell us why'))
        .to.equal('The appellant needs to tell us why');
    });

    it('replaces numbered call instruction', () => {
      expect(transformPerspectiveToThird('1. Call the tribunal'))
        .to.equal('1. They should call the tribunal');
    });

    it('handles complex sentence rule', () => {
      const input = 'You might not get more time. You must act.';
      const output = transformPerspectiveToThird(input);

      expect(output)
        .to.equal('The appellant might not get more time. They must act.');
    });

  });

  describe('lowercase replacements', () => {

    it('replaces "you disagree"', () => {
      expect(transformPerspectiveToThird('If you disagree'))
        .to.equal('If the appellant disagrees');
    });

    it('replaces "you do"', () => {
      expect(transformPerspectiveToThird('If you do not respond'))
        .to.equal('If they do not respond');
    });

    it('replaces "you believe"', () => {
      expect(transformPerspectiveToThird('you believe this is wrong'))
        .to.equal('they believe this is wrong');
    });

    it('replaces "with you"', () => {
      expect(transformPerspectiveToThird('We will meet with you'))
        .to.equal('We will meet with them');
    });

  });

  describe('possessive handling', () => {

    it('replaces "Your appeal"', () => {
      expect(transformPerspectiveToThird('Your appeal is listed'))
        .to.equal("The appellant's appeal is listed");
    });

    it('replaces "your application"', () => {
      expect(transformPerspectiveToThird('your application was refused'))
        .to.equal("the appellant's application was refused");
    });

    it('replaces "yourself"', () => {
      expect(transformPerspectiveToThird('You can represent yourself'))
        .to.equal('The appellant can represent themself');
    });

  });

  describe('override corrections', () => {

    it('fixes double appellant send application case', () => {
      const input = "The appellant must send the appellant's application";
      const result = transformPerspectiveToThird(input);

      expect(result)
        .to.equal('They must send their application');
    });

    it('fixes "they do not pay the fee"', () => {
      const input = 'they do not pay the fee';
      const result = transformPerspectiveToThird(input);

      expect(result)
        .to.equal('the appellant does not pay the fee');
    });

  });

  describe('removeLink behaviour', () => {

    it('removes link but keeps text when removeText=false (unquoted href)', () => {
      const input =
        'Click <a href={{ paths.makeApplication.judgesReview }}>here</a> now';

      const result = transformPerspectiveToThird(input);

      expect(result).to.equal('Click here now');
    });

    it('removes link but keeps text when removeText=false (quoted href)', () => {
      const input =
        'Click <a href="{{ paths.common.provideMoreEvidenceForm }}">here</a> now';

      const result = transformPerspectiveToThird(input);

      expect(result).to.equal('Click here now');
    });

    it('removes entire link when removeText=true', () => {
      const input =
        'Apply <a href={{ paths.ftpa.ftpaApplication }}>here</a> today';

      const result = transformPerspectiveToThird(input);

      expect(result).to.equal('Apply  today');
    });

  });

  describe('handlebars protection', () => {

    it('does not modify handlebars expressions', () => {
      const input = 'You must respond by {{ deadline }}';
      const result = transformPerspectiveToThird(input);

      expect(result)
        .to.equal('The appellant must respond by {{ deadline }}');
    });

    it('handles multiple handlebars blocks', () => {
      const input =
        'You have until {{ date }} to send {{ document }}';

      const result = transformPerspectiveToThird(input);

      expect(result)
        .to.equal('The appellant has until {{ date }} to send {{ document }}');
    });
  });

  describe('HTML preservation', () => {
    it('preserves HTML tags', () => {
      const input = '<p>You disagree with the decision</p>';
      const result = transformPerspectiveToThird(input);

      expect(result)
        .to.equal('<p>The appellant disagrees with the decision</p>');
    });
  });

  it('should cover big data object successfully', () => {
    const bigData = {
      'appealStarted': {
        'fewQuestions': 'You need to answer a few questions about yourself and your appeal to get started.',
        'finishQuestions': 'You need to finish telling us about your appeal.',
        'needHomeOfficeDecision': 'You will need to have your Home Office decision letter with you to answer some questions.'
      },
      'appealSubmitted': {
        'detailsSent': 'Your appeal details have been sent to the Tribunal.',
        'dueDate': "A Tribunal Caseworker will contact you to tell you what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        }
      },
      'appealSubmittedDlrmFeeRemission': {
        'detailsSent': 'Your appeal details have been sent to the Tribunal.',
        'feeDetails': 'There is a fee for this appeal. You told the Tribunal that you believe you do not have to pay some or all of the fee.',
        'tribunalCheck': 'The Tribunal will check the information you sent and let you know if you need to pay a fee.',
        'dueDate': "This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that."
      },
      'pendingPayment': {
        'payForYourAppeal': 'Pay for your appeal',
        'detailsSent': 'Your appeal details have been sent to the Tribunal.',
        'detailsSentLate': 'Your late appeal details have been sent to the Tribunal.',
        'dueDate': "You must pay for your appeal by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span>.",
        'dueDate1': 'The Tribunal may end your appeal if you do not pay.'
      },
      'appealTakenOffline': {
        'description': 'Your appeal was removed from the online service on <date of removal>. The reason for this is:',
        'reason': '',
        'info': {
          'title': 'What happens next',
          'description': 'Your appeal will continue offline. The Tribunal will contact you soon to tell you what will happen next.'
        }
      },
      'lateAppealSubmitted': {
        'detailsSent': 'Your late appeal details have been sent to the Tribunal.',
        'dueDate': "A Tribunal Caseworker will contact you to tell you what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        }
      },
      'lateAppealSubmittedDlrmFeeRemission': {
        'detailsSent': 'Your appeal details have been sent to the Tribunal.',
        'feeDetails': 'There is a fee for this appeal. You told the Tribunal that you believe you do not have to pay some or all of the fee.',
        'tribunalCheck': 'The Tribunal will check the information you sent and let you know if you need to pay a fee.',
        'dueDate': "This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that."
      },
      'lateAppealRejected': {
        'description': "Your appeal cannot continue. Read the <a href='{{ paths.common.outOfTimeDecisionViewer }}'>reasons for this decision</a>.",
        'description2': 'If you do not contact the Tribunal within 14 days of the decision, a Tribunal Caseworker will end the appeal.'
      },
      'cmaRequirementsSubmitted': {
        'description': 'A Tribunal Caseworker is looking at your answers and will contact you with details of your case management appointment and tell you what to do next.',
        'description2': 'This should be by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> but may be longer than that.',
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
        }
      },
      'awaitingRespondentEvidence': {
        'detailsSent': 'Your appeal details have been sent to the Tribunal.',
        'dueDate': "A Tribunal Caseworker will contact you by <span  class='govuk-!-font-weight-bold'> {{ applicationNextStep.deadline }}</span>  to tell you what to do next.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        }
      },
      'respondentReview': {
        'detailsSent': "The Tribunal has asked the Home Office to review your appeal. The Home Office will look at all the information you sent to the Tribunal and will either withdraw or maintain their decision to refuse your application to stay in or enter the UK. <ul class='govuk-list govuk-list--bullet'><li>If the Home Office withdraw their decision it means they will look again at their decision to refuse your application</li><li>If the Home Office maintain their decision it means they still think they were correct to refuse your application</li></ul>",
        'dueDate': "A Tribunal Caseworker will contact you to tell you what to do next. This should be by<span  class='govuk-!-font-weight-bold'> {{ applicationNextStep.deadline }}</span> but it might be later than that.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link govuk-!-margin-bottom-2 --display-block' href='{{ paths.common.homeOfficeWithdrawDecision }}'>What happens if the Home Office withdraw their decision</a><a class='govuk-link' href='{{ paths.common.homeOfficeMaintainDecision }}'>What happens if the Home Office maintain their decision</a>"
        }
      },
      'decisionWithdrawn': {
        'detailsSent': "The Home Office has reviewed your appeal and decided to withdraw their decision to refuse your application to stay in or enter the UK. Read the <a class='govuk-link' href='{{ paths.common.homeOfficeWithdrawLetter }}'>Home Office Withdrawal Letter</a>.",
        'dueDate': "Your appeal may end. If you do not want the appeal to end, you must email <a class='govuk-link' href=\"mailto:{{ applicationNextStep.hearingCentreEmail }}\">{{ applicationNextStep.hearingCentreEmail }}</a> by <span class='govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> to explain why.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.homeOfficeWithdrawDecision }}'>What happens if the Home Office withdraw their decision</a>"
        }
      },
      'decisionMaintained': {
        'description': "The Home Office has reviewed your appeal and decided to maintain their decision to refuse your application to stay in or enter the UK. Read the <a class='govuk-link' href='{{ paths.common.homeOfficeResponse }}'>Home Office Response</a>.",
        'description2': "If you want to respond, you can <a class='govuk-link' href='{{ paths.common.provideMoreEvidenceForm }}'>provide more evidence</a> at any time.",
        'dueDate': "Your appeal will be decided at a hearing. A Tribunal Caseworker will contact you by <span class='govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> to ask if there is anything you will need at the hearing.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link govuk-!-margin-bottom-2 --display-block' href='{{ paths.common.homeOfficeMaintainDecision }}'>What happens if the Home Office maintain their decision</a><a class='govuk-link' href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'awaitingReasonsForAppeal': {
        'new': {
          'description': 'Tell us why you think the Home Office decision to refuse your claim is wrong.',
          'descriptionAskForMoreTime': 'You might not get more time. You should still try to tell us why you think the Home Office decision is wrong by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if you can.',
          'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later.',
          'info': {
            'title': 'Helpful Information',
            'url': "<a class='govuk-link' href='{{ paths.common.homeOfficeDocuments }}'>Understanding your Home Office documents</a>"
          },
          'usefulDocuments': {
            'title': 'Useful documents',
            'url': "<a class='govuk-link' href='{{ paths.common.homeOfficeDocumentsViewer }}'>Home Office documents about your case</a>"
          }
        },
        'partial': {
          'description': 'You need to finish telling us why you think the Home Office decision to refuse your claim is wrong.',
          'descriptionAskForMoreTime': 'You might not get more time. You need to finish telling us why you think the Home Office decision is wrong by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if you can.',
          'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later.',
          'info': {
            'title': 'Helpful Information',
            'url': "<a href='{{ paths.common.homeOfficeDocuments }}'>Understanding your Home Office documents</a>"
          },
          'usefulDocuments': {
            'title': 'Useful documents',
            'url': "<a href='{{ paths.common.homeOfficeDocumentsViewer }}'>Home Office documents about your case</a>"
          }
        }
      },
      'reasonsForAppealSubmitted': {
        'detailsSent': 'You have told us why you think the Home Office decision is wrong.',
        'dueDate': "A Tribunal Caseworker will contact you to tell you what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it may take longer than that."
      },
      'caseUnderReview': {
        'detailsSent': 'The reasons you think the Home Office decision to refuse your claim is wrong were sent to the Tribunal.',
        'dueDate': "A Tribunal Caseworker will contact you to tell you what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it may take longer than that."
      },
      'clarifyingQuestions': {
        'description': 'You need to answer some questions about your appeal.',
        'descriptionAskForMoreTime': 'You might not get more time. You need to finish answering the Tribunal’s questions by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if you can.',
        'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later.'
      },
      'awaitingCmaRequirements': {
        'description': 'You need to attend a case management appointment.',
        'description2': 'First, tell us if you will need anything at the appointment, like an interpreter or step-free access.',
        'descriptionAskForMoreTime': 'You might not get more time. You should still try and provide the requirements by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if you can.',
        'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later.',
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
        }
      },
      'clarifyingQuestionsAnswersSubmitted': {
        'description': 'A Tribunal Caseworker is looking at your answers and will contact you to tell you what to do next.',
        'dueDate': 'This should be by <b>{{ applicationNextStep.deadline }}</b> but it might take longer than that.'
      },
      'submitHearingRequirements': {
        'description': 'Your appeal is going to hearing.',
        'description2': 'Tell us if there is anything you will need at the hearing, like an <p>interpreter or step-free access.',
        'descriptionAskForMoreTime': 'You need to respond by by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span>.',
        'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later.',
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'ended': {
        'description': 'ended desc',
        'dueDate': 'ended  should be by <b>{{ applicationNextStep.deadline }}</b> but it might take longer than that.',
        'ctaTitle': 'Your appeal has now ended',
        'ctaInstruction': 'Review your <a href="{{ paths.common.noticeEndedAppealViewer }}">Notice of Ended Appeal</a>. This includes details of who ended the appeal and why.',
        'ctaReview': 'If a Tribunal Caseworker ended the appeal and you disagree with this decision, you have 14 days to <a href="{{ paths.makeApplication.judgesReview }}">ask for a judge to review the decision</a>.'
      },
      'decidedWithoutHearing': {
        'description': [
          'You chose to have your appeal to be decided without a hearing.',
          'A judge will decide your appeal based on the information and evidence provided by you and the Home Office.',
          'The Tribunal will contact you when a decision has been made.'
        ]
      },
      'cmaListed': {
        'description': 'The Tribunal has set a date for your case management appointment. Here are the details:',
        'date': '<span class="govuk-!-font-weight-bold">Date:</span> {{ applicationNextStep.date }}',
        'time': '<span class="govuk-!-font-weight-bold">Time:</span> {{ applicationNextStep.time }}',
        'hearingCentre': '<span class="govuk-!-font-weight-bold">Hearing Centre:</span> {{ applicationNextStep.hearingCentre }}',
        'respondByTextAskForMoreTime': 'You should read your Notice of Case Management Appointment carefully. It has important information about your appointment.',
        'usefulDocuments': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
        },
        'usefulDoc': {
          'title': 'Useful documents',
          'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>Notice of Case Management Appointment.pdf</a>"
        }
      },
      'listing': {
        'providedByLr': {
          'direction1': 'Your hearing needs were sent to the Tribunal.',
          'direction2': 'A Tribunal Caseworker is looking at the answers and will contact you with the details of your hearing and tell you what to do next.'
        },
        'detailsSent': 'A Tribunal Caseworker is looking at your answers and will contact you with the details of your hearing and to tell you what to do next.',
        'dueDate': "This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it may take longer than that.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'prepareForHearing': {
        'providedByLr': {
          'description': 'The hearing bundle is ready to view. This is a record of all the information and evidence about this appeal. You should read it carefully.'
        },
        'description': 'The Tribunal has set a date for your hearing. Here are the details:',
        'date': '<span class="govuk-!-font-weight-bold">Date:</span> {{ applicationNextStep.date }}',
        'time': '<span class="govuk-!-font-weight-bold">Time:</span> {{ applicationNextStep.time }}',
        'hearingCentre': '<span class="govuk-!-font-weight-bold">Location:</span> {{ applicationNextStep.hearingCentre }} ',
        'hearingNotice': "You can now access your <a href='{{ paths.common.latestHearingNoticeViewer }}'>Notice of Hearing</a>.  It includes important<br>details about the hearing and you should read it carefully.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'preHearing': {
        'hearingBundle': 'The hearing bundle is ready to view. This is a record of  all the information and evidence about this appeal. You should read it carefully.',
        'hearingBundleLink': '<a class="govuk-link" href="{{ paths.common.hearingBundleViewer }}">View the hearing bundle</a>',
        'hearingDetails': '<h3 class="govuk-heading-s govuk-!-margin-bottom-0">Your hearing details</h3>',
        'hearingDateTimeCentre': "<span class='govuk-body govuk-!-font-weight-bold'>Date:</span> {{ hearingDetails.date }}<br /><span class='govuk-body govuk-!-font-weight-bold'>Time:</span> {{ hearingDetails.time }}<br /><span class='govuk-body govuk-!-font-weight-bold'>Location:</span> {{ hearingDetails.hearingCentre }}",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.understandingHearingBundle }}'>Understanding the hearing bundle</a><br /><a class='govuk-link' href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'decided': {
        'decision': 'A judge has <b> {{ applicationNextStep.decision }} </b> your appeal. <br>',
        'description': '<p>The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.</p><br> <a href={{ paths.common.decisionAndReasonsViewer }}>Read the Decision and Reasons document</a> <br> <p> If you disagree with this decision, you have until <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> to appeal to the Upper Tribunal. </p>',
        'descriptionFtpaEnabled': '<p>The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.</p><br> <a href={{ paths.common.decisionAndReasonsViewer }}>Read the Decision and Reasons document</a>',
        'updatedDescriptionFtpaEnabled': '<p>The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.</p><br> <a href={{ paths.common.updatedDecisionAndReasonsViewer }}>Read the Decision and Reasons document</a>',
        'info': {
          'title': 'Helpful Information',
          'titleFtpaEnabled': 'Appeal Information',
          'text': 'If you disagree with this decision, you have until <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> to apply for permission to appeal to the Upper Tribunal.',
          'url': '<a class="govuk-link" href="https://www.gov.uk/upper-tribunal-immigration-asylum">How to appeal to the Upper Tribunal (Opens in a new window)</a>',
          'urlFtpaEnabled': '<a href="{{ paths.ftpa.ftpaApplication }}">Apply for permission to appeal to the Upper Tribunal</a>'
        },
        'underRule32': {
          'description': 'A judge has reviewed your appeal decision and decided that your appeal should be heard again. <br>',
          'url': '<a href={{ paths.common.decisionAndReasonsViewerWithRule32 }}>Read the reasons for this decision</a> <br>',
          'info': {
            'title': 'What happens next',
            'text': 'There will be a new hearing for this appeal. The Tribunal will contact you soon to ask if there is anything you will need at the hearing.'
          }
        }
      },
      'ftpaSubmitted': {
        'description': {
          'appellant': [
            'A judge will decide your application for permission to appeal to the Upper Tribunal.',
            'The Tribunal will contact you when the judge has made a decision.'
          ],
          'respondent': [
            'The Home Office has applied for permission to appeal to the Upper Tribunal. The Tribunal will contact you when the judge has decided the application.'
          ]
        }
      },
      'ftpaDecided': {
        'respondent': {
          'granted': [
            'The Home Office application for permission to appeal to the Upper Tribunal has been granted.',
            "The Upper Tribunal will decide if the Tribunal's decision was wrong. The Upper Tribunal will contact you to tell you what will happen next."
          ],
          'partiallyGranted': [
            'The Home Office application for permission to appeal to the Upper Tribunal has been partially granted.',
            "The Upper Tribunal will decide if the Tribunal's decision was wrong. The Upper Tribunal will contact you to tell you what will happen next."
          ],
          'notAdmitted': [
            'The Home Office application for permission to appeal to the Upper Tribunal has been not admitted. This means the Tribunal did not consider the request because it was late or the Home Office did not have the right to appeal.',
            "If the Home Office still think the Tribunal's decision was wrong, they can send an application for permission to appeal directly to the Upper Tribunal. You will be notified if this happens."
          ],
          'refused': [
            'The HOme Office application for permission to appeal to the Upper Tribunal has been refused.',
            "If the Home Office still think the Tribunal's decision was wrong, they can send an application for permission to appeal directly to the Upper Tribunal. You will be notified if this happens."
          ],
          'reheardRule35': [
            'A judge has reviewed the Home Office application for permission to appeal to the Upper Tribunal and decided that this appeal should be heard again by the First-tier Tribunal.',
            'The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the decision and reasons document</a>',
            '<b>What happens next</b>',
            'There will be a new hearing for this appeal. The Tribunal will contact you soon to ask if there is anything you will need at the hearing.'
          ],
          'remadeRule31': [
            'A judge has reviewed the Home Office application for permission to appeal to the Upper Tribunal and decided to review your appeal decision.<br>',
            '<a href={{ paths.common.ftpaDecisionViewer }}>See the reasons for this decision</a>',
            '<b>What happens next</b>',
            'The Tribunal will contact you when the review of your appeal decision is complete.'
          ],
          'remadeRule32': [
            'A judge has reviewed the Home Office application for permission to appeal to the Upper Tribunal and decided to review your appeal decision.<br>',
            '<a href={{ paths.common.ftpaDecisionViewer }}>See the reasons for this decision</a>',
            '<b>What happens next</b>',
            'The Tribunal will contact you when the review of your appeal decision is complete.'
          ]
        },
        'appellant': {
          'granted': [
            'A judge has <b> granted </b> your application for permission to appeal to the Upper Tribunal.',
            'The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            "The Upper Tribunal will decide if the Tribunal's decision was wrong. The Upper Tribunal will contact you soon to tell you what will happen next."
          ],
          'partiallyGranted': [
            'A judge has <b> partially granted </b> your application for permission to appeal to the Upper Tribunal.',
            'The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            "The Upper Tribunal will decide if the Tribunal's decision was wrong. The Upper Tribunal will contact you soon to tell you what will happen next.",
            'If you think your application should have been fully granted, you can send an application for permission to appeal directly to the Upper Tribunal.',
            '<a class="govuk-link" href="https://www.gov.uk/upper-tribunal-immigration-asylum">Find out how to apply</a>',
            'You must send your application by {{ applicationNextStep.ftpaDeadline }}'
          ],
          'notAdmitted': [
            'A judge has <b> not admitted </b> your application for permission to appeal to the Upper Tribunal.',
            'The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            "If you still think the Tribunal's decision was wrong, you can send an application for permission to appeal directly to the Upper Tribunal.",
            '<a class="govuk-link" href="https://www.gov.uk/upper-tribunal-immigration-asylum">Find out how to apply for permission to appeal to the Upper Tribunal</a>',
            'You must send your application by {{ applicationNextStep.ftpaDeadline }}'
          ],
          'refused': [
            'A judge has <b> refused </b> your application for permission to appeal to the Upper Tribunal.<br>',
            'The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            "If you still think the Tribunal's decision was wrong, you can send an application for permission to appeal directly to the Upper Tribunal.",
            '<a class="govuk-link" href="https://www.gov.uk/upper-tribunal-immigration-asylum">Find out how to apply for permission to appeal to the Upper Tribunal</a>',
            'You must send your application by {{ applicationNextStep.ftpaDeadline }}'
          ],
          'reheardRule35': [
            'A judge has reviewed your application for permission to appeal to the Upper Tribunal and decided that your appeal should be heard again by the First-tier Tribunal.<br>',
            'The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            'There will be a new hearing for this appeal. The Tribunal will contact you soon to ask if there is anything you will need at the hearing.'
          ],
          'remadeRule31': [
            'A judge has reviewed your application for permission to appeal to the Upper Tribunal and decided to review your appeal decision.<br>',
            '<a href={{ paths.common.ftpaDecisionViewer }}>See the reasons for this decision</a>',
            '<b>What happens next</b>',
            'The Tribunal will contact you when the review of your appeal decision is complete.'
          ],
          'remadeRule32': [
            'A judge has reviewed your application for permission to appeal to the Upper Tribunal and decided to review your appeal decision.<br>',
            '<a href={{ paths.common.ftpaDecisionViewer }}>See the reasons for this decision</a>',
            '<b>What happens next</b>',
            'The Tribunal will contact you when the review of your appeal decision is complete.'
          ]
        }
      },
      'transferredToUt': {
        'description': 'Your appeal has been moved to the Upper Tribunal, which is a higher tribunal than the First-tier tribunal.',
        'explanation': 'This is because you also have an expedited section 82A appeal in the Upper Tribunal, with the following appeal reference:',
        'utAppealReferenceNumber': '{{ applicationNextStep.utAppealReferenceNumber }}',
        'utAction': 'An Upper Tribunal judge will decide both appeals at the same time.',
        'info': {
          'title': 'What happens next',
          'description': '\nThe upper tribunal may contact you about this appeal.<br /><br />If you still have to respond to a question about your appeal from the First-tier Tribunal, you should tell the Upper Tribunal. The Upper Tribunal will decide what will happen next.'
        },
        'usefulDocuments': {
          'title': 'Helpful Information',
          'url': '<a class="govuk-link" href="https://www.gov.uk/courts-tribunals/upper-tribunal-immigration-and-asylum-chamber" target="_blank">Find out more about the Upper Tribunal, including contact details</a>. (Opens in a new window)'
        }
      },
      'remitted': {
        'decision': 'The {{ applicationNextStep.sourceOfRemittal }} has decided that this appeal will be heard again by the First-tier Tribunal. <br><br> <a href={{ paths.common.remittalDocumentsViewer }}>See the {{ applicationNextStep.sourceOfRemittal }} documents</a> <br><br> <b>What happens next</b> <br><br> There will be a new hearing for this appeal. The Tribunal will contact you to let you know what to do next. <br><br> You can <a href={{ paths.common.provideMoreEvidenceForm }}>provide more evidence for this appeal</a> to the Tribunal, if you have it.'
      },
      'remissionDecided': {
        'approved': {
          'detailsSent': 'Your appeal details have been sent to the Tribunal.',
          'legalOfficerCheck': "A Legal Officer will contact you to tell you what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that.",
          'helpFulInfo': '<b>Helpful information</b>',
          'href': '<a href={{ paths.common.tribunalCaseworker }}>What is a Tribunal Caseworker?</a>'
        },
        'rejected': {
          'feeForAppeal': 'The fee for this appeal is £{{ applicationNextStep.feeForAppeal }}.',
          'dueDate': "If you do not pay the fee by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.remissionRejectedDatePlus14days }}</span> the Tribunal will end the appeal.",
          'payForAppeal': '<a href={{ paths.common.payLater }}>Pay for the appeal</a>'
        },
        'partiallyApproved': {
          'feeForAppeal': 'The fee for this appeal is £{{ applicationNextStep.feeLeftToPay }}.',
          'dueDate': "If you do not pay the fee by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.remissionRejectedDatePlus14days }}</span> the Tribunal will end the appeal.",
          'howToPay': '<b>How to pay the fee</b>',
          'bulletText': '1. Call the Tribunal on 0300 123 1711, then select option 4<br />2. Provide your 16-digit online case reference number: {{ applicationNextStep.ccdReferenceNumber }}<br />3. Make the payment with a debit or credit card'
        },
        'feeSupportRequested': 'Fee support requested',
        'feeSupportStatusApproved': 'Fee support request approved',
        'feeSupportStatusRefused': 'Fee support request refused',
        'feeSupportStatusPartiallyApproved': 'Fee support partially approved',
        'paymentPending': {
          'decisionApprovedPaymentStatus': 'No payment needed',
          'decisionPartiallyApprovedPaymentStatus': 'Not paid',
          'decisionRejectedPaymentStatus': 'Not paid'
        }
      }
    };
    const expectedData = {
      'appealStarted': {
        'fewQuestions': 'The appellant needs to answer a few questions about themself and their appeal to get started.',
        'finishQuestions': 'The appellant needs to finish telling us about their appeal.',
        'needHomeOfficeDecision': 'The appellant will need to have their Home Office decision letter with them to answer some questions.'
      },
      'appealSubmitted': {
        'detailsSent': "The appellant's appeal details have been sent to the Tribunal.",
        'dueDate': "A Tribunal Caseworker will contact the appellant to tell them what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        }
      },
      'appealSubmittedDlrmFeeRemission': {
        'detailsSent': "The appellant's appeal details have been sent to the Tribunal.",
        'feeDetails': 'There is a fee for this appeal. The appellant told the Tribunal that they believe they do not have to pay some or all of the fee.',
        'tribunalCheck': 'The Tribunal will check the information the appellant sent and let them know if they need to pay a fee.',
        'dueDate': "This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that."
      },
      'pendingPayment': {
        'payForYourAppeal': 'Pay for their appeal',
        'detailsSent': "The appellant's appeal details have been sent to the Tribunal.",
        'detailsSentLate': "The appellant's late appeal details have been sent to the Tribunal.",
        'dueDate': "The appellant must pay for their appeal by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span>.",
        'dueDate1': 'The Tribunal may end their appeal if they do not pay.'
      },
      'appealTakenOffline': {
        'description': "The appellant's appeal was removed from the online service on <date of removal>. The reason for this is:",
        'reason': '',
        'info': {
          'title': 'What happens next',
          'description': "The appellant's appeal will continue offline. The Tribunal will contact the appellant soon to tell them what will happen next."
        }
      },
      'lateAppealSubmitted': {
        'detailsSent': "The appellant's late appeal details have been sent to the Tribunal.",
        'dueDate': "A Tribunal Caseworker will contact the appellant to tell them what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        }
      },
      'lateAppealSubmittedDlrmFeeRemission': {
        'detailsSent': "The appellant's appeal details have been sent to the Tribunal.",
        'feeDetails': 'There is a fee for this appeal. The appellant told the Tribunal that they believe they do not have to pay some or all of the fee.',
        'tribunalCheck': 'The Tribunal will check the information the appellant sent and let them know if they need to pay a fee.',
        'dueDate': "This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that."
      },
      'lateAppealRejected': {
        'description': "The appellant's appeal cannot continue. Read the <a href='{{ paths.common.outOfTimeDecisionViewer }}'>reasons for this decision</a>.",
        'description2': 'If they do not contact the Tribunal within 14 days of the decision, a Tribunal Caseworker will end the appeal.'
      },
      'cmaRequirementsSubmitted': {
        'description': "A Tribunal Caseworker is looking at the appellant's answers and will contact them with details of their case management appointment and tell them what to do next.",
        'description2': 'This should be by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> but may be longer than that.',
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
        }
      },
      'awaitingRespondentEvidence': {
        'detailsSent': "The appellant's appeal details have been sent to the Tribunal.",
        'dueDate': "A Tribunal Caseworker will contact the appellant by <span  class='govuk-!-font-weight-bold'> {{ applicationNextStep.deadline }}</span>  to tell them what to do next.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        }
      },
      'respondentReview': {
        'detailsSent': "The Tribunal has asked the Home Office to review the appellant's appeal. The Home Office will look at all the information the appellant sent to the Tribunal and will either withdraw or maintain their decision to refuse the appellant's application to stay in or enter the UK. <ul class='govuk-list govuk-list--bullet'><li>If the Home Office withdraw their decision it means they will look again at their decision to refuse the appellant's application</li><li>If the Home Office maintain their decision it means they still think they were correct to refuse the appellant's application</li></ul>",
        'dueDate': "A Tribunal Caseworker will contact the appellant to tell them what to do next. This should be by<span  class='govuk-!-font-weight-bold'> {{ applicationNextStep.deadline }}</span> but it might be later than that.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link govuk-!-margin-bottom-2 --display-block' href='{{ paths.common.homeOfficeWithdrawDecision }}'>What happens if the Home Office withdraw their decision</a><a class='govuk-link' href='{{ paths.common.homeOfficeMaintainDecision }}'>What happens if the Home Office maintain their decision</a>"
        }
      },
      'decisionWithdrawn': {
        'detailsSent': "The Home Office has reviewed the appellant's appeal and decided to withdraw their decision to refuse the appellant's application to stay in or enter the UK. Read the <a class='govuk-link' href='{{ paths.common.homeOfficeWithdrawLetter }}'>Home Office Withdrawal Letter</a>.",
        'dueDate': "The appellant's appeal may end. If they do not want the appeal to end, the appellant must email <a class='govuk-link' href=\"mailto:{{ applicationNextStep.hearingCentreEmail }}\">{{ applicationNextStep.hearingCentreEmail }}</a> by <span class='govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> to explain why.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.homeOfficeWithdrawDecision }}'>What happens if the Home Office withdraw their decision</a>"
        }
      },
      'decisionMaintained': {
        'description': "The Home Office has reviewed the appellant's appeal and decided to maintain their decision to refuse the appellant's application to stay in or enter the UK. Read the <a class='govuk-link' href='{{ paths.common.homeOfficeResponse }}'>Home Office Response</a>.",
        'description2': "If the appellant want to respond, they can <a class='govuk-link' href='{{ paths.common.provideMoreEvidenceForm }}'>provide more evidence</a> at any time.",
        'dueDate': "The appellant's appeal will be decided at a hearing. A Tribunal Caseworker will contact the appellant by <span class='govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> to ask if there is anything they will need at the hearing.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link govuk-!-margin-bottom-2 --display-block' href='{{ paths.common.homeOfficeMaintainDecision }}'>What happens if the Home Office maintain their decision</a><a class='govuk-link' href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'awaitingReasonsForAppeal': {
        'new': {
          'description': 'The appellant needs to tell us why they think the Home Office decision to refuse their claim is wrong.',
          'descriptionAskForMoreTime': 'The appellant might not get more time. They should still try to tell us why they think the Home Office decision is wrong by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if they can.',
          'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if they can’t answer fully, they will be able to provide more information about their appeal later.',
          'info': {
            'title': 'Helpful Information',
            'url': "<a class='govuk-link' href='{{ paths.common.homeOfficeDocuments }}'>Understanding their Home Office documents</a>"
          },
          'usefulDocuments': {
            'title': 'Useful documents',
            'url': "<a class='govuk-link' href='{{ paths.common.homeOfficeDocumentsViewer }}'>Home Office documents about their case</a>"
          }
        },
        'partial': {
          'description': 'The appellant needs to finish telling us why they think the Home Office decision to refuse their claim is wrong.',
          'descriptionAskForMoreTime': 'The appellant might not get more time. They need to finish telling us why they think the Home Office decision is wrong by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if they can.',
          'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if they can’t answer fully, they will be able to provide more information about their appeal later.',
          'info': {
            'title': 'Helpful Information',
            'url': "<a href='{{ paths.common.homeOfficeDocuments }}'>Understanding their Home Office documents</a>"
          },
          'usefulDocuments': {
            'title': 'Useful documents',
            'url': "<a href='{{ paths.common.homeOfficeDocumentsViewer }}'>Home Office documents about their case</a>"
          }
        }
      },
      'reasonsForAppealSubmitted': {
        'detailsSent': 'The appellant has told us why they think the Home Office decision is wrong.',
        'dueDate': "A Tribunal Caseworker will contact the appellant to tell them what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it may take longer than that."
      },
      'caseUnderReview': {
        'detailsSent': 'The reasons the appellant thinks the Home Office decision to refuse their claim is wrong were sent to the Tribunal.',
        'dueDate': "A Tribunal Caseworker will contact the appellant to tell them what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it may take longer than that."
      },
      'clarifyingQuestions': {
        'description': 'The appellant needs to answer some questions about their appeal.',
        'descriptionAskForMoreTime': 'The appellant might not get more time. They need to finish answering the Tribunal’s questions by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if they can.',
        'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if they can’t answer fully, they will be able to provide more information about their appeal later.'
      },
      'awaitingCmaRequirements': {
        'description': 'The appellant needs to attend a case management appointment.',
        'description2': 'First, they need to tell us if they will need anything at the appointment, like an interpreter or step-free access.',
        'descriptionAskForMoreTime': 'The appellant might not get more time. They should still try and provide the requirements by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if they can.',
        'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if they can’t answer fully, they will be able to provide more information about their appeal later.',
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
        }
      },
      'clarifyingQuestionsAnswersSubmitted': {
        'description': "A Tribunal Caseworker is looking at the appellant's answers and will contact the appellant to tell them what to do next.",
        'dueDate': 'This should be by <b>{{ applicationNextStep.deadline }}</b> but it might take longer than that.'
      },
      'submitHearingRequirements': {
        'description': "The appellant's appeal is going to hearing.",
        'description2': 'The appellant needs to tell us if there is anything they will need at the hearing, like an <p>interpreter or step-free access.',
        'descriptionAskForMoreTime': 'The appellant needs to respond by by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span>.',
        'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if they can’t answer fully, they will be able to provide more information about their appeal later.',
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'ended': {
        'description': 'ended desc',
        'dueDate': 'ended  should be by <b>{{ applicationNextStep.deadline }}</b> but it might take longer than that.',
        'ctaTitle': "The appellant's appeal has now ended",
        'ctaInstruction': 'Review their <a href="{{ paths.common.noticeEndedAppealViewer }}">Notice of Ended Appeal</a>. This includes details of who ended the appeal and why.',
        'ctaReview': 'If a Tribunal Caseworker ended the appeal and the appellant disagrees with this decision, they have 14 days to ask for a judge to review the decision.'
      },
      'decidedWithoutHearing': {
        'description': [
          'The appellant chose to have their appeal to be decided without a hearing.',
          'A judge will decide their appeal based on the information and evidence provided by them and the Home Office.',
          'The Tribunal will contact the appellant when a decision has been made.'
        ]
      },
      'cmaListed': {
        'description': "The Tribunal has set a date for the appellant's case management appointment. Here are the details:",
        'date': '<span class="govuk-!-font-weight-bold">Date:</span> {{ applicationNextStep.date }}',
        'time': '<span class="govuk-!-font-weight-bold">Time:</span> {{ applicationNextStep.time }}',
        'hearingCentre': '<span class="govuk-!-font-weight-bold">Hearing Centre:</span> {{ applicationNextStep.hearingCentre }}',
        'respondByTextAskForMoreTime': 'The appellant should read their Notice of Case Management Appointment carefully. It has important information about their appointment.',
        'usefulDocuments': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
        },
        'usefulDoc': {
          'title': 'Useful documents',
          'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>Notice of Case Management Appointment.pdf</a>"
        }
      },
      'listing': {
        'providedByLr': {
          'direction1': "The appellant's hearing needs were sent to the Tribunal.",
          'direction2': 'A Tribunal Caseworker is looking at the answers and will contact them with the details of their hearing and tell them what to do next.'
        },
        'detailsSent': "A Tribunal Caseworker is looking at the appellant's answers and will contact them with the details of their hearing and to tell them what to do next.",
        'dueDate': "This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it may take longer than that.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'prepareForHearing': {
        'providedByLr': {
          'description': 'The hearing bundle is ready to view. This is a record of all the information and evidence about this appeal. The appellant should read it carefully.'
        },
        'description': "The Tribunal has set a date for the appellant's hearing. Here are the details:",
        'date': '<span class="govuk-!-font-weight-bold">Date:</span> {{ applicationNextStep.date }}',
        'time': '<span class="govuk-!-font-weight-bold">Time:</span> {{ applicationNextStep.time }}',
        'hearingCentre': '<span class="govuk-!-font-weight-bold">Location:</span> {{ applicationNextStep.hearingCentre }} ',
        'hearingNotice': "The appellant can now access their <a href='{{ paths.common.latestHearingNoticeViewer }}'>Notice of Hearing</a>.  It includes important<br>details about the hearing and they should read it carefully.",
        'info': {
          'title': 'Helpful Information',
          'url': "<a href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'preHearing': {
        'hearingBundle': 'The hearing bundle is ready to view. This is a record of  all the information and evidence about this appeal. The appellant should read it carefully.',
        'hearingBundleLink': '<a class="govuk-link" href="{{ paths.common.hearingBundleViewer }}">View the hearing bundle</a>',
        'hearingDetails': "<h3 class=\"govuk-heading-s govuk-!-margin-bottom-0\">The appellant's hearing details</h3>",
        'hearingDateTimeCentre': "<span class='govuk-body govuk-!-font-weight-bold'>Date:</span> {{ hearingDetails.date }}<br /><span class='govuk-body govuk-!-font-weight-bold'>Time:</span> {{ hearingDetails.time }}<br /><span class='govuk-body govuk-!-font-weight-bold'>Location:</span> {{ hearingDetails.hearingCentre }}",
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.understandingHearingBundle }}'>Understanding the hearing bundle</a><br /><a class='govuk-link' href='{{ paths.common.whatToExpectAtHearing }}'>What to expect at a hearing</a>"
        }
      },
      'decided': {
        'decision': 'A judge has <b> {{ applicationNextStep.decision }} </b> their appeal. <br>',
        'description': '<p>The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.</p><br> <a href={{ paths.common.decisionAndReasonsViewer }}>Read the Decision and Reasons document</a> <br> <p> If the appellant disagrees with this decision, they have until <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> to appeal to the Upper Tribunal. </p>',
        'descriptionFtpaEnabled': '<p>The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.</p><br> <a href={{ paths.common.decisionAndReasonsViewer }}>Read the Decision and Reasons document</a>',
        'updatedDescriptionFtpaEnabled': '<p>The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.</p><br> <a href={{ paths.common.updatedDecisionAndReasonsViewer }}>Read the Decision and Reasons document</a>',
        'info': {
          'title': 'Helpful Information',
          'titleFtpaEnabled': 'Appeal Information',
          'text': 'If the appellant disagrees with this decision, they have until <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> to apply for permission to appeal to the Upper Tribunal.',
          'url': '<a class="govuk-link" href="https://www.gov.uk/upper-tribunal-immigration-asylum">How to appeal to the Upper Tribunal (Opens in a new window)</a>',
          'urlFtpaEnabled': ''
        },
        'underRule32': {
          'description': "A judge has reviewed the appellant's appeal decision and decided that their appeal should be heard again. <br>",
          'url': '<a href={{ paths.common.decisionAndReasonsViewerWithRule32 }}>Read the reasons for this decision</a> <br>',
          'info': {
            'title': 'What happens next',
            'text': 'There will be a new hearing for this appeal. The Tribunal will contact the appellant soon to ask if there is anything they will need at the hearing.'
          }
        }
      },
      'ftpaSubmitted': {
        'description': {
          'appellant': [
            "A judge will decide the appellant's application for permission to appeal to the Upper Tribunal.",
            'The Tribunal will contact the appellant when the judge has made a decision.'
          ],
          'respondent': [
            'The Home Office has applied for permission to appeal to the Upper Tribunal. The Tribunal will contact the appellant when the judge has decided the application.'
          ]
        }
      },
      'ftpaDecided': {
        'respondent': {
          'granted': [
            'The Home Office application for permission to appeal to the Upper Tribunal has been granted.',
            "The Upper Tribunal will decide if the Tribunal's decision was wrong. The Upper Tribunal will contact the appellant to tell them what will happen next."
          ],
          'partiallyGranted': [
            'The Home Office application for permission to appeal to the Upper Tribunal has been partially granted.',
            "The Upper Tribunal will decide if the Tribunal's decision was wrong. The Upper Tribunal will contact the appellant to tell them what will happen next."
          ],
          'notAdmitted': [
            'The Home Office application for permission to appeal to the Upper Tribunal has been not admitted. This means the Tribunal did not consider the request because it was late or the Home Office did not have the right to appeal.',
            "If the Home Office still think the Tribunal's decision was wrong, they can send an application for permission to appeal directly to the Upper Tribunal. The appellant will be notified if this happens."
          ],
          'refused': [
            'The HOme Office application for permission to appeal to the Upper Tribunal has been refused.',
            "If the Home Office still think the Tribunal's decision was wrong, they can send an application for permission to appeal directly to the Upper Tribunal. The appellant will be notified if this happens."
          ],
          'reheardRule35': [
            'A judge has reviewed the Home Office application for permission to appeal to the Upper Tribunal and decided that this appeal should be heard again by the First-tier Tribunal.',
            'The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the decision and reasons document</a>',
            '<b>What happens next</b>',
            'There will be a new hearing for this appeal. The Tribunal will contact the appellant soon to ask if there is anything they will need at the hearing.'
          ],
          'remadeRule31': [
            "A judge has reviewed the Home Office application for permission to appeal to the Upper Tribunal and decided to review the appellant's appeal decision.<br>",
            '<a href={{ paths.common.ftpaDecisionViewer }}>See the reasons for this decision</a>',
            '<b>What happens next</b>',
            'The Tribunal will contact the appellant when the review of their appeal decision is complete.'
          ],
          'remadeRule32': [
            "A judge has reviewed the Home Office application for permission to appeal to the Upper Tribunal and decided to review the appellant's appeal decision.<br>",
            '<a href={{ paths.common.ftpaDecisionViewer }}>See the reasons for this decision</a>',
            '<b>What happens next</b>',
            'The Tribunal will contact the appellant when the review of their appeal decision is complete.'
          ]
        },
        'appellant': {
          'granted': [
            "A judge has <b> granted </b> the appellant's application for permission to appeal to the Upper Tribunal.",
            'The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            "The Upper Tribunal will decide if the Tribunal's decision was wrong. The Upper Tribunal will contact the appellant soon to tell them what will happen next."
          ],
          'partiallyGranted': [
            "A judge has <b> partially granted </b> the appellant's application for permission to appeal to the Upper Tribunal.",
            'The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            "The Upper Tribunal will decide if the Tribunal's decision was wrong. The Upper Tribunal will contact the appellant soon to tell them what will happen next.",
            'If the appellant thinks their application should have been fully granted, they can send an application for permission to appeal directly to the Upper Tribunal.',
            '<a class="govuk-link" href="https://www.gov.uk/upper-tribunal-immigration-asylum">Find out how to apply</a>',
            'They must send their application by {{ applicationNextStep.ftpaDeadline }}'
          ],
          'notAdmitted': [
            "A judge has <b> not admitted </b> the appellant's application for permission to appeal to the Upper Tribunal.",
            'The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            "If the appellant still thinks the Tribunal's decision was wrong, they can send an application for permission to appeal directly to the Upper Tribunal.",
            '<a class="govuk-link" href="https://www.gov.uk/upper-tribunal-immigration-asylum">Find out how to apply for permission to appeal to the Upper Tribunal</a>',
            'They must send their application by {{ applicationNextStep.ftpaDeadline }}'
          ],
          'refused': [
            "A judge has <b> refused </b> the appellant's application for permission to appeal to the Upper Tribunal.<br>",
            'The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            "If the appellant still thinks the Tribunal's decision was wrong, they can send an application for permission to appeal directly to the Upper Tribunal.",
            '<a class="govuk-link" href="https://www.gov.uk/upper-tribunal-immigration-asylum">Find out how to apply for permission to appeal to the Upper Tribunal</a>',
            'They must send their application by {{ applicationNextStep.ftpaDeadline }}'
          ],
          'reheardRule35': [
            "A judge has reviewed the appellant's application for permission to appeal to the Upper Tribunal and decided that their appeal should be heard again by the First-tier Tribunal.<br>",
            'The Decision and Reasons document includes the reasons the judge made this decision. The appellant should read it carefully.',
            '<a href={{ paths.common.ftpaDecisionViewer }}>Read the Decision and Reasons document</a>',
            '<b>What happens next</b>',
            'There will be a new hearing for this appeal. The Tribunal will contact the appellant soon to ask if there is anything they will need at the hearing.'
          ],
          'remadeRule31': [
            "A judge has reviewed the appellant's application for permission to appeal to the Upper Tribunal and decided to review the appellant's appeal decision.<br>",
            '<a href={{ paths.common.ftpaDecisionViewer }}>See the reasons for this decision</a>',
            '<b>What happens next</b>',
            'The Tribunal will contact the appellant when the review of their appeal decision is complete.'
          ],
          'remadeRule32': [
            "A judge has reviewed the appellant's application for permission to appeal to the Upper Tribunal and decided to review the appellant's appeal decision.<br>",
            '<a href={{ paths.common.ftpaDecisionViewer }}>See the reasons for this decision</a>',
            '<b>What happens next</b>',
            'The Tribunal will contact the appellant when the review of their appeal decision is complete.'
          ]
        }
      },
      'transferredToUt': {
        'description': "The appellant's appeal has been moved to the Upper Tribunal, which is a higher tribunal than the First-tier tribunal.",
        'explanation': 'This is because they also have an expedited section 82A appeal in the Upper Tribunal, with the following appeal reference:',
        'utAppealReferenceNumber': '{{ applicationNextStep.utAppealReferenceNumber }}',
        'utAction': 'An Upper Tribunal judge will decide both appeals at the same time.',
        'info': {
          'title': 'What happens next',
          'description': '\nThe upper tribunal may contact the appellant about this appeal.<br /><br />If they still have to respond to a question about their appeal from the First-tier Tribunal, the appellant should tell the Upper Tribunal. The Upper Tribunal will decide what will happen next.'
        },
        'usefulDocuments': {
          'title': 'Helpful Information',
          'url': '<a class="govuk-link" href="https://www.gov.uk/courts-tribunals/upper-tribunal-immigration-and-asylum-chamber" target="_blank">Find out more about the Upper Tribunal, including contact details</a>. (Opens in a new window)'
        }
      },
      'remitted': {
        'decision': 'The {{ applicationNextStep.sourceOfRemittal }} has decided that this appeal will be heard again by the First-tier Tribunal. <br><br> <a href={{ paths.common.remittalDocumentsViewer }}>See the {{ applicationNextStep.sourceOfRemittal }} documents</a> <br><br> <b>What happens next</b> <br><br> There will be a new hearing for this appeal. The Tribunal will contact the appellant to let them know what to do next. <br><br> The appellant can provide more evidence for this appeal to the Tribunal, if they have it.'
      },
      'remissionDecided': {
        'approved': {
          'detailsSent': "The appellant's appeal details have been sent to the Tribunal.",
          'legalOfficerCheck': "A Legal Officer will contact the appellant to tell them what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that.",
          'helpFulInfo': '<b>Helpful information</b>',
          'href': '<a href={{ paths.common.tribunalCaseworker }}>What is a Tribunal Caseworker?</a>'
        },
        'rejected': {
          'feeForAppeal': 'The fee for this appeal is £{{ applicationNextStep.feeForAppeal }}.',
          'dueDate': "If the appellant does not pay the fee by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.remissionRejectedDatePlus14days }}</span> the Tribunal will end the appeal.",
          'payForAppeal': ''
        },
        'partiallyApproved': {
          'feeForAppeal': 'The fee for this appeal is £{{ applicationNextStep.feeLeftToPay }}.',
          'dueDate': "If the appellant does not pay the fee by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.remissionRejectedDatePlus14days }}</span> the Tribunal will end the appeal.",
          'howToPay': '<b>How to pay the fee</b>',
          'bulletText': '1. They should call the Tribunal on 0300 123 1711, then select option 4<br />2. Provide their 16-digit online case reference number: {{ applicationNextStep.ccdReferenceNumber }}<br />3. Make the payment with a debit or credit card'
        },
        'feeSupportRequested': 'Fee support requested',
        'feeSupportStatusApproved': 'Fee support request approved',
        'feeSupportStatusRefused': 'Fee support request refused',
        'feeSupportStatusPartiallyApproved': 'Fee support partially approved',
        'paymentPending': {
          'decisionApprovedPaymentStatus': 'No payment needed',
          'decisionPartiallyApprovedPaymentStatus': 'Not paid',
          'decisionRejectedPaymentStatus': 'Not paid'
        }
      }
    };
    const result = transformPerspectiveToThird(bigData);
    expect(result).to.deep.equal(expectedData);
  });
});
