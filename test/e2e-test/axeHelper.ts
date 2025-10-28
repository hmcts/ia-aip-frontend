import AxePuppeteer from '@axe-core/puppeteer';
import { expect } from 'chai';
import fs from 'fs';
import * as path from 'path';
import Logger, { getLogLabel } from '../../app/utils/logger';

const container = require('codeceptjs').container;

const accessibilityIssuesPath = path.resolve(__dirname, './accessibility-issues.json');
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

type MultiArray<T> = [T, T, ...T[]];

type ReadableAxeResult = {
  issue: string;
  impact: string | null | undefined;
  failureSummary: string | undefined;
  targetHtmlObject: (string | MultiArray<string>)[];
  fullHtml: string;
  pageUrl: string;
};

export async function axeTest() {
  const page = container.helpers('Puppeteer').page;
  const accessibilityScanResults = await new AxePuppeteer(page)
    .withTags([
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa',
      'wcag22a',
      'wcag22aa'
    ]).analyze();
  if (accessibilityScanResults.violations.length > 0) {
    accessibilityScanResults.violations.forEach((violationType) => {
      let instances: ReadableAxeResult[] = violationType.nodes.map(
        (violationInstance) => {
          return {
            issue: violationType.help,
            impact: violationType.impact,
            failureSummary: violationInstance.failureSummary,
            targetHtmlObject: violationInstance.target,
            fullHtml: violationInstance.html,
            pageUrl: accessibilityScanResults.url
          };
        }
      );
      addViolations(instances);
    });
  }
}

export async function compileAxeTests() {
  const violations = readAccessibilityIssues().violations;
  if (violations.length > 0) {
    violations.forEach((violation: ReadableAxeResult) => {
      let log = `Issue: ${violation.issue}\nImpact: ${violation.impact}\nFailure Summary: `
        + `${violation.failureSummary}\nTarget HTML Object: ${violation.targetHtmlObject}\nFull HTML: `
        + `${violation.fullHtml}\nPage URL: ${violation.pageUrl}\n\n`;
      logger.trace(log, logLabel);
    });
  }
}

export async function assertNoAxeViolations() {
  const violations = readAccessibilityIssues().violations;
  expect(violations.length, `There are ${violations.length} accessibility issues.`).to.equal(0);
}

// Function to read the accessibility issues
function readAccessibilityIssues() {
  const data = fs.readFileSync(accessibilityIssuesPath, 'utf8');
  return JSON.parse(data);
}

// Function to write the new issues file
function writeIssues(updatedIssues: object) {
  fs.writeFileSync(accessibilityIssuesPath, JSON.stringify(updatedIssues, null, 2), 'utf8');
}

// Function to add new violations
function addViolations(violations: ReadableAxeResult[]) {
  const issues = readAccessibilityIssues();
  issues.violations.push(...violations);
  writeIssues(issues);
}
