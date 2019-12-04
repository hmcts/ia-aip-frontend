const rp = require('request-promise');

const { I } = inject();

const idamApiUrl = require('config').get('idam.apiUrl');

async function createUser() {
    const randomNumber = parseInt(Math.random() * 10000000 + '', 10);
    const email = `ia_citizen${randomNumber}@hmcts.net`;
    const password = 'Apassword123';
    const options = {
        url: `${idamApiUrl}/testing-support/accounts`,
        json: true,
        body: {
            email: email,
            forename: 'ATestForename',
            password: password,
            surname: 'ATestSurname',
            roles: [
                {
                    code: 'citizen'
                }
            ]
        },
        insecure: true,
        timeout: 10000
    };
    try {
        await rp.post(options);
        console.log(`Created idam user for ${email} with password ${password}`);
        return { email: email, password };
    } catch (error) {
        logger.error('Error createUser', error.message);
    }
}

module.exports = {
    async signIn() {
        const userDetails = await createUser();
        await I.fillField('#username', userDetails.email);
        await I.fillField('#password',userDetails.password);
        await I.click('.button');
    },

    fillInDate(day, month, year) {
        I.fillField('#day',  day)
        I.fillField('#month',  month)
        I.fillField('#year', year)
    },

    enterRefNumber(refNumber) {
        I.fillField('#homeOfficeRefNumber', refNumber)
        I.click('.govuk-button')
    }
}
