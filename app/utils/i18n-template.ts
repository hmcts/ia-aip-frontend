// this is used for substituting witness name in strings using in nunjuck files
// do NOT mark the variable being passed into nunjucks as safe (e.g. pageQuestion | safe) because
// it still needs nunjucks autoescaping at output
function substituteWitnessNameIfExists(template: string, witnessName: string | null): string {
    return template.replace('{witnessName}', witnessName ?? '');
}


export {
    substituteWitnessNameIfExists
};