const nations = ['Venezuelan','Ugandan','Romanian','Mexican','Dutch','Lithuanian','Estonian','Finnish','Brazilian'];
const nationalities = [{ text: 'Please select a nationality', value: '' }];
nations.map((nation) => {
  nationalities.push({
    text: nation,
    value: nation
  });
});
export {
    nationalities
};
