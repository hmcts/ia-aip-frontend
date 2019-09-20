const path = require('path');
import * as express from 'express';
import * as nunjucks from 'nunjucks';

const { PORT = 3000 } = process.env;
const isDev: Function = () => process.env.NODE_ENV === 'development';

const app = express();

nunjucks.configure([
  'views',
  path.resolve('node_modules/govuk-frontend/')
], {
  autoescape: true,
  express: app,
  noCache:  true
});

app.use(express.static('build', { maxAge: 31557600000 }));

app.get('/', (req: express.Request, res: express.Response) => {
  res.render('index.html', { data: 'Hello from the other side' });
});

app.listen(PORT, () => {
  // tslint:disable-next-line no-console
  console.log('server started at http://localhost:' + PORT);
});
