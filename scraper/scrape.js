var page = require('webpage').create();

page.onLoadFinished = function(status) {
    console.log("Status: " + status);
    if (status === "success") {
        page.evaluate(function() {
            $('html')
                .on('pdf:docloaded', function(event) {
                    window.callPhantom({ action: 'finished' });
                })
                .on('pdf:pageloaded', function(event, pageIndex) {
                    window.callPhantom({
                        action: 'page',
                        pageIndex: pageIndex,
                        html: $('#page-index-' + pageIndex).html().replace('\\','')
                    });
                })

        });
    }
}

page.onCallback = function(cb) {
    switch (cb.action) {
        case 'finished':
            phantom.exit();

        case 'page':
            console.log('page: ' + cb.pageIndex);
            break;

        default:
            console.log('page.onCallback: unknown action received');
            phantom.exit();
    }
};

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    if (typeof lineNum === 'undefined') {
        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    } else {
        console.log('CONSOLE: ' + msg);
    }
};

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];

    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};

page.onResourceError = function(resourceError) {
    console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
    console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
};

page.onResourceTimeout = function(request) {
    console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
};

page.open('http://localhost:8080/pdf/tracemonkey.pdf');
