import { Mockttp } from 'mockttp';
import moment from 'moment';
import mockData from '../mock-case-data';

const yearMonthDayFormat = 'YYYY-MM-DD';

function expiryDaysFromNow(days: number): string {
  return moment().add(days, 'days').format(yearMonthDayFormat);
}

export async function setupStartRepresentingYourself(server: Mockttp) {
  await server.forGet(
    /\/caseworkers\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases\/([^/]+)/
  ).thenCallback(async (request) => {
    const match = request.url.match(
      /\/caseworkers\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases\/([^/]+)/
    );
    const caseId = match ? match[4] : undefined;
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
  });
}
