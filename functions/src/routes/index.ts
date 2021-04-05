import * as express from 'express';
const router = express.Router();
import getFAQ from './get-faq';

router.get('/ping', function (req, res, next) {
  res.send('pong');
});

getFAQ(router);

export default router;
