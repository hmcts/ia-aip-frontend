import AxePuppeteer from '@axe-core/puppeteer';
import { expect } from 'chai';
import fs from 'fs';
import * as path from 'path';
import Logger, { getLogLabel } from '../../app/utils/logger';

const container = require('codeceptjs').container;
const accessibilityIssuesPath = path.resolve(__dirname, '../../accessibility-issues.json');
const accessibilityContentsPath = path.resolve(__dirname, '../../accessibility-contents.json');
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
  const content = page.content();
  if (hasContentBeenScanned(content)) {
    logger.trace(`content already scanned for accessibility`, logLabel);
    return;
  }
  let accessibilityScanResults = null;
  const retries = 5;
  for (let i = 1; i <= retries; i++) {
    try {
      accessibilityScanResults = await new AxePuppeteer(page)
        .options({ pingWaitTime: 5000 })
        .withTags([
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22a',
          'wcag22aa'
        ]).analyze();
      break;
    } catch (error) {
      if (i === retries) {
        logger.exception(`Error during accessibility scan after ${retries} attempts: ${error}`, logLabel);
        throw error;
      }
      logger.exception(`Accessibility scan attempt ${i} failed: ${error}`, logLabel);
    }
  }
  addScannedContent(content);
  if (accessibilityScanResults && accessibilityScanResults.violations.length > 0) {
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

function generateViolationLogs(violations: ReadableAxeResult[]) {
  let logs: string[] = [];
  violations.forEach((violation: ReadableAxeResult) => {
    let log = `Issue: ${violation.issue}\nImpact: ${violation.impact}\nFailure Summary: `
      + `${violation.failureSummary}\nTarget HTML Object: ${violation.targetHtmlObject}\nFull HTML: `
      + `${violation.fullHtml}\nPage URL: ${violation.pageUrl}`;
    logs.push(log);
  });
  return `\n${logs.join('\n--------------------------------------------\n')}\n\nThere are ${violations.length} accessibility issues`;
}

export function assertNoAxeViolations() {
  const violations = readAccessibilityIssues().violations;
  expect(violations, generateViolationLogs(violations)).to.be.an('array').that.is.empty;
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
  const existingIssues: ReadableAxeResult[] = issues.violations || [];
  // Filter out violations that already exist in `issues.violations`
  const existingKeys = new Set(
    existingIssues.map((issue) =>
      JSON.stringify({
        issue: issue.issue,
        pageUrl: issue.pageUrl,
        failureSummary: issue.failureSummary,
        impact: issue.impact,
        fullHtml: issue.fullHtml,
        targetHtmlObject: issue.targetHtmlObject
      })
    )
  );

  const uniqueViolations = violations.filter((newViolation) => {
    const key = JSON.stringify({
      issue: newViolation.issue,
      pageUrl: newViolation.pageUrl,
      failureSummary: newViolation.failureSummary,
      impact: newViolation.impact,
      fullHtml: newViolation.fullHtml,
      targetHtmlObject: newViolation.targetHtmlObject
    });
    return !existingKeys.has(key);
  });

  // Add unique violations to the existing list
  issues.violations.push(...uniqueViolations);
  writeIssues(issues);
}

type AccessibilityContents = {
  scannedContents: string[];
};

function readAccessibilityContents(): AccessibilityContents {
  const data = fs.readFileSync(accessibilityContentsPath, 'utf8');
  return JSON.parse(data);
}

function writeAccessibilityContents(updatedContents: AccessibilityContents) {
  fs.writeFileSync(accessibilityContentsPath, JSON.stringify(updatedContents, null, 2), 'utf8');
}

function hasContentBeenScanned(content: string): boolean {
  const contents: AccessibilityContents = readAccessibilityContents();
  return contents.scannedContents.includes(content);
}

function addScannedContent(content: string) {
  const contents: AccessibilityContents = readAccessibilityContents();
  contents.scannedContents.push(content);
  writeAccessibilityContents(contents);
}
