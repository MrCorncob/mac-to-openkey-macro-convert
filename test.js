const plist = require('plist');
const fs = require('fs');
const fsPromise = fs.promises;
const jsonexport = require('jsonexport');


async function main() {
    const jsonData = plist.parse(fs.readFileSync('data/input.plist', 'utf8'));

    const csvData = await jsonexport(jsonData, {
        rowDelimiter: ':',
        headers: [
            'shortcut',
            'phrase'
        ],
        includeHeaders: false
    });
    await fsPromise.writeFile('data/output.txt', csvData);

    return 'Done';
}

main()
    .then(result => {
        console.log('Done')
    })
    .catch(console.error)
    .finally(e => {
        process.exit(e ? 1 : 0)
    });