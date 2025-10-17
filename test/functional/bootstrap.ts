import * as process from 'process';
import { prepareTestCases } from './case-progression-service';
import { createTestCases } from './ccd-service';
import { createUsers, deleteUsers, setTestingSupportToken } from './user-service';

export async function bootstrap() {
  global.testsPassed = 0;
  global.testsTitles = [];
  global.testFailed = false;
  await setTestingSupportToken();
  await createUsers();
  await createTestCases();
  await prepareTestCases();
}

export async function teardown() {
  await deleteUsers();
  if (global.testFailed) {
    // tslint:disable:no-console
    console.log('---------------------');
    console.log('Total scenarios run: ' + global.testsTitles.length);
    console.log('Scenarios passed: ' + global.testsPassed);
    console.log('---------------------');
    if (global.testsPassed === global.testsTitles.length) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } else {
    process.exit(0);
  }
}
