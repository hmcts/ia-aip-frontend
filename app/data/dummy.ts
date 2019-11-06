export function createDummyAppealApplication(): Appeal {
  return {
    application: {
      homeOfficeRefNumber: 'A1234567',
      dateLetterSent: {
        day: 1,
        month: 7,
        year: 2019
      },
      appealType: 'Protection',
      isAppealLate: false,
      personalDetails: {
        givenNames: 'Pedro',
        familyName: 'Jimenez',
        dob: {
          day: 10,
          month: 10,
          year: 1980
        },
        nationality: 'Panamanian'
      },
      contactDetails: {
        preference: {
          email: true,
          textMessage: false
        },
        email: 'pedro.jimenez@example.net',
        phone: '07123456789',
        address: {
          line1: '60 Beautiful Street',
          line2: 'Flat 2',
          city: 'London',
          postCode: 'W1W 7RT',
          country: 'United Kingdom'
        }
      }
    },
    caseBuilding: {
      data: {}
    },
    hearingRequirements: {
      data: {}
    }
  };
}
