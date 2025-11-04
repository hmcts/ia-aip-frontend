import fs from 'fs';
import * as path from 'path';

const testStatePath = path.resolve(__dirname, './TestState.json');

// Function to read the current state
export function readTestState() {
  const data = fs.readFileSync(testStatePath, 'utf8');
  return JSON.parse(data);
}

// Function to write the updated state
function writeTestState(updatedState: object) {
  fs.writeFileSync(testStatePath, JSON.stringify(updatedState, null, 2), 'utf8');
}

// Function to reset the current test suite state
export function resetTestState() {
  const state = readTestState();
  state.testsRun = [];
  state.testsPassed = [];
  writeTestState(state);
}

// Function to increment testsPassed
export function addTestPassed(title: string) {
  const state = readTestState();
  state.testsPassed.push(title);
  writeTestState(state);
}

// Function to add a title to testsRun
export function addTestRun(title: string) {
  const state = readTestState();
  state.testsRun.push(title);
  writeTestState(state);
}
