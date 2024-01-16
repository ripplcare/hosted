const XSL_PATH = 'https://ripplcare.github.io/hosted/cda/stylesheets/';
let XSLDoc = ''
let xmlStr = ''

const docContainer = document.getElementById('doc-container')

const XSLUrl = 'https://ripplcare.github.io/hosted/cda/stylesheets/style-1.xsl';
loadXSL();

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', function (e) {
  const selectedFile = fileInput.files[0];
  console.log('selected file', selectedFile)

  const freader = new FileReader();
  freader.onload = () => {
    xmlStr = freader.result;
    processDoc();
  }
  freader.readAsText(selectedFile);
})

function loadXSL(cb) {
  console.log('loading xsl')
  const req = new XMLHttpRequest();
  req.addEventListener("load", () => {
    XSLDoc = req.responseXML;
    if (cb) {
      cb();
    }
  });
  req.open("GET", XSLUrl, false);
  req.send('');
}

function processDoc() {

  if (!xmlStr) {
    return;
  }


  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
  // root is <ClinicalDocument>
  const root = xmlDoc.getElementsByTagName('ClinicalDocument')[0];

  //create a new doc with only the root
  const serializer = new XMLSerializer();
  let rootStr = serializer.serializeToString(root);
  rootStr = `<?xml version="1.0"?><?xml-stylesheet type="text/xsl" href="${XSLUrl}" ?>${rootStr}`;

  const newDoc = new DOMParser().parseFromString(rootStr, 'application/xml');

  // apply XSL transformation to the new doc
  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(XSLDoc);

  const transformedDoc = xsltProcessor.transformToDocument(newDoc);
  const final = serializer.serializeToString(transformedDoc);

  const iframe = document.createElement("iframe");
  iframe.setAttribute('style', 'width:100%;height:800px');
  iframe.srcdoc = final;

  docContainer.innerHTML = '';
  docContainer.appendChild(iframe)

}

