function getNationalitiesOptions(countriesList: any[], nationality: string) {
  const options = countriesList.map((country) => {
    const selected = nationality === country.value;
    return {
      text: country.name,
      value: country.value,
      selected
    };
  });
  options.unshift({
    text: 'Please select a nationality',
    value: '',
    selected: false
  });
  return options;
}

export {
  getNationalitiesOptions
};
