const fs = require('fs-jetpack');
const path = require('path');

const Nightmare = require('nightmare');
const JSZip = require('jszip');
const program = require('commander');

let nightmare = Nightmare({
    show: false,
    openDevTools: false,
    waitTimeout: 5 * 60 * 1000
});
let source = fs.path(fs.cwd(), 'page.html');

function p2h(pdf) {
    console.log('processing: ' + pdf);
    nightmare
        .on('console', (type, msg) => console.log(type + '> ' + msg))
        .goto('file://' + source + '?pdf=' + encodeURIComponent('file://' + pdf))
        .wait('#done')
        .evaluate(() => {
            let pages = [];
            let npages = $('.page').length;
            for (let pi = 0; pi < npages; ++pi)
                pages.push($('#page-index-' + pi).html());
            return pages;
        })
        .end()
        .then(pages => {
            console.log('generating ' + pdf + '.zip');
            let zip = JSZip();
            let template = fs.read('page-template.html');
            for (let pi = 0; pi < pages.length; ++pi) {
                zip.file((pi+1) + '.html', template.replace('{{page}}', pages[pi]));
                console.log('page: ' + (pi + 1));
            }
            zip .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(pdf + '.zip'))
                .on('finish', function () {
                    console.log(pdf + ".zip written");
                });
        })
        .catch(error => console.error(error));
}

program
    .version('0.0.1')
    .arguments('<source>')
    .action(source => {
        source = path.resolve(path.normalize(source));
        p2h(source);
    });

program.parse(process.argv);
