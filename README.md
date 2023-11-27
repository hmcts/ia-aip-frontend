
# ia-aip-frontend


## Purpose


### Prerequisites

To run the project you will need to have the following installed:

* Node.js
* Yarn

For information about the software versions used to build this application and a complete list of it's dependencies see package.json

### Running the application

Fore Local development you will need to set the following environment variables:

```
IDAM_SECRET=OOOOOOOOOOOOOOOO
IDAM_WEB_URL=http://localhost:3501
IDAM_API_URL=http://localhost:5000
S2S_SECRET=AAAAAAAAAAAAAAAC
S2S_URL=http://localhost:4502
CCD_API_URL=http://localhost:4452
S2S_MICROSERVICE_NAME=iac
MICROSERVICE=ccd_gateway
DOC_MANAGEMENT_URL=http://dm-store:4506
CASE_DOCUMENT_AM_URL=http://localhost:4455
ADDRESS_LOOKUP_TOKEN=THE_ADDRESS_LOOKUP_TOKEN
```
Specific features, the app contains some toggleable features to enable these use the following environment variables according to your needs.

```   
USE_SESSION_LOGGER=true
TIMELINE_ENABLED=true
ASK_FOR_MORE_TIME_ENABLED=true
```
You can run the application as follows:

```
yarn install
yarn dev
```

These commands will download any required dependencies, and start a webserver listening on port `3000`

### Running with mocks

The application relies on having a running version of CCD and idam you can run mock versions of these with

```
yarn dev:mock
```

This will run the app and point it to the mocked IDAM and CCD services. It does not matter what username or password
you enter but the following users will create different results.

| Username | Behaviour |
| -------- | --------- |
| no-cases@example.com | Does not find a case to load in mock CCD so creates a new case |
| has-case@example.com | Loads a case from mock CCD. This case can be updated in a session but changes will not be persisted when a user logs out |

If the username is not recognised then no-cases@example.com behaviour will be used.

### Using the application

To understand if the application is working, you can call it's health endpoint:

```
curl https://localhost:3000/health
```

If the API is running, you should see this response:

```
{"status":"UP"}
```

### Running verification tests:

You can run the *unit* and *functional* tests as follows:

```
yarn test
```

You can run the *smoke* against a _running instance_ as follows:

```
yarn test:smoke
```

You can run the security check as follows:


```
yarn test:nsp
```

### Build pipeline

The pipeline build has the following steps

| Yarn command | Description |
| ------------ | ----------- |
| yarn cache clean | |
| yarn check | |
| yarn --mutex network install --frozen-lockfile| |
| yarn lint | |
| yarn build | |
| yarn test| Runs `yarn test:unit && cross-env USE_REDIS=false yarn codecept:functional` functional tests start service against mocks and do not use Redis. Can add environment variable FUNCTIONAL_TESTS to specify a regex to just run some of the functional tests. |
| yarn test:coverage | |
| yarn test:a11y | Starts service and runs against mocks. Just hits each page and checks it is accessible. |
| yarn sonar-scan | |
| yarn test:smoke | Hits the health endpoint of the deployed service. |
| yarn test:functional| End to end test that runs against a deployed service. |


## Adding Git Conventions

### Include the git conventions.
* Make sure your git version is at least 2.9 using the `git --version` command
* Run the following command:
```
git config --local core.hooksPath .git-config/hooks
```
Once the above is done, you will be required to follow specific conventions for your commit messages and branch names.

If you violate a convention, the git error message will report clearly the convention you should follow and provide
additional information where necessary.

*Optional:*
* Install this plugin in Chrome: https://github.com/refined-github/refined-github

  It will automatically set the title for new PRs according to the first commit message, so you won't have to change it manually.

  Note that it will also alter other behaviours in GitHub. Hopefully these will also be improvements to you.

*In case of problems*

1. Get in touch with your Technical Lead and inform them, so they can adjust the git hooks accordingly
2. Instruct IntelliJ not to use Git Hooks for that commit or use git's `--no-verify` option if you are using the command-line
3. If the rare eventuality that the above is not possible, you can disable enforcement of conventions using the following command

   `git config --local --unset core.hooksPath`

   Still, you shouldn't be doing it so make sure you get in touch with a Technical Lead soon afterwards.
