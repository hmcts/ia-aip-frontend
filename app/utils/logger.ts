import * as applicationInsights from 'applicationinsights';
import chalk from 'chalk';

enum SEVERITY {
  REQUEST = 0,
  TRACE = 1,
  EXCEPTION = 3
}

interface ILogger {
  setIkey: (ikey: string) => void;
  exception: (message: string, label: string) => void;
  request: (message: string, label: string) => void;
  trace: (message: string, label: string) => void;
}

export default class Logger implements ILogger {
  private client: applicationInsights.TelemetryClient = null;

  constructor(iKeyVal: string = null) {
    if (iKeyVal) {
      applicationInsights.setup(iKeyVal).start();
      this.client = applicationInsights.defaultClient;
    }
  }

  setIkey(iKeyVal) {
    applicationInsights.setup(iKeyVal).start();
    this.client = applicationInsights.defaultClient;
  }

  request(message: string, label: string) {
    if (this.client) {
      this.client.trackTrace({ message });
    }
    this.console(message, label, SEVERITY.REQUEST);
  }

  trace(message: string, label: string) {
    if (this.client) this.client.trackTrace({ message });
    this.console(message, label, SEVERITY.TRACE);
  }

  traceWorker(message: string, label: string) {
    const workerThreads = require('node:worker_threads');
    if (this.client) this.client.trackTrace({ message: message });
    this.console(message, label, SEVERITY.TRACE, workerThreads.threadId);
  }

  exception(message: string, label: string) {
    if (this.client) this.client.trackException({ exception: new Error(message) });
    this.console(message, label, SEVERITY.EXCEPTION);
  }

  console(message: string, label: string, severity?: number, workerId: number = null) {
    const log: string = `[${label}]: ${message}`;
    const worker: string = workerId === null ? '' : `[0${workerId}] `;
    switch (severity) {
      case SEVERITY.REQUEST.valueOf():
        // eslint-disable-next-line no-console
        console.log(chalk.white(`${worker}Request: ${log}`));
        break;
      case SEVERITY.TRACE.valueOf():
        console.warn(chalk.green(`${worker}Info: ${log} `));
        break;
      case SEVERITY.EXCEPTION.valueOf():
        console.error(chalk.red(`${worker}Exception: ${log}`));
        break;
      default:
        break;
    }
  }
}
export function getLogLabel(path: string) {
  const paths = path.split('\\').pop().split('/');
  return paths[paths.length - 2] + '/' + paths[paths.length - 1 ];
}
