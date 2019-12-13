import express from 'express';
import fs from 'graceful-fs';
import https from 'https';
import { createApp } from '../../app/app';
import Logger, { getLogLabel } from '../../app/utils/logger';
const kill = require('kill-port');
const ccdDysonSetup = require('../../test/mock/ccd/dysonSetup');
const idamDysonSetup = require('../../test/mock/idam/dysonSetup');

const app: express.Application = createApp();
const port: number | string = process.env.PORT || 3000;
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
let server: https.Server;

function bootstrap() {
  ccdDysonSetup();
  idamDysonSetup();
  server = https.createServer({
    key: fs.readFileSync('keys/server.key'),
    cert: fs.readFileSync('keys/server.cert')
  }, app).listen(port, () => {
    logger.trace(`Server  listening on port ${port}`, logLabel);
  })
  .on('error',
    (error: Error) => {
      logger.exception(`Unable to start server because of ${error.message}`, logLabel);
    }
  );
}

function teardown() {
  if (server && server.close) {
    server.close();
  }
  kill(20001, 'tcp')
    .then(logger.trace('Closing IDAM mock server', logLabel))
    .catch(logger.exception('Error closing IDAM mock server', logLabel));

  kill(20000, 'tcp')
    .then(logger.trace('Closing CCD mock server', logLabel))
    .catch(logger.exception('Error closing CCD mock server', logLabel));
}

module.exports = {
  bootstrap: function(done) {
    bootstrap();
    done();
  },
  teardown: function(done) {
    teardown();
    done();
  }
};
