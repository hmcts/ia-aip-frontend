// Add this at the top of test/functional/bootstrap.ts
import express from 'express';
import fs from 'graceful-fs';
import https from 'https';
import { getLocal, Mockttp } from 'mockttp';
import * as process from 'process';
import { createApp } from '../../app/app';
import Logger, { getLogLabel } from '../../app/utils/logger';
import * as testStateHelper from '../e2e-test/testStateHelper';
import ccdHandlers from '../mock/ccd/handlers';
import dmHandlers from '../mock/document-management-store/handlers';
import idamHandlers from '../mock/idam/handlers';
import { setupPcqHealth } from '../mock/pcq/handlers/health';
import { setupPostcodeLookup } from '../mock/postcode-lookup/handlers/postcodeLookup';
import { setupLease } from '../mock/s2s/handlers/lease';

// Your main app
const port: number | string = process.env.PORT || 3000;
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

let mainServer: https.Server;
const mockServers: { server: any; port: number }[] = [];

async function startMockServer(port: number, setupFns: ((ms: any) => Promise<void>)[]) {
  const mockServer: Mockttp = getLocal({ debug: false });
  await mockServer.start(port);
  const setupFnsArray: Promise<void>[] = setupFns.map(fn => fn(mockServer));
  await Promise.all(setupFnsArray);

  mockServers.push({ server: mockServer, port });
  logger.trace(`Mockttp server listening on port ${port}`, logLabel);
  return mockServer;
}

export async function bootstrap() {
  testStateHelper.resetTestState();

  // Start service mock servers
  await startMockServer(20000, ccdHandlers);
  await startMockServer(20001, idamHandlers);
  await startMockServer(20002, [ setupPostcodeLookup ]);
  await startMockServer(20003, dmHandlers);
  await startMockServer(20004, [ setupLease ]);
  await startMockServer(20005, [ setupPcqHealth ]);
  logger.trace(`servers set up`, logLabel);

  // Start main app
  const app: express.Application = createApp();
  mainServer = https.createServer({
    key: fs.readFileSync('keys/server.key'),
    cert: fs.readFileSync('keys/server.cert')
  }, app).listen(port, () => {
    logger.trace(`Main server listening`, logLabel);
  });
}

export async function teardownAll() {
  try {
    if (mainServer) {
      await new Promise<void>(resolve =>
        mainServer.close(() => resolve()));
    }

    for (const { server, port } of mockServers) {
      await server.stop();  // mockttp supports stop()
      logger.trace(`Stopped mock server on port ${port}`, logLabel);
    }
  } catch (e) {
    logger.exception(e, logLabel);
  } finally {
    failureCheck();
  }
}

export function failureCheck() {
  const testState = testStateHelper.readTestState();
  // tslint:disable:no-console
  console.log('---------------------');
  const uniqueTitles = Array.from(new Set(testState.testsRun));
  console.log('Total scenarios run: ' + uniqueTitles.length);
  console.log('Scenarios passed: ' + testState.testsPassed.length);
  console.log('---------------------');
  if (testState.testsPassed.length === uniqueTitles.length) {
    process.exit(0);
  } else {
    const failedTests = uniqueTitles.filter(title => !testState.testsPassed.includes(title));
    console.log('Scenarios failed: ', failedTests);
    process.exit(1);
  }
}
