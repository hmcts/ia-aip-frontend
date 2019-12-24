export const pa11yConfig = {
  includeWarnings: false,
  ignore: ['notice', 'WCAG2AA.Principle1.Guideline1_3.1_3_1.F92,ARIA4'],
  chromeLaunchConfig: { ignoreHTTPSErrors: true },
  hideElements: 'link[rel=mask-icon], .govuk-header__logotype-crown, .govuk-footer__licence-logo, .govuk-skip-link, .govuk-footer__link',
  page: undefined,
  browser: undefined
};
