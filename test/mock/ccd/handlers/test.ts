import { Mockttp } from 'mockttp';

export async function setupTestHandler(server: Mockttp) {
  await server.forGet(
    /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/event-triggers\/startAppeal\/token/
  ).thenCallback(async () => {
    return {
      status: 200,
      json: {
        token: 'startEventToken',
        case_details: {
          id: null,
          jurisdiction: 'IA',
          state: null,
          version: null,
          case_type_id: 'Asylum',
          created_date: null,
          last_modified: null,
          security_classification: null,
          case_data: {},
          data_classification: {},
          after_submit_callback_response: null,
          callback_response_status_code: null,
          callback_response_status: null,
          delete_draft_response_status_code: null,
          delete_draft_response_status: null,
          security_classifications: {}
        },
        event_id: 'startAppeal'
      }
    };
  });
}
