import { Address } from '../../../app/clients/classes/Address';
import { OSPlacesResult } from '../../../app/clients/interfaces/OSPlacesResult';
import { OSPlacesClient } from '../../../app/clients/OSPlacesClient';
import { expect, sinon } from '../../utils/testUtils';

const apiToken = 'test-token';
const apiUrl = 'https://api.os.uk';
const apiPath = '/search/places/v1/postcode';

describe('OSPlacesClient', () => {
  let client: OSPlacesClient;
  let sandbox: sinon.SinonSandbox;
  let axiosGetStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    client = new OSPlacesClient(apiToken, apiUrl, apiPath);
    axiosGetStub = sandbox.stub(client['http'], 'get');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const postcode = 'AB12CD';
  const baseUri = `${apiUrl}${apiPath}?offset=0&key=${apiToken}&postcode=${postcode}`;

  const header = {
    uri: 'uri',
    query: 'query',
    offset: 0,
    totalresults: 1,
    format: 'json',
    dataset: 'dataset',
    lr: 1,
    maxresults: 100,
    epoch: 'epoch',
    output_srs: 'srs'
  };

  const dpaResult: OSPlacesResult = {
    DPA: {
      BUILDING_NAME: 'buildingName',
      SUB_BUILDING_NAME: 'subBuildingName',
      BUILDING_NUMBER: 'buildingNumber',
      THOROUGHFARE_NAME: 'thoroughfareName',
      DEPENDENT_THOROUGHFARE_NAME: 'dependentThoroughfareName',
      DEPENDENT_LOCALITY: 'dependentLocality',
      DOUBLE_DEPENDENT_LOCALITY: 'doubleDependentLocality',
      POST_TOWN: 'postTown',
      POSTCODE: postcode,
      ADDRESS: 'formattedAddress',
      UDPRN: 'udprn'
    }
  };

  const lpiResult: OSPlacesResult = {
    LPI: {
      PAO_TEXT: 'paoText',
      SAO_TEXT: 'saoText',
      BUILDING_NUMBER: 'buildingNumber2',
      STREET_DESCRIPTION: 'streetDescription',
      DEPENDENT_THOROUGHFARE_NAME: 'dependentThoroughfareName2',
      DEPENDENT_LOCALITY: 'dependentLocality2',
      DOUBLE_DEPENDENT_LOCALITY: 'doubleDependentLocality2',
      TOWN_NAME: 'townName',
      POSTCODE_LOCATOR: postcode,
      ADDRESS: 'formattedAddress2',
      USRN: 'usrn'
    }
  };

  function makeBody(headerOverrides = {}, results: OSPlacesResult[] = [dpaResult]) {
    return JSON.stringify({
      header: { ...header, ...headerOverrides },
      results
    });
  }

  it('throws if postcode is missing', async () => {
    expect(client.lookupByPostcode('')).to.be.rejectedWith('Missing required postcode');
  });

  it('throws on 500 error', async () => {
    axiosGetStub.resolves({ status: 500, data: 'Internal error' });
    expect(client.lookupByPostcode(postcode)).to.be.rejectedWith('Error with OS Places service');
    expect(axiosGetStub.calledOnceWith(baseUri, { responseType: 'text' })).to.equal(true);
  });

  it('returns 404 response', async () => {
    axiosGetStub.resolves({ status: 404, data: 'Not found' });
    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(404);
    expect(res.addresses).to.deep.equal([]);
  });

  it('throws on 401 error', async () => {
    axiosGetStub.resolves({ status: 401, data: 'Unauthorized' });
    expect(client.lookupByPostcode(postcode)).to.be.rejectedWith('Authentication failed');
  });

  it('parses DPA result', async () => {
    axiosGetStub.resolves({ status: 200, data: makeBody() });
    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(200);
    expect(res.addresses).to.have.lengthOf(1);
    expect(res.addresses[0]).to.be.instanceOf(Address);
    expect(res.addresses[0].buildingName).to.equal('buildingName');
    expect(res.addresses[0].subBuildingName).to.equal('subBuildingName');
    expect(res.addresses[0].buildingNumber).to.equal('buildingNumber');
    expect(res.addresses[0].thoroughfareName).to.equal('thoroughfareName');
    expect(res.addresses[0].dependentThoroughfareName).to.equal('dependentThoroughfareName');
    expect(res.addresses[0].dependentLocality).to.equal('dependentLocality');
    expect(res.addresses[0].doubleDependentLocality).to.equal('doubleDependentLocality');
    expect(res.addresses[0].postTown).to.equal('postTown');
    expect(res.addresses[0].postcode).to.equal(postcode);
    expect(res.addresses[0].formattedAddress).to.equal('formattedAddress');
    expect(res.addresses[0].udprn).to.equal('udprn');
  });

  it('parses LPI result', async () => {
    axiosGetStub.resolves({ status: 200, data: makeBody({}, [lpiResult]) });
    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(200);
    expect(res.addresses[0].buildingName).to.equal('paoText');
    expect(res.addresses[0].subBuildingName).to.equal('saoText');
    expect(res.addresses[0].buildingNumber).to.equal('buildingNumber2');
    expect(res.addresses[0].thoroughfareName).to.equal('streetDescription');
    expect(res.addresses[0].dependentThoroughfareName).to.equal('dependentThoroughfareName2');
    expect(res.addresses[0].dependentLocality).to.equal('dependentLocality2');
    expect(res.addresses[0].doubleDependentLocality).to.equal('doubleDependentLocality2');
    expect(res.addresses[0].postTown).to.equal('townName');
    expect(res.addresses[0].postcode).to.equal(postcode);
    expect(res.addresses[0].formattedAddress).to.equal('formattedAddress2');
    expect(res.addresses[0].udprn).to.equal('usrn');
  });

  it('handles empty results', async () => {
    axiosGetStub.resolves({ status: 200, data: makeBody({}, []) });
    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(200);
    expect(res.addresses).to.deep.equal([]);
  });

  it('handles pagination', async () => {
    const pagedHeader = { ...header, totalresults: 200, maxresults: 100, offset: 0 };
    const nextHeader = { ...header, totalresults: 200, maxresults: 100, offset: 100 };
    axiosGetStub.onFirstCall().resolves({ status: 200, data: makeBody(pagedHeader, [dpaResult]) });
    axiosGetStub.onSecondCall().resolves({ status: 200, data: makeBody(nextHeader, [lpiResult]) });

    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(200);
    expect(res.addresses).to.have.lengthOf(2);
    expect(res.addresses[0].udprn).to.equal('udprn');
    expect(res.addresses[1].udprn).to.equal('usrn');
  });

  it('mapResultToAddress handles missing fields', () => {
    const address = (client as any).mapResultToAddress({});
    expect(address).to.be.instanceOf(Address);
  });
});
