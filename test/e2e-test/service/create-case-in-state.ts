import { createCaseInState, State } from './case-progression-service';
import { createCase } from './ccd-service';
import { createUser, setTestingSupportToken, UserInfo } from './user-service';

const timestamp: string = Date.now().toString();
const testUser: UserInfo = {
  email: `citizen-${timestamp}@example.com`,
  password: 'Apassword123',
  forename: 'some',
  surname: 'user'
};

const state: string = process.env.TEST_STATE;
if (!state) {
  throw new Error('TEST_STATE environment variable is not set');
}

if (!Object.values(State).includes(state as State)) {
  throw new Error(`Invalid state: ${state}. It must be one of ${Object.values(State).join(', ')}`);
}

const validState: State = state as State;
const appealType: string = process.env.TEST_APPEAL_TYPE || 'protection';
const decisionType: string = process.env.TEST_DECISION_TYPE || 'granted';

async function main() {
  try {
    await setTestingSupportToken();
    await createUser(testUser);
    await createCase(testUser);
    await createCaseInState(testUser, validState, appealType, decisionType);

    // eslint-disable-next-line no-console
    console.log(`Case created in state: ${validState}`);
    // eslint-disable-next-line no-console
    console.log(`CaseID: ${testUser.caseId}`);
    // eslint-disable-next-line no-console
    console.log(`User credentials: \nEmail: ${testUser.email}\nPassword: ${testUser.password}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Ensure the main function is awaited
main().catch((error) => console.error('Unhandled error:', error));
