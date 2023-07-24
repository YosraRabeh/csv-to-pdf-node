const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mustache = require('mustache');
const puppeteer = require('puppeteer');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/generate-pdf', upload.fields([{ name: 'csvFile', maxCount: 1 }, { name: 'templateFile', maxCount: 1 }]), async (req, res) => {
  try {
    const csvFile = req.files['csvFile'][0].path;
    const templateFile = req.files['templateFile'][0].path;

    const csvData = fs.readFileSync(csvFile, 'utf8');
    const data = csvData
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const [nom, prenom, titre] = line.split(',');
        return { nom, prenom, titre };
      });

    const template = fs.readFileSync(templateFile, 'utf8');
    const html = mustache.render(template, { data });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);

    const pdfPath = 'output.pdf';
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });

    await browser.close();

    res.download(pdfPath, 'output.pdf', (err) => {
      if (err) {
        console.error('Une erreur s\'est produite lors du téléchargement du PDF:', err);
      } else {
        fs.unlinkSync(csvFile);
        fs.unlinkSync(templateFile);
        fs.unlinkSync(pdfPath);
      }
    });
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la génération du PDF:', error);
    res.status(500).send('Une erreur s\'est produite lors de la génération du PDF.');
  }
});

app.listen(3000, () => {
  console.log('Le serveur est prêt et écoute sur le port 3000.');
});
