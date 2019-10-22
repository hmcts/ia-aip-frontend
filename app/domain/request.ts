export interface Request {
  session: {
    appealApplication: any,
    caseBuilding: any,
    hearingRequirements: any
    typeOfAppeal: [ string ]
  };
  idam: any;
}
