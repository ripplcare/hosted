const XSL_PATH = 'https://ripplcare.github.io/hosted/cda/stylesheets/';
let XSLDoc = ''
let xmlStr = ''

const docContainer = document.getElementById('doc-container')

/* const styleSelect = document.getElementById('style-select');
let selectedStyleSheet = styleSelect.value;
styleSelect.addEventListener('change', handleStyleSelectChange) */
let selectedStyleSheet = 'style-1.xsl';
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
  const filename = `${XSL_PATH}${selectedStyleSheet}`
  const req = new XMLHttpRequest();
  req.addEventListener("load", () => {
    XSLDoc = req.responseXML;
    if (cb) {
      cb();
    }
  });
  req.open("GET", filename, false);
  req.send('');
}


function processDoc() {

  if (!xmlStr) {
    return;
  }

  console.log('processing', selectedStyleSheet)

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
  // root is <ClinicalDocument>
  const root = xmlDoc.getElementsByTagName('ClinicalDocument')[0];

  //create a new doc with only the root
  const serializer = new XMLSerializer();
  const rootStr = serializer.serializeToString(root);
  const newDoc = new DOMParser().parseFromString(rootStr, 'application/xml');
  const pi = newDoc.createProcessingInstruction("xml-stylesheet", `href="${XSL_PATH + selectedStyleSheet}"`)
  newDoc.insertBefore(pi, newDoc.firstChild);

  const newDocOpening = newDoc.createProcessingInstruction('xml', 'version="1.0"');
  newDoc.insertBefore(newDocOpening, newDoc.firstChild);

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

function handleStyleSelectChange(e) {
  selectedStyleSheet = e.target.value;
  loadXSL(processDoc);
}