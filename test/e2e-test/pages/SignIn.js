const { I } = inject();

module.exports = {
    signIn() {
        I.fillField('#username',"lewis.williams@hmcts.net");
        I.fillField('#password',"Apassword123");
        I.click('.button');
    },

    fillInDate(day, month, year) {
        I.fillField('#day',  day)
        I.fillField('#month',  month)
        I.fillField('#year', year)
    }
}
