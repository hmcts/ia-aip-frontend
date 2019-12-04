const  {checkAndSend} = require ("../pages/check-and-send/check-and-send");
const  {typeOfAppeal} = require ("../pages/type-of-appeal/type-of-appeal");
const  {fillInContactDetails} = require ("../pages/contact-details/contact-details");

const {fillInPersonalDetails} = require ( "../pages/personal-details/personal-details");
const {fillInHomeOfficeDetails} = require ( "../pages/home-office-details/ref-number-page");
const {signIn} = require("../pages/sign-in");

const { I } = inject()


signIn(I)
fillInHomeOfficeDetails(I)
fillInPersonalDetails(I)
fillInContactDetails(I)
typeOfAppeal(I)
checkAndSend(I)






