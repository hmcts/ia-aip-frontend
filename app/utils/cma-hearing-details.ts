import config from 'config';
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
    case 'nottingham':
      return 'Nottingham Justice Centre';
    case 'newport':
      return 'Newport';
    case 'newcastle':
      return 'Newcastle Civil & Family Courts and Tribunals Centre';
    case 'bradford':
      return 'Bradford';
    case 'northShields':
      return 'North Shields';
    case 'birmingham':
      return 'Birmingham';
    case 'hattonCross':
      return 'Hatton Cross';
    case 'glasgow':
    case 'glasgowTribunalsCentre':
      return 'Glasgow';
    case 'belfast':
      return 'Belfast';
    case 'coventry':
      return 'Coventry Magistrates Court';
    case 'remoteHearing':
      return 'The hearing will take place by video call';
    default:
      return '';
  }
}

function getHearingCentreEmail(req: Request): string {
  const hearingCentre = (req.session.appeal.hearing.hearingCentre !== '') ? req.session.appeal.hearing.hearingCentre : req.session.appeal.hearingCentre;
  switch (hearingCentre) {
    case 'taylorHouse':
      return config.get('hearingCentres.taylorHouseEmail');
    case 'manchester':
      return config.get('hearingCentres.manchesterEmail');
    case 'newport':
      return config.get('hearingCentres.newportEmail');
    case 'bradford':
      return config.get('hearingCentres.bradfordEmail');
    case 'northShields':
      return config.get('hearingCentres.northShieldsEmail');
    case 'birmingham':
      return config.get('hearingCentres.birminghamEmail');
    case 'hattonCross':
      return config.get('hearingCentres.hattonCrossEmail');
    case 'glasgow':
      return config.get('hearingCentres.glasgowEmail');
    default:
      return '';
  }
}
export {
  getHearingDate,
  getHearingTime,
  getHearingCentre,
  getHearingCentreEmail
};
