import { Request } from 'express';
import moment from 'moment';
import { dayMonthYearFormat, timeFormat } from './date-utils';

function getHearingDate(req: Request): string {
  let formattedDeadline;

  const dueDate = req.session.appeal.hearing.date;
  formattedDeadline = moment(dueDate).format(dayMonthYearFormat);
  return formattedDeadline;
}

function getHearingTime(req: Request): string {
  let hearingTime;

  const dueDate = req.session.appeal.hearing.date;
  hearingTime = moment(dueDate).format(timeFormat);
  return hearingTime;
}

function getHearingCentre(req: Request): string {
  const HearingCentre = req.session.appeal.hearing.hearingCentre;
  switch (HearingCentre) {
    case 'taylorHouse':
      return 'Taylor House';
    case 'manchester':
      return 'Manchester';
    case 'newport':
      return 'Newport';
    case 'bradford':
      return 'Bradford';
    case 'northShields':
      return 'North Shields';
    case 'birmingham':
      return 'Birmingham';
    case 'hattonCross':
      return 'Hatton Cross';
    case 'glasgow':
      return 'Glasgow';
    default:
      return '';
  }
}

export {
  getHearingDate,
  getHearingTime,
  getHearingCentre
};
