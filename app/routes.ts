import * as express from 'express';
import { setupIndexController } from './controllers/index';

const router = express.Router();

const indexController = setupIndexController();

router.use(indexController);

export { router };
