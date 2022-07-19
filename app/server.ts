import express from 'express';
import fs from 'graceful-fs';
import http from 'http';
import { createApp } from './app';
import { setupSecrets } from './setupSecrets';
import Logger, { getLogLabel } from './utils/logger';

const config = setupSecrets();

const app: express.Application = createApp();
const port: number | string = process.env.PORT || 3000;
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  http.createServer({}, app).listen(port, () => {
    logger.trace(`Server  listening on port ${port}`, logLabel);
  })
  .on('error',
    (error: Error) => {
      logger.exception(`Unable to start server because of ${error.message}`, logLabel);
    }
  );
} else {
  app.listen(port, () => {
    logger.trace(`Server  listening on port ${port}`, logLabel);
  })
  .on('error',
    (error: Error) => {
      logger.exception(`Unable to start server because of ${error.message}`, logLabel);
    }
  );
}
