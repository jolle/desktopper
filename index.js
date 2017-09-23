const packager = require('electron-packager');
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const fs = require('fs');
const ncp = require('ncp');
const Promise = require('bluebird');
const pngToIco = require('png-to-ico');
const png2icns = require('png2icns');
const path = require('path');
const del = require('del');
require('colors');

const capitalize = (str) => str.substr(0, 1).toUpperCase() + str.substr(1);

module.exports = (rootUrl) => {
    if (!fs.existsSync('temp')) fs.mkdirSync('temp');

    const icon = axios.get(rootUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.3 Mobile/14E277 Safari/603.1.30'
        }
    })
    .then(({ data }) => cheerio.load(data))
    .then(($) => $('link[rel="apple-touch-icon-precomposed"]'))
    .then((icons) => {
        if (icons.length === 0) throw Error('Unable to find icons.');
        return icons;
    })
    .then((icons) => url.resolve(rootUrl, Array.from(icons).map(a => ({ size: parseInt((a.attribs.sizes || '16x16').split('x')[0], 10), href: a.attribs.href })).sort((a, b) => b.size - a.size)[0].href));

    const downloader = icon.then(icon => axios.get(icon, { responseType: 'arraybuffer' }))
    .then(({ data }) => fs.writeFileSync('temp/icon.png', data));

    const converter = downloader.then(() => process.platform === 'darwin' ? png2icns({ in: 'temp/icon.png', out: 'temp/icon.icns' }) : Promise.promisify(pngToIco)('temp/icon.png').then((buf) => fs.writeFileSync('temp/icon.ico')));

    const boilerplater = Promise.promisify(ncp)('template/', 'temp/').then(() => fs.writeFileSync('temp/index.js', fs.readFileSync('temp/index.js').toString().replace('__TEMPLATE_URL__', rootUrl)));

    const name = capitalize(rootUrl.replace(/https?:\/\//, '').split('.')[0] || 'Application');
    let buildPath;
    return Promise.all([converter, boilerplater]).then(() => packager({
        dir: 'temp/',
        icon: 'temp/icon.' + (process.platform === 'darwin' ? 'icns' : 'ico'),
        quiet: true,
        name,
        overwrite: true,
    }))
    .then((build) => buildPath = build)
    .then(() => del(['temp'].concat(fs.existsSync(path.join(__dirname, `${name}.app`)) ? [path.join(__dirname, `${name}.app`)] : [])))
    .then(() => Promise.promisify(fs.rename)(path.join(buildPath[0], `${name}.app`), path.join(__dirname, `${name}.app`)))
    .then(() => del([buildPath[0]]))
    .then(() => path.join(__dirname, `${name}.app`));
};

if (require.main === module) {
    console.log(`${'==>'.green.bold} Starting desktopping...`);
    module.exports(process.argv[2])
    .then(() => console.log(`${'==>'.green.bold} Successfully finished desktopping!`))
    .catch((e) => {
        console.log(`${'==>'.red.bold} ${e}`);
    });
}
