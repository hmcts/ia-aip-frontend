function appealHasRemissionOption(application: AppealApplication) {
  return [
    'asylumSupportFromHo',
    'feeWaiverFromHo',
    'under18GetSupportFromLocalAuthority',
    'parentGetSupportFromLocalAuthority'
  ].includes(application.remissionOption) ||
    ('noneOfTheseStatements' === application.remissionOption || 'iWantToGetHelpWithFees' === application.remissionOption) &&
    ('wantToApply' === application.helpWithFeesOption || 'alreadyApplied' === application.helpWithFeesOption)
    && application.helpWithFeesRefNumber;
}

function appealHasNoRemissionOption(application: AppealApplication) {
  return 'noneOfTheseStatements' === application.remissionOption && 'willPayForAppeal' === application.helpWithFeesOption;
}

export {
  appealHasRemissionOption,
  appealHasNoRemissionOption
};
