import { Address, OSPlacesClient, OSPlacesResult } from '../../../app/service/OSPlacesClient';
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

  const dpaResult = {
    DPA: {
      UPRN: 'uprn',
      ORGANISATION_NAME: 'org',
      DEPARTMENT_NAME: 'dept',
      PO_BOX_NUMBER: 'po',
      BUILDING_NAME: 'bname',
      SUB_BUILDING_NAME: 'sbname',
      BUILDING_NUMBER: 1,
      THOROUGHFARE_NAME: 'thoroughfare',
      DEPENDENT_THOROUGHFARE_NAME: 'depThoroughfare',
      DEPENDENT_LOCALITY: 'depLocality',
      DOUBLE_DEPENDENT_LOCALITY: 'doubleDepLocality',
      POST_TOWN: 'town',
      POSTCODE: postcode,
      POSTAL_ADDRESS_CODE: 'type',
      ADDRESS: 'formatted',
      X_COORDINATE: 1,
      Y_COORDINATE: 2,
      UDPRN: 'udprn'
    }
  };

  const lpiResult: OSPlacesResult = {
    LPI: {
      UPRN: 'uprn2',
      ORGANISATION: 'org2',
      DEPARTMENT_NAME: 'dept2',
      PO_BOX_NUMBER: 'po2',
      PAO_TEXT: 'bname2',
      SAO_TEXT: 'sbname2',
      BUILDING_NUMBER: 2,
      STREET_DESCRIPTION: 'thoroughfare2',
      DEPENDENT_THOROUGHFARE_NAME: 'depThoroughfare2',
      DEPENDENT_LOCALITY: 'depLocality2',
      DOUBLE_DEPENDENT_LOCALITY: 'doubleDepLocality2',
      TOWN_NAME: 'town2',
      POSTCODE_LOCATOR: 'PC2',
      POSTAL_ADDRESS_CODE: 'type2',
      ADDRESS: 'formatted2',
      X_COORDINATE: 3,
      Y_COORDINATE: 4,
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
    expect(axiosGetStub.calledOnceWith(baseUri, { responseType: 'text' })).to.be.true;
  });

  it('returns 404 response', async () => {
    axiosGetStub.resolves({ status: 404, data: 'Not found' });
    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(404);
    expect(res.addresses).to.eql([]);
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
    expect(res.addresses[0].uprn).to.equal('uprn');
    expect(res.addresses[0].organisationName).to.equal('org');
    expect(res.addresses[0].postcode).to.equal(postcode);
  });

  it('parses LPI result', async () => {
    axiosGetStub.resolves({ status: 200, data: makeBody({}, [lpiResult]) });
    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(200);
    expect(res.addresses[0].uprn).to.equal('uprn2');
    expect(res.addresses[0].organisationName).to.equal('org2');
    expect(res.addresses[0].postcode).to.equal('PC2');
  });

  it('handles empty results', async () => {
    axiosGetStub.resolves({ status: 200, data: makeBody({}, []) });
    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(200);
    expect(res.addresses).to.eql([]);
  });

  it('handles pagination', async () => {
    const pagedHeader = { ...header, totalresults: 200, maxresults: 100, offset: 0 };
    const nextHeader = { ...header, totalresults: 200, maxresults: 100, offset: 100 };
    axiosGetStub.onFirstCall().resolves({ status: 200, data: makeBody(pagedHeader, [dpaResult]) });
    axiosGetStub.onSecondCall().resolves({ status: 200, data: makeBody(nextHeader, [lpiResult]) });

    const res = await client.lookupByPostcode(postcode);
    expect(res.statusCode).to.equal(200);
    expect(res.addresses).to.have.lengthOf(2);
    expect(res.addresses[0].uprn).to.equal('uprn');
    expect(res.addresses[1].uprn).to.equal('uprn2');
  });

  it('mapResultToAddress handles missing fields', () => {
    // @ts-ignore
    const address = (client as any).mapResultToAddress({});
    expect(address).to.be.instanceOf(Address);
  });
});
