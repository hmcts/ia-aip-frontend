import { Address } from './Address';

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
