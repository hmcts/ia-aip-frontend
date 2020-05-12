interface StartEventResponse {
  event_id: string;
  token: string;
}

interface CcdEvent {
  id: string;
  summary: string;
  description: string;
}

interface CcdState {
  id: string;
  name: string;
}

interface SubmitEventData {
  event: CcdEvent;
  data: Partial<CaseData>;
  event_token: string;
  ignore_warning: boolean;
}
