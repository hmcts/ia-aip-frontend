import * as requestDefault from 'request';
import * as requestPromise from 'request-promise-native';

class AddressInfoResponse {
  public addresses: Address[];

  private readonly httpStatus: number;

  constructor(httpStatus: number, addresses: Address[] = []) {
    this.addresses = !addresses ? [] : addresses;
    this.httpStatus = httpStatus;
  }

  public addAll(moreAddresses: Address[]) {
    this.addresses.push(...moreAddresses);
  }

  get statusCode() {
    return this.httpStatus;
  }
}

class Point {
  constructor(public readonly type: string,
              public readonly coordinates: number[]) {
  }
}

export class Address {
  constructor(public readonly uprn: string,
              public readonly organisationName: string | undefined,
              public readonly departmentName: string | undefined,
              public readonly poBoxNumber: string | undefined,
              public readonly buildingName: string | undefined,
              public readonly subBuildingName: string | undefined,
              public readonly buildingNumber: number | undefined,
              public readonly thoroughfareName: string | undefined,
              public readonly dependentThoroughfareName: string | undefined,
              public readonly dependentLocality: string | undefined,
              public readonly doubleDependentLocality: string | undefined,
              public readonly postTown: string,
              public readonly postcode: string,
              public readonly postcodeType: string,
              public readonly formattedAddress: string,
              public readonly point: Point,
              public readonly udprn: string | undefined) {
  }
}

class Header {
  constructor(
    public readonly uri: string,
    public readonly query: string,
    public readonly offset: number,
    public readonly totalResults: number,
    public readonly format: string,
    public readonly dataset: string,
    public readonly lr: number,
    public readonly maxResults: number,
    public readonly epoch: string,
    public readonly outputSrs: string
  ) {

  }

  public hasNextPage(): boolean {
    return (this.offset + this.maxResults) / this.maxResults < this.totalResults / this.maxResults;
  }

  public getNextOffset(): number {
    return this.offset + this.maxResults;
  }

}

export class OSPlacesClient {

  constructor(private readonly apiToken: string,
              private readonly request: requestDefault.RequestAPI<requestPromise.RequestPromise,
                requestPromise.RequestPromiseOptions,
                requestDefault.RequiredUriUrl> = requestPromise,
              private readonly apiUrl: string = 'https://api.os.uk',
              private readonly apiPath: string = '/search/places/v1/postcode') {
  }

  public lookupByPostcode(postcode: string): Promise<AddressInfoResponse> {
    if (!postcode) {
      return Promise.reject(new Error('Missing required postcode'));
    }

    const uri = this.getUri(postcode, 0);
    return this.getResponse(uri, new AddressInfoResponse(999, []));
  }

  private getUri(postcode: string, offset: number): string {
    return `${this.apiUrl}${this.apiPath}?offset=${offset}&key=${this.apiToken}&postcode=${postcode}`;
  }

  private async getResponse(uri: string, addressInfoResponse: AddressInfoResponse): Promise<any> {
    let response = await this.request.get({
      json: false,
      resolveWithFullResponse: true,
      simple: false,
      uri: `${uri}`
    });
    if (response.statusCode >= 500) {
      throw new Error('Error with OS Places service');
    } else if (response.statusCode === 404) {
      return new AddressInfoResponse(404, []);
    } else if (response.statusCode === 401) {
      throw new Error('Authentication failed');
    }
    const placesQueryBody = JSON.parse(response.body);
    const header: Header = new Header(
      placesQueryBody.header.uri,
      placesQueryBody.header.query,
      placesQueryBody.header.offset,
      placesQueryBody.header.totalresults,
      placesQueryBody.header.format,
      placesQueryBody.header.dataset,
      placesQueryBody.header.lr,
      placesQueryBody.header.maxresults,
      placesQueryBody.header.epoch,
      placesQueryBody.header.output_srs
    );
    if (addressInfoResponse.statusCode === 999) {
      addressInfoResponse = new AddressInfoResponse(response.statusCode, []);
    }
    if (placesQueryBody.results) {
      addressInfoResponse.addAll(
        placesQueryBody.results.map((jsonAddress: any) => {
          if (!jsonAddress.DPA) {
            return new Address(
              jsonAddress.LPI.UPRN,                             // 1
              jsonAddress.LPI.ORGANISATION,                     // 0..1
              jsonAddress.LPI.DEPARTMENT_NAME,                  // 0..1
              jsonAddress.LPI.PO_BOX_NUMBER,                    // 0..1
              jsonAddress.LPI.PAO_TEXT,                         // 0..1
              jsonAddress.LPI.SAO_TEXT,                         // 0..1
              jsonAddress.LPI.BUILDING_NUMBER,                  // 0..1
              jsonAddress.LPI.STREET_DESCRIPTION,               // 0..1
              jsonAddress.LPI.DEPENDENT_THOROUGHFARE_NAME,      // 0..1
              jsonAddress.LPI.DEPENDENT_LOCALITY,               // 0..1
              jsonAddress.LPI.DOUBLE_DEPENDENT_LOCALITY,        // 0..1
              jsonAddress.LPI.TOWN_NAME,                        // 1
              jsonAddress.LPI.POSTCODE_LOCATOR,                 // 1
              jsonAddress.LPI.POSTAL_ADDRESS_CODE,              // 1
              jsonAddress.LPI.ADDRESS,                          // 1
              new Point('Point', [jsonAddress.LPI.X_COORDINATE, jsonAddress.LPI.Y_COORDINATE]),
              jsonAddress.LPI.USRN
            );
          } else {
            return new Address(
              jsonAddress.DPA.UPRN,                             // 1
              jsonAddress.DPA.ORGANISATION_NAME,                // 0..1
              jsonAddress.DPA.DEPARTMENT_NAME,                  // 0..1
              jsonAddress.DPA.PO_BOX_NUMBER,                    // 0..1
              jsonAddress.DPA.BUILDING_NAME,                    // 0..1
              jsonAddress.DPA.SUB_BUILDING_NAME,                // 0..1
              jsonAddress.DPA.BUILDING_NUMBER,                  // 0..1
              jsonAddress.DPA.THOROUGHFARE_NAME,                // 0..1
              jsonAddress.DPA.DEPENDENT_THOROUGHFARE_NAME,      // 0..1
              jsonAddress.DPA.DEPENDENT_LOCALITY,               // 0..1
              jsonAddress.DPA.DOUBLE_DEPENDENT_LOCALITY,        // 0..1
              jsonAddress.DPA.POST_TOWN,                        // 1
              jsonAddress.DPA.POSTCODE,                         // 1
              jsonAddress.DPA.POSTAL_ADDRESS_CODE,              // 1
              jsonAddress.DPA.ADDRESS,                          // 1
              new Point('Point', [jsonAddress.DPA.X_COORDINATE, jsonAddress.DPA.Y_COORDINATE]),
              jsonAddress.DPA.UDPRN
            );
          }
        })
      );
    }
    if (header.hasNextPage()) {
      const next = this.getUri(addressInfoResponse.addresses[0].postcode, header.getNextOffset());
      return this.getResponse(next, addressInfoResponse);
    }
    return addressInfoResponse;
  }
}
