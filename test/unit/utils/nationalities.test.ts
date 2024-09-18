import { getNationalitiesOptions } from '../../../app/utils/nationalities';
import { expect } from '../../utils/testUtils';

describe('Nationalities', () => {
  const list = [
    { value: 'AF', name: 'Afghanistan' },
    { value: 'AX', name: 'Aland Islands' }
  ];
  it('should getNationalitiesOptions', () => {
    const options = [
      {
        text: 'Please select a nationality',
        value: '',
        selected: false
      }, {
        text: 'Afghanistan',
        value: 'AF',
        selected: false
      }, {
        text: 'Aland Islands',
        value: 'AX',
        selected: false
      }
    ];
    const countriesList = getNationalitiesOptions(list, '', 'Please select a nationality');
    expect(countriesList).to.be.deep.eq(options);
  });

  it('should getNationalitiesOptions with a selected option', () => {
    const options = [
      {
        text: 'Please select a nationality',
        value: '',
        selected: false
      }, {
        text: 'Afghanistan',
        value: 'AF',
        selected: false
      }, {
        text: 'Aland Islands',
        value: 'AX',
        selected: true
      }
    ];
    const countriesList = getNationalitiesOptions(list, 'AX', 'Please select a nationality');
    expect(countriesList).to.be.deep.eq(options);
  });
});
