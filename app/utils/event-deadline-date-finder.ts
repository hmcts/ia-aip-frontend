import config from 'config';
import moment from 'moment';

const daysToWaitAfterSubmission = config.get('daysToWait.afterSubmission');

function getDeadline(currentAppealStatus: string, history) {
  switch (currentAppealStatus) {
    case 'appealStarted': {
      return null;
    }
    case 'awaitingRespondentEvidence':
    case 'appealSubmitted': {
      const triggeringDate = history['appealSubmitted'].date;
      const formattedDeadline = moment(triggeringDate).add(daysToWaitAfterSubmission, 'days').format('DD MMMM YYYY');
      return formattedDeadline || null;
    }
    default: {
      return 'TBC';
    }
  }
}

export {
  getDeadline
};
