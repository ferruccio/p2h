const scale = 1.5;
const quality = 0.5;

var totalPages = 0;
var pagesRendered = 0;

function renderPage(page) {
    var viewport = page.getViewport(scale);
    var $canvas = $("<canvas />");

    var canvas = $canvas.get(0);
    var context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    var $page = $('#page-index-' + page.pageIndex);
    $page.css({ height: viewport.height + "px", width: viewport.width + "px" });
    $('#page-image-' + page.pageIndex).append($canvas);

    var canvasOffset = $canvas.offset();
    var $text = $("#page-text-" + page.pageIndex);
    $text
        .addClass("textLayer")
        .css({ height: viewport.height + "px", width: viewport.width + "px" })
        .offset({ top: canvasOffset.top, left: canvasOffset.left });

    page.getTextContent().then(function (textContent) {
        PDFJS.renderTextLayer({
            textContent: textContent,
            container: $text.get(0),
            viewport: viewport,
            textDivs: [],
            enhanceTextSelection: true
        });

        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext).then(function() {
            replacePageImage(page.pageIndex);
            pagesRendered += 1;
            if (pagesRendered >= totalPages) {
                $('body').append('<div id="done" />');
            }
        });
    });
}

function replacePageImage(pageIndex) {
    var pageImage = document.getElementById('page-image-' + pageIndex);
    var canvas = pageImage.firstChild;
    var imgURL = canvas.toDataURL('image/png', quality);
    var img = document.createElement('img');
    img.setAttribute('src', imgURL);
    pageImage.replaceChild(img, canvas);
}

let src = simpleQueryString.parse(window.location.search).pdf;

PDFJS.workerSrc = 'bower_components/pdfjs-dist/build/pdf.worker.min.js';
PDFJS.getDocument(src).then(function (doc) {
    for (var pi = 0; pi < doc.numPages; ++pi) {
        $('#viewer').append($(
            "<div class='page' id='page-index-" + pi + "'>" +
                "<div id='page-text-" + pi + "' class='page-text' />" +
                "<div id='page-image-" + pi + "' class='page-image' />" +
            "</div>"
        ));
    }
    totalPages = doc.numPages;
    pagesRendered = 0;
    for (var pn = 1; pn <= doc.numPages; ++pn) {
        doc.getPage(pn).then(renderPage);
    }
});