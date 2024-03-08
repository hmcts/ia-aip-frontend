function appealHasRemissionOption(application: AppealApplication) {
  return [
    'asylumSupportFromHo',
    'feeWaiverFromHo',
    'under18GetSupportFromLocalAuthority',
    'parentGetSupportFromLocalAuthority'
  ].includes(application.remissionOption);
}

function appealHasNoRemissionOption(application: AppealApplication) {
  return 'noneOfTheseStatements' === application.remissionOption && 'willPayForAppeal' === application.helpWithFeesOption;
}

function addQueryParam(url: string, queryParam: string) {
  const encodedQueryParam = encodeURIComponent(queryParam);
  return url.concat(url.includes('?') ? `&${encodedQueryParam}` : `?${encodedQueryParam}`);
}

function readQueryParam(url: string): string | null {
  const queryString = new URL(url).searchParams.get('param');
  if (queryString) {
    return decodeURIComponent(queryString);
  }
  return null;
}

export {
  appealHasRemissionOption,
  appealHasNoRemissionOption,
  addQueryParam,
  readQueryParam
};
