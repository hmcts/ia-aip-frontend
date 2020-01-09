# ia-aip-frontend



## Purpose



### Prerequisites

To run the project you will need to have the following installed:

* Node.js
* Yarn

For information about the software versions used to build this application and a complete list of it's dependencies see package.json

### Running the application

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
| yarn test| Runs `yarn test:unit && cross-env USE_REDIS=false yarn codecept:functional` functional tests start service against mocks and do not use Redis. |
| yarn test:coverage | |
| yarn test:a11y | Starts service and runs against mocks. Just hits each page and checks it is accessible. |
| yarn sonar-scan | |
| yarn test:smoke | Hits the health endpoint of the deployed service. |
| yarn test:functional| End to end test that runs against a deployed service. |
