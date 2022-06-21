import express from 'express';
import fs from 'graceful-fs';
import http from 'http';
import https from 'https';
import { createApp } from '../../app/app';
import Logger, { getLogLabel } from '../../app/utils/logger';

const dyson = require('dyson');
const path = require('path');

const app: express.Application = createApp();
const port: number | string = process.env.PORT || 3000;
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
let server: https.Server;
let ccdServer: http.Server;
let idamServer: http.Server;
let postcodeLookupServer: http.Server;
let documentManagementStoreServer: http.Server;

function listenWithPromise(server) {
  // tslint:disable-next-line:no-console
  console.info('listenWithPromise');
  return new Promise(function (resolve, reject) {
    resolve(server.listen(port, () => {
      logger.trace(`Server  listening on port ${port}`, logLabel);
    }));
    reject(server.on('error',
        (error: Error) => {
          logger.exception(`Unable to start server because of ${error.message}`, logLabel);
        }
    ));
  });
}

async function bootstrap() {
  // tslint:disable-next-line:no-console
  console.info('bootstrap');
  server = https.createServer({
    key: fs.readFileSync('keys/server.key'),
    cert: fs.readFileSync('keys/server.cert')
  }, app);

  await listenWithPromise(server);

  const ccdApp = express();
  const idamApp = express();
  const postcodeLookupApp = express();
  const documentManagementStoreApp = express();

  const ccdOptions = {
    configDir: path.resolve(__dirname, '../mock/ccd/services/')
  };

  const idamOptions = {
    configDir: path.resolve(__dirname, '../mock/idam/services/')
  };

  const postcodeLookupOptions = {
    configDir: path.resolve(__dirname, '../mock/postcode-lookup/services/')
  };

  const documentManagementStoreOptions = {
    configDir: path.resolve(__dirname, '../mock/document-management-store/services/')
  };

  const ccdConfigs = dyson.getConfigurations(ccdOptions);
  dyson.registerServices(ccdApp, ccdOptions, ccdConfigs);
  ccdServer = ccdApp.listen(20000);

  const idamConfigs = dyson.getConfigurations(idamOptions);
  dyson.registerServices(idamApp, idamOptions, idamConfigs);
  idamServer = idamApp.listen(20001);

  const postcodeLookupConfigs = dyson.getConfigurations(postcodeLookupOptions);
  dyson.registerServices(postcodeLookupApp, postcodeLookupOptions, postcodeLookupConfigs);
  postcodeLookupServer = postcodeLookupApp.listen(20002);

  const documentManagementStoreConfigs = dyson.getConfigurations(documentManagementStoreOptions);
  dyson.registerServices(documentManagementStoreApp, documentManagementStoreOptions, documentManagementStoreConfigs);
  documentManagementStoreServer = documentManagementStoreApp.listen(20003);
}

function closeServerWithPromise(server) {
  return new Promise(function (resolve, reject) {
    server.close((err, result) => {
      if (err) return reject(err);
      logger.trace('closed server', logLabel);
      resolve(result);
    });
  });
}

async function teardown() {
  // tslint:disable-next-line:no-console
  console.info('teardown');
  try {
    if (server && server.close) {
      await closeServerWithPromise(server);
    }
    if (ccdServer && ccdServer.close) {
      await closeServerWithPromise(ccdServer);
    }
    if (idamServer && idamServer.close) {
      await closeServerWithPromise(idamServer);
    }
    if (postcodeLookupServer && postcodeLookupServer.close) {
      await closeServerWithPromise(postcodeLookupServer);
    }

    if (documentManagementStoreServer && documentManagementStoreServer.close) {
      await closeServerWithPromise(documentManagementStoreServer);
    }
  } catch (e) {
    logger.exception(e, logLabel);
  } finally {
    process.exit();
  }
}
module.exports = require('./bootstap.ts');

module.exports = {
  bootstrap: async (): Promise<void> => {
    // tslint:disable-next-line:no-console
    console.info('bootstrap');
    await bootstrap();
  },
  teardown: async (): Promise<void> => {
    await teardown();
  }
};
