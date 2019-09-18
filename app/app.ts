import * as express from 'express';
import { Request, Response } from 'express';
import * as nunjucks from 'nunjucks';

const app = express();
const { PORT = 3000 } = process.env;

app.use(express.static('build', { maxAge: 31557600000 }));

app.get('/', (req: Request, res: Response) => {
    res.render('index.html', { data: 'Hello from the other side' });
});

nunjucks.configure('app/views', {
    autoescape: true,
    express: app
});

app.listen(PORT, () => {
    console.log('server started at http://localhost:' + PORT);
});
