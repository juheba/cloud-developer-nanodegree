import cors from 'cors';
import express from 'express';
import {sequelize} from './sequelize';

import {IndexRouter} from './controllers/v0/index.router';

import bodyParser from 'body-parser';
import {config} from './config/config';
import {V0_FEED_MODELS} from './controllers/v0/model.index';


(async () => {
  await sequelize.addModels(V0_FEED_MODELS);

  console.debug("Initialize database connection...");
  await sequelize.sync();

  const app = express();
  const port = process.env.PORT || 8080;

  app.use(function(req, res, next) {
    const logObj = {
      time: new Date().toUTCString(),
      requestId: req.headers['x-request-id'],
      fromIP: req.headers['x-forwarded-for'],
      method: req.method,
      originalUrl: req.originalUrl,
      url: req.url,
      requestData: req.body || '',
      referer: req.headers.referer || ''
    };
    console.log(JSON.stringify(logObj));
    next();
  });

  app.use(bodyParser.json());

  // We set the CORS origin to * so that we don't need to
  // worry about the complexities of CORS this lesson. It's
  // something that will be covered in the next course.
  app.use(cors({
    allowedHeaders: [
      'Origin', 'X-Requested-With',
      'Content-Type', 'Accept',
      'X-Access-Token', 'Authorization',
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    origin: '*',
  }));

  app.use(function (req,res,next) {
    next();
    let oldSend = res.send;
    res.send = function(data) {
      const logObj = {
        time: new Date().toUTCString(),
        requestId: req.headers['x-request-id'],
        fromIP: req.headers['x-forwarded-for'],
        method: req.method,
        originalUrl: req.originalUrl,
        statusCode: res.statusCode,
        responseData: data || '',
        referer: req.headers.referer || ''
      };
      console.log(JSON.stringify(logObj));
      res.send = oldSend;
      return res.send(data);
    }
   });

  app.use('/api/v0/', IndexRouter);


  // Root URI call
  app.get( '/', async ( req, res ) => {
    res.send( '/api/v0/' );
  } );

  // Health check
  app.get( '/health', async ( req, res ) => {
    res.status(200).send("feed is fine");
  } );


  // Start the Server
  app.listen( port, () => {
    console.log( `server running ${config.url}` );
    console.log( `press CTRL+C to stop server` );
  } );
})();
