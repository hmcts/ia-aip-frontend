import { Mockttp } from 'mockttp';
import moment from 'moment';
import mockData from '../mock-case-data';

const yearMonthDayFormat = 'YYYY-MM-DD';

function expiryDaysFromNow(days: number): string {
  return moment().add(days, 'days').format(yearMonthDayFormat);
}

export async function setupCcdGetCaseById(server: Mockttp) {
  await server.forGet(
    /\/caseworkers\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases\/([^/]+)/
  ).thenCallback(async (request) => {
    const match = request.url.match(
      /\/caseworkers\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases\/([^/]+)/
    );
    const caseId = match ? match[4] : undefined;
    if (joinAppealCases.includes(caseId)) {
      return returnForJoinAppeal(caseId);
    }
    return returnForStartRepresentingYourself(caseId);
  });
}

function returnForStartRepresentingYourself(caseId: string) {
  const caseData = { ...mockData.startRepresentingYourself };
  const expiryDate =
    caseId === '1111222233334444'
      ? expiryDaysFromNow(-10)
      : expiryDaysFromNow(10);
  caseData.id = caseId;
  caseData.case_data.appellantPinInPost.expiryDate = expiryDate;
  return {
    statusCode: 200,
    json: caseData
  };
}

function returnForJoinAppeal(caseId: string) {
  const caseData = { ...mockData.appealSubmittedCaseData };
  if (caseId === '4321432143214321') {
    return {
      statusCode: 404,
      json: {}
    };
  }
  caseData.id = parseInt(caseId);
  caseData.case_data['nlrDetails'] = { emailAddress: 'appeal-submitted@example.com' };
  caseData.case_data.appellantGivenNames = 'John';
  caseData.case_data.appellantFamilyName = 'Smith';
  caseData.case_data['joinAppealPin'] = {
    pinUsed: 'No',
    expiryDate: expiryDaysFromNow(10),
    accessCode: 'valid-access-code'
  };
  caseData.case_data['appealReferenceNumber'] = 'PA/12345/2026';
  if (caseId === '1111111111111111') {
    caseData.case_data['joinAppealPin'] = null;
  } else if (caseId === '1111111122222222') {
    caseData.case_data['nlrDetails'] = { emailAddress: 'someRandom@email.com' };
  } else if (caseId === '3333333333333333') {
    caseData.case_data['joinAppealPin'].pinUsed = 'Yes';
  } else if (caseId === '4444444444444444') {
    caseData.case_data['joinAppealPin'].expiryDate = expiryDaysFromNow(-10);
  }
  return {
    statusCode: 200,
    json: caseData
  };
}

const joinAppealCases: string[] = ['4321432143214321', '1111111111111111', '1111111122222222',
  '2222222222222222', '3333333333333333', '4444444444444444', '5555555555555555'];

