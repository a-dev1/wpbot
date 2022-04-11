const qrcode = require('qrcode-terminal');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const {promisify} = require('util');
const creds = require('./client_secret.json'); 
const fs = require('fs');
const dir1 = './images';
const dir2 = './pdf';
const text = 'Type Your Message Here';
const data = [];

const { Client, MessageMedia } = require('whatsapp-web.js');
const client = new Client();

//SPREADSHEET
async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet('1hcvu3Lqyqmcoi0m3BATxYNMr7Q8xhv3Qitf-92rUNWI');
  await doc.useServiceAccountAuth(creds);
  const {client_email, private_key} = creds;

  await doc.loadInfo(); // loads document properties and worksheets
  console.log(doc.title);

  const sheet = doc.sheetsByIndex[3]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  console.log(sheet.title);

  const rows = await sheet.getRows();
  // await sheet.loadCells('A1:E10');
  // console.log(rows);
  rows.forEach(row => {
    data.push(row.Mobile);
  });
  console.log("Data: ", data);
}

accessSpreadsheet();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();

client.on('ready', () => {
  console.log('Client is ready!');
  // Getting chatId from the number.
  // we have to delete "+" from the beginning and add "@c.us" at the end of the number.

  // Send Files Function
  async function sendFilemsg(file_path, chatId, text){
    try {
      const media = MessageMedia.fromFilePath(file_path);
      await client.sendMessage(chatId, media, {caption: ""});
      console.log(`Sent Success: ${chatId}`);
      return 1;
    } catch (error) {
      console.log("Sending Media Message Error: ", error);
    }
  }

  async function sendTxtMessage(chatId) {
    try {
      await client.sendMessage(chatId, text);
      console.log(`txt Sent Success: ${chatId}`);
      return 1;
    } catch (e) {
      console.log("error sending txt message: ", e);
    }
  }

  //Sending All Txt Messages
  data.forEach(number => {
    let num = number + "@c.us";
    sendTxtMessage(num);
  });

  //Sending All The Images
  data.forEach((number, i) => {
    let chatId = number + "@c.us";
    // console.log("i: ", i);
    fs.readdir(dir1, (err, files) => {
      files.forEach(file => {
        sendFilemsg(`./images/${file}`, chatId, ""); 
      });
    });
  });

  //Sending All the PDF's
  data.forEach(number => {
    let chatId = number + "@c.us";
    fs.readdir(dir2, (err, files) => {
      files.forEach(file => {
        sendFilemsg(`./pdf/${file}`, chatId, ""); 
      });
    });
  });
});

