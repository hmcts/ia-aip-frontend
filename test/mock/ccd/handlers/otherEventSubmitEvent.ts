import { Mockttp } from 'mockttp';

type EventSubmitBody = {
  data: Record<string, any>;
  event: { id: string };
  eventType?: string;
};

function getNextState(body: EventSubmitBody): string {
  const appealType = body.data.appealType;
  switch (body.event.id) {
    case 'editAppeal':
      return 'appealStarted';
    case 'submitAppeal':
      return ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].includes(appealType)
        ? 'pendingPayment'
        : 'appealSubmitted';
    case 'editReasonsForAppeal':
      return 'awaitingReasonsForAppeal';
    case 'submitReasonsForAppeal':
      return 'reasonsForAppealSubmitted';
    case 'editTimeExtension':
    case 'submitTimeExtension':
    case 'makeAnApplication':
      return 'awaitingReasonsForAppeal';
    case 'editClarifyingQuestionAnswers':
      return 'awaitingClarifyingQuestionsAnswers';
    case 'submitClarifyingQuestionAnswers':
      return 'clarifyingQuestionsAnswersSubmitted';
    case 'submitCmaRequirements':
      return 'cmaRequirementsSubmitted';
    case 'editCmaRequirements':
      return 'awaitingCmaRequirements';
    case 'listCma':
      return 'cmaListed';
    case 'uploadAddendumEvidenceLegalRep':
      return 'preHearing';
    case 'applyForFTPAAppellant':
      return 'ftpaSubmitted';
    case 'residentJudgeFtpaDecision':
    case 'leadershipJudgeFtpaDecision':
      return 'ftpaDecided';
    default:
      throw new Error(`Event type ${body.eventType} no next state set`);
  }
}

export async function setupOtherEventSubmitEvent(server: Mockttp) {
  await server.forPost(
    /.*\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases\/([^/]+)\/events/
  ).always().thenCallback(async (request) => {
    const match = request.url.match(
      /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases\/([^/]+)\/events/
    );
    const caseId = match ? match[4] : '1';
    const text = await request.body.getText();
    const body = JSON.parse(text) as EventSubmitBody;
    // tslint:disable-next-line:no-console
    console.log('hitting setupOtherEventSubmitEvent');
    return {
      statusCode: 200,
      json: {
        id: Number(caseId),
        jurisdiction: 'IA',
        state: getNextState(body),
        version: 10,
        case_type_id: 'Asylum',
        created_date: '2019-11-13T10:18:43.271',
        last_modified: '2019-11-15T11:28:36.109',
        security_classification: 'PUBLIC',
        case_data: { ...body.data },
        data_classification: {
          journeyType: 'PUBLIC',
          homeOfficeReferenceNumber: 'PUBLIC'
        },
        after_submit_callback_response: {
          confirmation_header: '# Appeal saved\nYou still need to submit it',
          confirmation_body:
            '#### Ready to submit?\n\n[Submit your appeal](/case/IA/Asylum/1573640323267110/trigger/submitAppeal) when you are ready.\n\n#### Not ready to submit yet?\nYou can return to the case to make changes.'
        },
        callback_response_status_code: 200,
        callback_response_status: 'CALLBACK_COMPLETED',
        delete_draft_response_status_code: null,
        delete_draft_response_status: null,
        security_classifications: {
          journeyType: 'PUBLIC',
          homeOfficeReferenceNumber: 'PUBLIC'
        }
      }
    };
  });
}
