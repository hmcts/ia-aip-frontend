import moment from 'moment';

function getDeadline(currentAppealStatus: string, history) {
  switch (currentAppealStatus) {
    case 'appealStarted': {
      return null;
    }
    case 'awaitingRespondentEvidence':
    case 'appealSubmitted': {
      const daysToDeadline = 14;
      const triggeringDate = history['appealSubmitted'].date;
      const formattedDeadline = moment(triggeringDate).add(daysToDeadline, 'days').format('DD MMMM YYYY');
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
