import { promises as fsPromise } from 'fs';
import fs = require('fs');
import path = require('path');
import readline = require('readline');
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import config from '../config';
const { redirectUris, srcPath } = config;
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = path.join(srcPath, '/files/token.json');

const connectDrive = async () => {
  try {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });
    return drive;
  } catch (error) {
    console.log('Error loading client secret file:', error);
    return { error };
  }
};

/**
 * Create an OAuth2 client
 */
async function authorize() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);
  // Check if we have previously stored a token. try to get from local file, if not use .env, if not, apply for new one
  let token;
  try {
    token = await fsPromise.readFile(TOKEN_PATH);
  } catch (error) {
    try {
      getTokenFromEnv();
    } catch (error) {
      token = getAccessToken(oAuth2Client);
    }
  }
  oAuth2Client.setCredentials(JSON.parse(token as any));
  return oAuth2Client;
}

async function getTokenFromEnv() {
  console.log(
    'tokenEnvs',
    process.env.ACCESS_TOKEN,
    process.env.REFRESH_TOKEN,
    process.env.SCOPE,
    process.env.EXPIRY_DATE,
  );
  if (
    process.env.ACCESS_TOKEN &&
    process.env.REFRESH_TOKEN &&
    process.env.SCOPE &&
    process.env.EXPIRY_DATE
  ) {
    //
  }
  const token = {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token:
      '1//0eIz4mek42SSMCgYIARAAGA4SNwF-L9IrjyQDo5WTd85CddMZHEbfYggan3hxE-unpsEL9fyBsW7UHaVm5heF-ijALqx_fvrXPoU',
    scope: 'https://www.googleapis.com/auth/drive',
    token_type: 'Bearer',
    expiry_date: 1617610571113,
  };
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) return console.error(err);
    console.log('Token stored to', TOKEN_PATH);
  });
  return token;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getAccessToken(oAuth2Client: OAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      if (!token) return console.error('Error retrieving access token. no token found', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      return token;
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listFiles() {
  const drive = await connectDrive();
  if (!drive || 'error' in drive) return console.error('unable to initialize drive');
  const res = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  });
  const files = res.data.files;

  if (files && files.length) {
    console.log('Files:');
    files.map((file) => {
      console.log(`${file.name} (${file.id})`);
    });
    return files;
  } else {
    console.log('No files found.');
  }
}

/** Get a file and save it to the path */
async function downloadFile(fileId: string, filePath: string) {
  const drive = await connectDrive();
  if (!drive || 'error' in drive) return console.error('unable to initialize drive');
  const res = await drive.files.export(
    { fileId: fileId, mimeType: 'text/html' },
    { responseType: 'stream' },
  );

  return new Promise((resolve, reject) => {
    //   console.log({ res });

    //   console.log(`writing to ${filePath}`, { res });
    const dest = fs.createWriteStream(filePath);
    let progress = 0;

    res.data
      .on('end', () => {
        console.log('Done downloading file.');
        resolve(filePath);
      })
      .on('error', (err) => {
        console.error('Error downloading file.');
        reject(err);
      })
      .on('data', (d) => {
        progress += d.length;
        if (process.stdout.isTTY) {
          //@ts-ignore
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(`Downloaded ${progress} bytes`);
        }
      })
      .pipe(dest);
  });
}

const getFileModified = async (fileId: string) => {
  const drive = await connectDrive();
  if (!drive || 'error' in drive) return console.error('unable to initialize drive');
  const res = await drive.files.get({ fileId, fields: 'modifiedTime' });
  // console.log({ res: res.data.modifiedTime });
  const result = res.data.modifiedTime;
  // console.log({ result });
  return result;
};

export { downloadFile, listFiles, getFileModified };
