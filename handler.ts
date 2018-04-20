
import { Handler, Context, Callback } from 'aws-lambda';
import { S3Opts } from './utils/s3.opts';

/**
 * listens to /stim/check_version?bucket=study-ionic-stims&currentEtag=12334&stimName=bbcs-4
 * @param event 
 * @param context 
 * @param callback 
 */
export const checkVersion: Handler = (event: any, context: Context, callback: Callback) => {
  console.log(`Inside Check Version`, JSON.stringify(event, null, 5));
  let bucketName = 'study-ionic-stims';
  const response: any = {};
  if (event.queryStringParameters) {
    bucketName = event.queryStringParameters.bucket || bucketName;
    const stimName = event.queryStringParameters.stimName;
    const previousTag = event.queryStringParameters.currentEtag;
    (async () => {
      try {
      const hasNew = await S3Opts.hasNew(bucketName, `${stimName}.tar`, previousTag);
      response.statusCode = 200;
      response.body =  JSON.stringify({hasNew: hasNew});
      } catch(e) {
        response.statusCode = 500;
        response.body =  JSON.stringify({message: "error in accessing s3 object"});
      }
      callback(null, response);
    })();
  } else {
    response.statusCode = 500;
    response.body =  JSON.stringify({message: "no query params found"});
    callback(null, response);
  }  
  
};


export const updateVersionJson: Handler = (event: any, context: Context, callback: Callback) => {
  console.log(`Inside Update version json`, JSON.stringify(event, null, 5));
  let bucketName = 'study-ionic-stims';
  if (event.queryStringParameters) {
    bucketName = event.queryStringParameters.bucket || bucketName;
  } 
  (async () => {    
    try {
      await S3Opts.createETagJson(bucketName);
      callback(null, { statusCode: 200, body: JSON.stringify({status: "ok"}) });
    } catch(e) {
      callback(null, { statusCode: 500, body: JSON.stringify({message: "error in creating etag json"}) });
    }
  })();
 
};
