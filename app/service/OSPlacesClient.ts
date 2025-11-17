import axios, { AxiosInstance } from 'axios';

export class AddressInfoResponse {
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

export interface OSPlacesResult {
  LPI?: Record<string, any>;
  DPA?: Record<string, any>;
}

export class Point {
  constructor(public readonly type: string, public readonly coordinates: number[]) {}
}

export class Address {
  constructor(
    public readonly uprn: string,
    public readonly organisationName: string,
    public readonly departmentName: string,
    public readonly poBoxNumber: string,
    public readonly buildingName: string,
    public readonly subBuildingName: string,
    public readonly buildingNumber: number,
    public readonly thoroughfareName: string,
    public readonly dependentThoroughfareName: string,
    public readonly dependentLocality: string,
    public readonly doubleDependentLocality: string,
    public readonly postTown: string,
    public readonly postcode: string,
    public readonly postcodeType: string,
    public readonly formattedAddress: string,
    public readonly point: Point,
    public readonly udprn: string
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
        placesQueryBody.results.map((jsonAddress: OSPlacesResult) => {
          return this.mapResultToAddress(jsonAddress);
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

  private mapResultToAddress(result: OSPlacesResult): Address {
    const source = result.DPA ?? result.LPI ?? {};
    const coords = [source.X_COORDINATE, source.Y_COORDINATE];
    return new Address(
      source.UPRN,
      source.ORGANISATION_NAME ?? source.ORGANISATION,
      source.DEPARTMENT_NAME,
      source.PO_BOX_NUMBER,
      source.BUILDING_NAME ?? source.PAO_TEXT,
      source.SUB_BUILDING_NAME ?? source.SAO_TEXT,
      source.BUILDING_NUMBER,
      source.THOROUGHFARE_NAME ?? source.STREET_DESCRIPTION,
      source.DEPENDENT_THOROUGHFARE_NAME,
      source.DEPENDENT_LOCALITY,
      source.DOUBLE_DEPENDENT_LOCALITY,
      source.POST_TOWN ?? source.TOWN_NAME,
      source.POSTCODE ?? source.POSTCODE_LOCATOR,
      source.POSTAL_ADDRESS_CODE,
      source.ADDRESS,
      new Point('Point', coords),
      source.UDPRN ?? source.USRN
    );
  }
}
