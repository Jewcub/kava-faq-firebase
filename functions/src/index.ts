import * as functions from 'firebase-functions';
import express = require('express');
import cors = require('cors');
import path = require('path');
import config from './config';
const { projectPath, isDev } = config;

import indexRouter from './routes/index';
// reload
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(projectPath, '/client/build')));
const allowList = ['https://kava-faq.web.app'];
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    console.log({ origin });
    if (origin && allowList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

if (!isDev) app.use(cors(corsOptions));
else app.use(cors());

app.use(indexRouter);

app.get('/faq', (req, res) => {
  console.log('sending file', projectPath + '/client/build/');
  res.sendFile(projectPath + '/client/build/');
});

// not as clean, but a better endpoint to consume //https://codeburst.io/express-js-on-cloud-functions-for-firebase-86ed26f9144c
const api = functions.https.onRequest((request, response) => {
  if (!request.path) {
    request.url = `/${request.url}`; // prepend '/' to keep query params if any
  }
  return app(request, response);
});
export { api, app };
