import { getNationalitiesOptions } from '../../../app/utils/nationalities';
import { expect } from '../../utils/testUtils';

describe('Nationalities', () => {
  const list = [
    'Afghanistan',
    'Argentina'
  ];
  it('should getNationalitiesOptions', () => {
    const options = [
      {
        text: 'Please select a nationality',
        value: '',
        selected: false
      }, {
        text: 'Afghanistan',
        value: 'Afghanistan',
        selected: false
      }, {
        text: 'Argentina',
        value: 'Argentina',
        selected: false
      }
    ];
    const countriesList = getNationalitiesOptions(list, '');
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
        value: 'Afghanistan',
        selected: false
      }, {
        text: 'Argentina',
        value: 'Argentina',
        selected: true
      }
    ];
    const countriesList = getNationalitiesOptions(list, 'Argentina');
    expect(countriesList).to.be.deep.eq(options);
  });
});
