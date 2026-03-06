const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = "c:/Users/v_marushchak/Desktop/помічник розрахунків/наповненя/Схеми Ергономіка.pdf";
let dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(function (error) {
    console.error("Error reading PDF:", error);
});
