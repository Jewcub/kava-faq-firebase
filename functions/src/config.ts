import path = require('path');
const projectPath = path.resolve(__dirname, '../../');
const srcPath = path.resolve(__dirname);
import * as dotenv from 'dotenv';
dotenv.config();
const isDev = (process.env.NODE_ENV = 'development');
// complete faq '1imzQociewnWFW8dfPM_4cRDrDWdBvhYMcbQ8C6e1-7g'
// test faq '1zjKrSJikBnQWo8cKZILTEt63zh_PYjMHQlIgqLny4Rs'
const docID = '1imzQociewnWFW8dfPM_4cRDrDWdBvhYMcbQ8C6e1-7g';
const PORT = process.env.PORT || isDev ? 5001 : 80;

const redirectUris =
  process.env.NODE_ENV !== 'development' ? ['https://kava-faq.web.app'] : ['http://localhost:5001'];
// console.log("client secret", process.env.CLIENT_SECRET);
export default { projectPath, srcPath, docID, redirectUris, isDev, PORT };
