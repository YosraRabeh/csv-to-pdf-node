const csv = require('csv-parser');
const csvtojson = require('csvtojson');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const mustache = require('mustache');
const puppeteer = require('puppeteer'); 
const { json } = require('express');
const handlebars = require('handlebars');  //igeneratilek des templates html avec data dynamique
const data = require('./data.json');

//lire le csv
const results = [];
fs.createReadStream('fichier.csv')
  .pipe(csv()) 
  .on('data', (data) => results.push(data))
  .on('end', () => {     
  
   console.log("results 1: ", results);
    generatePDF(results); 
  }); 


//tconverti l csv ll json
const cvsfilepath= "fichier.csv"
csvtojson()
.fromFile(cvsfilepath)
.then((json) =>  {
  console.log(json)
  fs.writeFileSync("data.json", JSON.stringify(json), "utf-8",(err) => {
    if(err) console.log(err)
  })
}
)

function generateHTML(data) {//tparcouri tab et tgenerati l html w baed tgeneratilek barcha paget html
  let html = '';
    //charger le contenu du html
    const template = fs.readFileSync('template.html', 'utf8'); 
    //const compiledTemplate = handlebars.compile(template);

    // Générer le HTML maa les données lkol
    //const html = compiledTemplate(data);
/*
    for (const item of data) {
      const renderedHTML = mustache.render(template, item); //kol iteration nzid objet
      html += renderedHTML; 
    }  
    */
   html= mustache.render(template, {data});
    return html; 
  } 

  //tgenerati lpdf b puppeteer w screeshot

  async function generatePDF(data) {
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage(); 
    const html = generateHTML(data);
    
    await page.setContent(html);
    //await page.emulateMedia('screen');
    const pdfPath = 'output.pdf';
    await page.pdf({ path: pdfPath, format: 'A4',printBackground: true });

    console.log('Le PDF a été généré :', pdfPath);
    await browser.close();
    process.exit();
  } 
  