import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';

dotenv.config();

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, 
  projectId: process.env.GOOGLE_PROJECT_ID,    
});

const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME); 

export { bucket };
