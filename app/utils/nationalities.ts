function getNationalitiesOptions(countriesList: any[], nationality: string, defaultText: string) {
  const options = countriesList.map((country) => {
    const selected = nationality === country.value;
    return {
      text: country.name,
      value: country.value,
      selected
    };
  });
  options.unshift({
    text: defaultText,
    value: '',
    selected: false
  });
  return options;
}

export {
  getNationalitiesOptions
};
