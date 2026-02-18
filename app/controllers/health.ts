import { Request, Response } from 'express';

function health(req: Request, res: Response) {
  res.json({ status: 'UP' });
}

function liveness(req: Request, res: Response) {
  res.json({});
}

export {
  health,
  liveness
};
