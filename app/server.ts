import express from 'express';
import { createApp } from './app';
import Logger from './utils/logger';

const app: express.Application = createApp();
const port: number | string = process.env.PORT || 3000;
const logger: Logger = new Logger();
const logLabel: string = 'server.ts';

app.listen(port, () => {
  logger.trace(`Server  listening on port ${port}`, logLabel);
})
.on('error',
  (error: Error) => {
    logger.exception(`Unable to start server because of ${error.message}`, logLabel);
  }
);
