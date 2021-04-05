import { promises as fs } from 'fs';
import path = require('path');
import config from '../config';
const { srcPath, docID } = config;
import { Router } from 'express';
const docSavePath = '/files/';
import parseHTML from '../utils/parseHTML';
import {
  downloadFile,
  //   listFiles,
  getFileModified,
} from '../googleService/googleDrive';

const localFilesTimes = async () => {
  const list = await fs.readdir(srcPath + docSavePath);
  return (
    list
      .map((name) => (name.startsWith('1') ? parseInt(name.split('.html')[0]) : 0))
      // filter out local .dstore file
      .filter((name) => name !== 0)
  );
};
const deleteExtraFiles = async (localFilesList: number[], newFaqPath: string) => {
  // only keep most recent 3
  try {
    try {
      fs.stat(newFaqPath + '.html')
        .then(() => fs.unlink(newFaqPath + '.html'))
        .catch((err) => console.log({ err }));
    } catch (error) {}
    if (localFilesList.length > 2) {
      const path = srcPath + docSavePath + Math.min(...localFilesList) + '.json';
      fs.stat(path)
        .then(() => fs.unlink(path))
        .catch((err) => console.log({ err }));
      // recursive if needed
      deleteExtraFiles(await localFilesTimes(), newFaqPath);
    }
  } catch (error) {
    console.log({ error });
  }
};
/** check if saved file version is most recent. if so serve that, if not download and serve new one */
const getFAQ = async (router: Router) => {
  router.get('/get-faq', async function (req, res, next) {
    // list local files
    try {
      //   const googleAccountFiles = await listFiles();
      //   console.log({ googleAccountFiles });
      let localFiles = await localFilesTimes();
      console.log({ localFiles });
      const modified = await getFileModified(docID);
      // console.log({ modified });
      if (!modified) return console.log({ error: 'could not get modified' });
      const modifiedTime = new Date(modified).getTime();
      // console.log({ modifiedTime });
      let mostRecentLocal = Math.max(...localFiles);
      // console.log({ mostRecentLocal });
      const wasModified = modifiedTime > mostRecentLocal;
      console.log({ wasModified });

      const download = async () => {
        const now = new Date().getTime();
        const newFaqPath = srcPath + docSavePath + now;
        await downloadFile(docID, newFaqPath + '.html');
        const faqRaw = await fs.readFile(newFaqPath + '.html', 'utf-8');
        const formatted = parseHTML(faqRaw);
        await fs.writeFile(path.join(newFaqPath + '.json'), JSON.stringify(formatted));
        // delete html
        localFiles = await localFilesTimes();
        mostRecentLocal = Math.max(...localFiles);
        deleteExtraFiles(localFiles, newFaqPath);
      };
      if (wasModified) {
        await download();
      }
      let faq;
      try {
        faq = await fs.readFile(srcPath + docSavePath + mostRecentLocal + '.json', 'utf-8');
      } catch (error) {
        await download();
      }
      try {
        faq = await fs.readFile(srcPath + docSavePath + mostRecentLocal + '.json', 'utf-8');
      } catch (error) {
        console.log({ error });
      }
      res.json({ faq });
    } catch (error) {
      console.log({ error });
    }
  });
};

export default getFAQ;
