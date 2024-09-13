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
    case 'nthTyneMags':
      return 'NEEDS_UPDATING'
    case 'harmondsworth':
      return 'NEEDS_UPDATING'
    case 'mccCrownSquare':
      return 'NEEDS_UPDATING'
    case 'bradfordKeighley':
      return 'NEEDS_UPDATING'
    case 'manchesterMags':
      return 'NEEDS_UPDATING'
    case 'mccMinshull':
      return 'NEEDS_UPDATING'
    case 'yarlsWood':
      return 'NEEDS_UPDATING'
    case 'leedsMags':
      return 'NEEDS_UPDATING'
    case 'hendon':
      return 'NEEDS_UPDATING'
    case 'alloaSherrif':
      return 'NEEDS_UPDATING'
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
    case 'glasgowTribunalsCentre':
    case 'belfast':
      return config.get('hearingCentres.glasgowEmail');
    case 'nthTyneMags':
      return config.get('hearingCentres.nthTyneMagsEmail')
    case 'harmondsworth':
      return config.get('hearingCentres.harmondsworthEmail')
    case 'mccCrownSquare':
      return config.get('hearingCentres.mccCrownSquareEmail')
    case 'bradfordKeighley':
      return config.get('hearingCentres.bradfordKeighleyEmail')
    case 'manchesterMags':
      return config.get('hearingCentres.manchesterMagsEmail')
    case 'mccMinshull':
      return config.get('hearingCentres.mccMinshullEmail')
    case 'yarlsWood':
      return config.get('hearingCentres.yarlsWoodEmail')
    case 'leedsMags':
      return config.get('hearingCentres.leedsMagsEmail')
    case 'hendon':
      return config.get('hearingCentres.hendonEmail')
    case 'alloaSherrif':
      return config.get('hearingCentres.alloaSherrifEmail')

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
