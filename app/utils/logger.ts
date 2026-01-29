import { TelemetryClient } from 'applicationinsights';
import chalk from 'chalk';

enum SEVERITY {
  REQUEST = 0,
  TRACE = 1,
  EXCEPTION = 3
}

interface ILogger {
  exception: (message: string, label: string) => void;
  request: (message: string, label: string) => void;
  trace: (message: string, label: string) => void;
}

export default class Logger implements ILogger {
  private client: TelemetryClient | null = null;

  constructor(
    connectionString: string | null = null,
    client?: TelemetryClient   // 👈 add this
  ) {
    if (client) {
      this.client = client;
    } else if (connectionString) {
      this.client = new TelemetryClient(connectionString);
    }
  }

  request(message: string, label: string) {
    this.client?.trackTrace({ message, severity: SEVERITY.REQUEST.toString() });
    this.console(message, label, SEVERITY.REQUEST);
  }

  trace(message: string, label: string) {
    this.client?.trackTrace({ message, severity: SEVERITY.TRACE.toString() });
    this.console(message, label, SEVERITY.TRACE);
  }

  traceWorker(message: string, label: string) {
    const workerThreads = require('node:worker_threads');
    this.client?.trackTrace({ message, severity: SEVERITY.TRACE.toString() });
    this.console(message, label, SEVERITY.TRACE, workerThreads.threadId);
  }

  exception(message: string, label: string) {
    this.client?.trackException({ exception: new Error(message) });
    this.console(message, label, SEVERITY.EXCEPTION);
  }

  private console(message: string, label: string, severity?: number, workerId: number = null) {
    const log = `[${label}]: ${message}`;
    const worker = workerId === null ? '' : `[0${workerId}] `;

    // tslint:disable:no-console
    switch (severity) {
      case SEVERITY.REQUEST:
        console.log(chalk.white(`${worker}Request: ${log}`));
        break;
      case SEVERITY.TRACE:
        console.warn(chalk.green(`${worker}Info: ${log}`));
        break;
      case SEVERITY.EXCEPTION:
        console.error(chalk.red(`${worker}Exception: ${log}`));
        break;
    }
    // tslint:enable:no-console
  }
}

export function getLogLabel(path: string) {
  const paths = path.split('\\').pop()?.split('/') ?? [];
  return `${paths[paths.length - 2]}/${paths[paths.length - 1]}`;
}
