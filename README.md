# ia-aip-frontend-tmp



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

### Using the application

To understand if the application is working, you can call it's health endpoint:

```
curl http://localhost:3000/health
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
