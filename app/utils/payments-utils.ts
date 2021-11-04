export function getFee(appeal: Appeal) {
  const { decisionHearingFeeOption } = appeal.application;
  const { feeWithHearing = null, feeWithoutHearing = null } = appeal;
  const fee = decisionHearingFeeOption === 'decisionWithHearing' ? feeWithHearing : feeWithoutHearing;
  if (fee) {
    return {
      calculated_amount: fee,
      code: appeal.feeCode,
      version: appeal.feeVersion
    };
  }
  return null;
}
