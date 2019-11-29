import { Address, Point } from '@hmcts/os-places-client';
import { getAddress, getLine1, getLine2 } from '../../../app/utils/address-utils';
import { expect } from '../../utils/testUtils';

describe('address-utils', () => {
  describe('address line 1', () => {
    it('build details with sub building name', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', 'buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const line1 = getLine1(address);

      expect(line1).to.eql('subBuildingName buildingName');
    });

    it('sub building name no building name', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', undefined, 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const line1 = getLine1(address);

      expect(line1).to.eql('subBuildingName, 2 dependentThoroughfareName, thoroughfareName');
    });

    it('building name no sub building name', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', 'buildingName', undefined, 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const line1 = getLine1(address);

      expect(line1).to.eql('buildingName, 2 dependentThoroughfareName, thoroughfareName');
    });

    it('no build details without dependant thoroughfare name', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', undefined, undefined, 2, 'thoroughfareName', undefined, 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const line1 = getLine1(address);

      expect(line1).to.eql('2 thoroughfareName');
    });

    it('no build details with dependant thoroghfare name', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', undefined, undefined, 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const line1 = getLine1(address);

      expect(line1).to.eql('2 dependentThoroughfareName, thoroughfareName');
    });
  });

  describe('address line 2', () => {
    it('no building details no locality details', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', undefined, undefined, 2, 'thoroughfareName', 'dependentThoroughfareName', undefined, undefined, 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const line2 = getLine2(address);

      expect(line2).to.eql('');
    });

    it('no building details', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', undefined, undefined, 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const line2 = getLine2(address);

      expect(line2).to.eql('doubleDependentLocality, dependentLocality');
    });

    it('no building details no double dependant locality', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', undefined, undefined, 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', undefined, 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const line2 = getLine2(address);

      expect(line2).to.eql('dependentLocality');
    });

    it('building details', () => {
      const address = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', 'buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');

      const line2 = getLine2(address);

      expect(line2).to.eql('2 dependentThoroughfareName, thoroughfareName, doubleDependentLocality, dependentLocality');
    });
  });

  describe('getAddress', () => {
    it('gets full address', () => {
      const osAddress = new Address('1', 'organisationName', 'departmentName', 'poBoxNumber', 'buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn');
      const address = getAddress(osAddress, 'selectedPostcode');

      expect(address).to.deep.eq({
        line1: 'subBuildingName buildingName',
        line2: '2 dependentThoroughfareName, thoroughfareName, doubleDependentLocality, dependentLocality',
        city: 'postTown',
        postcode: 'postcode',
        county: ''
      });
    });

    it('gets empty address', () => {
      const osAddress = null;
      const address = getAddress(osAddress, 'selectedPostcode');

      expect(address).to.deep.eq({
        line1: '',
        line2: '',
        city: '',
        postcode: 'selectedPostcode',
        county: ''
      });
    });

    it('gets empty address with empty postcode', () => {
      const osAddress = null;
      const address = getAddress(osAddress, undefined);

      expect(address).to.deep.eq({
        line1: '',
        line2: '',
        city: '',
        postcode: '',
        county: ''
      });
    });
  });
});
