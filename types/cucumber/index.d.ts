function Given(pattern: RegExp | string, code: StepDefinitionCode): void;
function Given(pattern: RegExp | string, options: StepDefinitionOptions, code: StepDefinitionCode): void;
function Then(pattern: RegExp | string, options: StepDefinitionOptions, code: StepDefinitionCode): void;
function Then(pattern: RegExp | string, code: StepDefinitionCode): void;
function When(pattern: RegExp | string, options: StepDefinitionOptions, code: StepDefinitionCode): void;
function When(pattern: RegExp | string, code: StepDefinitionCode): void;