const fs = require('fs-jetpack');
const Nightmare = require('nightmare');

let nightmare = Nightmare({
    show: true,
    openDevTools: true,
    waitTimeout: 100000
});
let source = fs.path(fs.cwd(), 'page.html');

nightmare
    .goto('file://' + source)
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
        for (let pi = 0; pi < pages.length; ++pi)
            console.log('pi: ' + pi + ' ' + pages[pi].substr(0, 70));
    })
    .catch(error => console.error(error));