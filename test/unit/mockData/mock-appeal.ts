export function createDummyAppealApplication(): Appeal {
  return {
    appealStatus: 'appealStarted',
    application: {
      homeOfficeRefNumber: 'A1234567',
      dateLetterSent: {
        day: '1',
        month: '7',
        year: '2019'
      },
      appealType: 'protection',
      isAppealLate: false,
      personalDetails: {
        givenNames: 'Pedro',
        familyName: 'Jimenez',
        dob: {
          day: '10',
          month: '10',
          year: '1980'
        },
        nationality: 'AT',
        address: {
          line1: '60 Beautiful Street',
          line2: 'Flat 2',
          city: 'London',
          postcode: 'W1W 7RT',
          county: 'London'
        }
      },
      contactDetails: {
        email: 'pedro.jimenez@example.net',
        wantsEmail: true,
        phone: '07123456789',
        wantsSms: false
      },
      addressLookup: {}
    },
    reasonsForAppeal: {
      applicationReason: null
    },
    hearingRequirements: {
      data: {}
    },
    hearing: {
      hearingCentre: 'Taylor House',
      date: '21 April 2019',
      time: '10am'
    }
  };
}
