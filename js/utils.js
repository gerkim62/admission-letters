// Function to extract the student ID
function extractId(str) {
  var idStart = str.indexOf("Student ID: ") + "Student ID: ".length;
  var idEnd = str.indexOf("Password: ");
  return str.substring(idStart, idEnd).trim();
}

// Function to extract the student password
function extractPassword(str) {
  var passwordStart = str.indexOf("Password: ") + "Password: ".length;
  return str.substring(passwordStart).trim();
}

// Function to extract the student name
function extractName(str) {
  var nameStart = str.indexOf("Pr/Mr/Mrs/Miss ") + "Pr/Mr/Mrs/Miss ".length;
  var nameEnd = str.indexOf(" (Admn No: ");
  return str.substring(nameStart, nameEnd).trim();
}

// Function to extract the student course
function extractCourse(str) {
  var courseRegex = /([A-Za-z\s]+)(?: subject to presentation)/;
  var courseMatch = str.match(courseRegex);
  return courseMatch ? courseMatch[1] : "";
}

// Function to extract all the student information
function extractStudentInfo(str) {
  var id = extractId(str);
  var password = extractPassword(str);
  var name = extractName(str);
  var course = extractCourse(str);
  return {id, password, name, course};
}

export async function fetchViaProxy(url, options) {
  try {
    const proxyUrl = 'https://corsproxy.io/?';
    const targetUrl = url;
    const proxiedUrl = proxyUrl + encodeURIComponent(targetUrl);

    const response = await fetch(proxiedUrl, options);
    return response;
  } catch (error) {
    console.error(error);
  }
}


async function getPDFTextFrom(url) {
  let text = '';

  // Fetch the PDF file
  const response = await fetchViaProxy(url);
  const pdfData = await response.arrayBuffer();

  // Load the PDF file
  const pdf = await pdfjsLib.getDocument(pdfData).promise;

  // Get the text content of each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const pageTextContent = await page.getTextContent();
    text += pageTextContent.items.map(item => item.str).join('');
  }
  //document.body.innerHTML = JSON.stringify(extractIdAndPassword(text))
  return text;
}

export function getJSONArrayFrom(csv) {
    const rows = csv.split('\n');
    const headers = rows.shift().split(',');
    const data = [];
    for (let row of rows) {
        const values = row.split(',');
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = values[i];
        }
        data.push(obj);
    }
    return data;
}

function downloadJSON(data, fileName) {
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

export function loadCSVFrom(url) {
  return fetch(url)
    .then(response => response.text())
    .catch(error => {
      console.log("An error occurred while fetching the CSV:", error);
    });
}

    async function getPDFText(url) {
      let text = '';

      // Fetch the PDF file
      const response = await fetchViaProxy(url);
      const pdfData = await response.arrayBuffer();

      // Load the PDF file
      const pdf = await pdfjsLib.getDocument(pdfData).promise;

      // Get the text content of each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const pageTextContent = await page.getTextContent();
        text += pageTextContent.items.map(item => item.str).join('');
      }
      document.body.innerHTML = JSON.stringify(extractIdAndPassword(text))
      return text;
    }
    
    function fetchArrayBuffer(url) {
  return caches.match(url)
    .then(response => {
      if (response) {
        return response.arrayBuffer();
      }
      
      return fetch(url)
        .then(response => {
          caches.put(url, response.clone());
          return response.arrayBuffer();
        });
    });
}

export async function saveLetters(data) {
  let zip = new JSZip();
  let promises = [];
  let fileIndex = 0;

  for (const item of data) {
    let id = item.name;

    let blob = await getLetter(item.letterLink);
    zip.file(`${id}.pdf`, blob);
   // console.log(item.name)
    updateDownloadProgress(fileIndex, data.length);
    fileIndex++;
  }

  await Promise.all(promises);
  saveZipFile(zip);
}

function getLetter(letterLink) {
  return caches.match(letterLink)
    .then(response => {
      if (response) {
        return response.blob();
      } else {
        return fetchViaProxy(letterLink)
          .then(response => {
            let responseClone = response.clone()
            caches.open('my-cache').then(cache => {
              cache.put(letterLink, responseClone);
            });
            return response.blob();
          });
      }
    });
}



function updateDownloadProgress(currentFileIndex, totalFiles) {
  document.body.innerHTML = ("Current file:<b>" + (currentFileIndex + 1) +'</b><br> Total files:<b>'+totalFiles+'</b><br>'+Math.floor(((currentFileIndex + 1)/totalFiles)*10000)/100+'% downloaded')
}
async function saveZipFile(zip) {
  document.body.innerHTML='Please wait for download to start. it will take some minutes.'
  await zip.generateAsync({ type: "blob" }).then(function(content) {
    saveAs(content, "students.zip");
  });
  document.body.innerHTML = ('downloaded')
}
