import { Mockttp } from 'mockttp';

function getCurrentState(eventType: string): string {
  switch (eventType) {
    case 'editAppeal':
    case 'submitAppeal':
      return 'appealStarted';
    case 'editReasonsForAppeal':
    case 'submitReasonsForAppeal':
    case 'editTimeExtension':
    case 'submitTimeExtension':
    case 'makeAnApplication':
      return 'awaitingReasonsForAppeal';
    case 'editClarifyingQuestionAnswers':
      return 'awaitingClarifyingQuestionsAnswers';
    case 'editCmaRequirements':
      return 'awaitingCmaRequirements';
    case 'submitClarifyingQuestionAnswers':
      return 'clarifyingQuestionsAnswersSubmitted';
    case 'submitCmaRequirements':
      return 'cmaRequirementsSubmitted';
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
      throw new Error(`Event type ${eventType} no current state set`);
  }
}

export async function setupOtherEventStartEvent(server: Mockttp) {
  await server.forGet()
    .always()
    .withUrlMatching(/^.*\/citizens\/([^\/]+)\/jurisdictions\/([^\/]+)\/case-types\/([^\/]+)\/cases\/([^\/]+)\/event-triggers\/([^\/]+)\/token(?:\?.*)?$/)
    .thenCallback(async (request) => {
      const match = request.path.match(
        /\/citizens\/([^\/]+)\/jurisdictions\/([^\/]+)\/case-types\/([^\/]+)\/cases\/([^\/]+)\/event-triggers\/([^\/]+)\/token/
      );
      const caseId = match ? match[4] : '1';
      const eventType = match ? match[5] : 'editAppeal';
      // tslint:disable-next-line:no-console
      console.log('hitting setupOtherEventStartEvent');
      return {
        statusCode: 200,
        json: {
          token: `${eventType}Token`,
          case_details: {
            id: parseInt(caseId, 10),
            jurisdiction: 'IA',
            state: getCurrentState(eventType),
            version: 9,
            case_type_id: 'Asylum',
            created_date: '2019-11-13T10:18:43.271',
            last_modified: '2019-11-15T11:26:57.699',
            security_classification: 'PUBLIC',
            case_data: {
              journeyType: 'aip',
              homeOfficeReferenceNumber: 'A1234564'
            },
            data_classification: {
              journeyType: 'PUBLIC',
              homeOfficeReferenceNumber: 'PUBLIC'
            },
            after_submit_callback_response: null,
            callback_response_status_code: null,
            callback_response_status: null,
            delete_draft_response_status_code: null,
            delete_draft_response_status: null,
            security_classifications: {
              journeyType: 'PUBLIC',
              homeOfficeReferenceNumber: 'PUBLIC'
            }
          },
          event_id: eventType
        }
      };
    });
}
