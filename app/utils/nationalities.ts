function getNationalitiesOptions(countriesList: string[], nationality: string) {
  const options = countriesList.map((country) => {
    const selected = nationality === country;
    return {
      text: country,
      value: country,
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
