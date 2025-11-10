const { Logger } = require('@hmcts/nodejs-logging');

class IdamLogger {
  constructor(args) {
    this.idamArgs = args;
    this.logger = Logger.getLogger(__filename);
  }

  error(message) {
    if (this.idamArgs.logger) {
      this.idamArgs.logger.exception(message, __filename);
    } else {
      this.logger.error(message);
    }
  }

  info(message) {
    if (this.idamArgs.logger) {
      this.idamArgs.logger.request(message, __filename);
    } else {
      this.logger.info(message);
    }
  }
}

module.exports = IdamLogger;
