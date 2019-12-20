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
function bootstrap() {
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

  const ccdApp = express();
  const idamApp = express();

  const ccdOptions = {
    configDir: path.resolve(__dirname, '../mock/ccd/services/')
  };

  const idamOptions = {
    configDir: path.resolve(__dirname, '../mock/idam/services/')
  };

  const ccdConfigs = dyson.getConfigurations(ccdOptions);
  dyson.registerServices(ccdApp, ccdOptions, ccdConfigs);
  ccdServer = ccdApp.listen(20000);

  const idamConfigs = dyson.getConfigurations(idamOptions);
  dyson.registerServices(idamApp, idamOptions, idamConfigs);
  idamServer = idamApp.listen(20001);
}

function teardown() {
  if (server && server.close) {
    server.close(() => {
      logger.trace(`Closed out remaining local server connections`, logLabel);
      process.exit(0);
    });
  }
  if (ccdServer && ccdServer.close) {
    ccdServer.close(() => {
      logger.trace(`Closed out remaining CCD connections`, logLabel);
      process.exit(0);
    });
  }

  if (idamServer && idamServer.close) {
    idamServer.close(() => {
      logger.trace(`Closed out remaining Idam connections`, logLabel);
      process.exit(0);
    });
  }
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
