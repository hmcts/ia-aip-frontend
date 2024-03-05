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

export {
  appealHasRemissionOption,
  appealHasNoRemissionOption
};
