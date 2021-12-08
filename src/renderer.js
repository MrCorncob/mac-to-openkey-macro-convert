const { dialog } = require('@electron/remote');
const path = require('path');
const moment = require('moment');
const plist = require('plist');
const fs = require('fs');
const fsPromise = fs.promises;
const jsonexport = require('jsonexport');
require('popper.js');
require('bootstrap');
let $ = require('jquery');

const csvHeaders = [
    'shortcut',
    'phrase',
];

function printLog(logViewer, str) {
    const currentLog = $(logViewer).text();
    $(logViewer).html(currentLog + '\n' + str);
}

function updateProgressBar(progressBar, percentage) {
    $(progressBar).css('width', `${percentage}%`);
}

async function processFile(sourceFile, destinationFile) {
    const logViewer = $('#logViewer');
    const progressBar = $('#progressBar');

    printLog(logViewer, 'parsing plist...');
    const jsonData = plist.parse(fs.readFileSync(sourceFile, 'utf8'));
    printLog(logViewer, 'File converted to json...');
    updateProgressBar(progressBar, 30);

    printLog(logViewer, 'processing macro...');
    const csvData = await jsonexport(jsonData, {
        rowDelimiter: ':',
        headers: csvHeaders,
        includeHeaders: false
    });
    printLog(logViewer, 'Saving to OpenKey txt file...');
    await fsPromise.writeFile(destinationFile, csvData);


    updateProgressBar(progressBar, 95);

    printLog(logViewer, 'Finished! File saved at ' + destinationFile);
    updateProgressBar(progressBar, 100);

    $('#lblTotalRows').html(jsonData.length);
}

// Add an event listener to our button.
document.getElementById('btnStartProcessing').addEventListener('click', async function () {
    console.log('btnStartProcessing clicked');

    // When the button is clicked, open the native file picker to select a PDF.
    const dialogResult = await dialog.showOpenDialog({
        properties: ['openFile'], // set to use openFileDialog
        filters: [{name: "Config File (plist)", extensions: ['plist']}] // limit the picker to just xlsx
    });

    // console.log('file selected');
    // Since we only allow one file, just use the first one
    // console.log('dialogResult', dialogResult);
    if (dialogResult.canceled) {
        console.log('File select cancelled!');
        return;
    }

    const filePath = dialogResult.filePaths[0];
    const destinationFile = filePath.substr(0, filePath.length - 5) + '-Openkey-' + moment().format('YYYY.MM.DD.HH.mm.ss') + '.txt';

    const lblSourceFile = $('#lblSourceFile');
    const lblDestinationFile = $('#lblDestinationFile');
    const lblTotalSheets = $('#lblTotalSheets');
    const lblTotalRows = $('#lblTotalRows');

    $(lblSourceFile).html(filePath);
    $(lblDestinationFile).html(destinationFile);
    $('#logViewer').html('');

    await processFile(filePath, destinationFile);
});

