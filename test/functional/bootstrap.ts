import * as process from 'process';
import { deleteUsers, setTestingSupportToken } from './user-service';

export async function bootstrap() {
  global.testsPassed = 0;
  global.testsTitles = [];
  global.testFailed = false;
  await setTestingSupportToken();
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
