import axios, { AxiosInstance } from 'axios';

class AddressInfoResponse {
  public addresses: Address[];
  private readonly httpStatus: number;

  constructor(httpStatus: number, addresses: Address[] = []) {
    this.addresses = addresses || [];
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
  constructor(public readonly type: string, public readonly coordinates: number[]) {}
}

export class Address {
  constructor(
    public readonly uprn: string,
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
    public readonly udprn: string | undefined
  ) {}
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
  ) {}

  public hasNextPage(): boolean {
    return (this.offset + this.maxResults) / this.maxResults < this.totalResults / this.maxResults;
  }

  public getNextOffset(): number {
    return this.offset + this.maxResults;
  }
}

export class OSPlacesClient {
  private http: AxiosInstance;

  constructor(
    private readonly apiToken: string,
    private readonly apiUrl: string = 'https://api.os.uk',
    private readonly apiPath: string = '/search/places/v1/postcode'
  ) {
    // Wrap axios to always return the raw response (never throw for non-2xx)
    this.http = axios.create({
      validateStatus: () => true // allow 4xx/5xx without throwing
    });
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

  private async getResponse(uri: string, addressInfoResponse: AddressInfoResponse): Promise<AddressInfoResponse> {
    const response = await this.http.get(uri, { responseType: 'text' });

    const statusCode = response.status;
    const bodyText = response.data;

    if (statusCode >= 500) {
      throw new Error('Error with OS Places service');
    } else if (statusCode === 404) {
      return new AddressInfoResponse(404, []);
    } else if (statusCode === 401) {
      throw new Error('Authentication failed');
    }

    const placesQueryBody = JSON.parse(bodyText);

    const header = new Header(
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
      addressInfoResponse = new AddressInfoResponse(statusCode, []);
    }

    if (placesQueryBody.results) {
      addressInfoResponse.addAll(
        placesQueryBody.results.map((jsonAddress: any) => {
          if (!jsonAddress.DPA) {
            return new Address(
              jsonAddress.LPI.UPRN,
              jsonAddress.LPI.ORGANISATION,
              jsonAddress.LPI.DEPARTMENT_NAME,
              jsonAddress.LPI.PO_BOX_NUMBER,
              jsonAddress.LPI.PAO_TEXT,
              jsonAddress.LPI.SAO_TEXT,
              jsonAddress.LPI.BUILDING_NUMBER,
              jsonAddress.LPI.STREET_DESCRIPTION,
              jsonAddress.LPI.DEPENDENT_THOROUGHFARE_NAME,
              jsonAddress.LPI.DEPENDENT_LOCALITY,
              jsonAddress.LPI.DOUBLE_DEPENDENT_LOCALITY,
              jsonAddress.LPI.TOWN_NAME,
              jsonAddress.LPI.POSTCODE_LOCATOR,
              jsonAddress.LPI.POSTAL_ADDRESS_CODE,
              jsonAddress.LPI.ADDRESS,
              new Point('Point', [jsonAddress.LPI.X_COORDINATE, jsonAddress.LPI.Y_COORDINATE]),
              jsonAddress.LPI.USRN
            );
          } else {
            return new Address(
              jsonAddress.DPA.UPRN,
              jsonAddress.DPA.ORGANISATION_NAME,
              jsonAddress.DPA.DEPARTMENT_NAME,
              jsonAddress.DPA.PO_BOX_NUMBER,
              jsonAddress.DPA.BUILDING_NAME,
              jsonAddress.DPA.SUB_BUILDING_NAME,
              jsonAddress.DPA.BUILDING_NUMBER,
              jsonAddress.DPA.THOROUGHFARE_NAME,
              jsonAddress.DPA.DEPENDENT_THOROUGHFARE_NAME,
              jsonAddress.DPA.DEPENDENT_LOCALITY,
              jsonAddress.DPA.DOUBLE_DEPENDENT_LOCALITY,
              jsonAddress.DPA.POST_TOWN,
              jsonAddress.DPA.POSTCODE,
              jsonAddress.DPA.POSTAL_ADDRESS_CODE,
              jsonAddress.DPA.ADDRESS,
              new Point('Point', [jsonAddress.DPA.X_COORDINATE, jsonAddress.DPA.Y_COORDINATE]),
              jsonAddress.DPA.UDPRN
            );
          }
        })
      );
    }

    // Recursive pagination check
    if (header.hasNextPage()) {
      const nextOffset = header.getNextOffset();
      const nextUri = this.getUri(addressInfoResponse.addresses[0].postcode, nextOffset);
      return this.getResponse(nextUri, addressInfoResponse);
    }

    return addressInfoResponse;
  }
}
