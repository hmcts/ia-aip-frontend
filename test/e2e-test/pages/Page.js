const { I } = inject();

module.exports = {

    checkURL(url) {
        I.seeInCurrentUrl(url)
    }
  // insert your locators and methods here
}
