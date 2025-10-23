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
  state.testsPassed = 0;
  state.testFailed = false;
  state.testsTitles = [];
  writeTestState(state);
}

// Function to update testFailed
export function setTestFailed(value: boolean) {
  const state = readTestState();
  state.testFailed = value;
  writeTestState(state);
}

// Function to increment testsPassed
export function incrementTestsPassed() {
  const state = readTestState();
  state.testsPassed += 1;
  writeTestState(state);
}

// Function to add a title to testsTitles
export function addTestTitle(title: string) {
  const state = readTestState();
  state.testsTitles.push(title);
  writeTestState(state);
}
