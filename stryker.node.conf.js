require('dotenv-extended').load({ path: 'api/.env.defaults' });
module.exports = {
    // fileLogLevel: 'trace',
    // logLevel: 'trace',
    disableTypeChecks: "app/**/*.{js,ts,jsx,tsx,html,vue}",
    mutate: ["app/**/*.ts"],
    reporters: ["clear-text", "progress", "html"],
    tsconfigFile: 'tsconfig.json',
    mochaOptions: {
        spec: [ "dist/out-tsc/api/{,!(test)/**/}*.spec.js" ],
        // timeout: 5000
    },
    commandRunner: { "command": "npm run test:unit" },
    htmlReporter: {
        baseDir: 'reports/tests/mutation/node/'
    },
    concurrency: 20,
    cleanTempDir: true
}