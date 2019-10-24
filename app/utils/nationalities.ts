const nations = ['Venezuelan','Ugandan','Romanian','Mexican','Dutch','Lithuanian','Estonian','Finnish','Brazilian'];
const nationalities = [{ text: 'Please select a nationality', value: '' }];
nations.forEach((nation) => {
  nationalities.push({
    text: nation,
    value: nation
  });
});
export {
    nationalities
};
