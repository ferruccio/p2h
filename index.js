const fs = require('fs-jetpack');
const Nightmare = require('nightmare');

let nightmare = Nightmare({
    show: false,
    openDevTools: false,
    waitTimeout: 10000
});
let source = fs.path(fs.cwd(), 'page.html');
let pdf = fs.path(fs.cwd(), 'tracemonkey.pdf');

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
        let template = fs.read('page-template.html');
        for (let pi = 0; pi < pages.length; ++pi) {
            let fn = '/tmp/tracemonkey-' + (pi+1) + '.html';
            fs.write(fn, template.replace('{{page}}', pages[pi]));
            console.log(fn);
        }
    })
    .catch(error => console.error(error));