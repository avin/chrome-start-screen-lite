import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import locales from './locales.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '_locales');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const generateLocaleFiles = (locales) => {
  const languages = Object.keys(Object.values(locales)[0]);

  languages.forEach(lang => {
    const messages = {};

    Object.keys(locales).forEach(key => {
      messages[key] = {
        message: locales[key][lang]
      };
    });

    const langDir = path.join(outputDir, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir);
    }
    fs.writeFileSync(path.join(langDir, 'messages.json'), JSON.stringify(messages, null, 2));
  });
};

generateLocaleFiles(locales);

console.log('Locales generated successfully.');