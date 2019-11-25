import { Address } from '@hmcts/os-places-client';

function thoroughfareDetails(osAddress: Address) {
  let line1 = '';
  if (osAddress.buildingNumber) {
    line1 += osAddress.buildingNumber + ' ';
  }
  line1 += [osAddress.dependentThoroughfareName, osAddress.thoroughfareName].filter(Boolean).join(', ');

  return line1;
}

function getLine1(osAddress: Address): string {
  if (osAddress.buildingName && osAddress.subBuildingName) {
    return `${osAddress.subBuildingName} ${osAddress.buildingName}`;
  } else {
    return [ osAddress.subBuildingName, osAddress.buildingName, thoroughfareDetails(osAddress) ].filter(Boolean).join(', ');
  }
}

function getLine2(osAddress: Address): string {
  if (osAddress.buildingName && osAddress.subBuildingName) {
    return [ thoroughfareDetails(osAddress), osAddress.doubleDependentLocality, osAddress.dependentLocality ].filter(Boolean).join(', ');
  }
  return [ osAddress.doubleDependentLocality, osAddress.dependentLocality ].filter(Boolean).join(', ');
}

function getAddress(osAddress: Address) {
  return {
    line1: getLine1(osAddress),
    line2: getLine2(osAddress),
    city: osAddress.postTown,
    postcode: osAddress.postcode,
    county: ''
  };
}

export {
  getLine1,
  getLine2,
  getAddress
};
