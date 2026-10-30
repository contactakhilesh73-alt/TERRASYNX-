const fs = require('fs');

// Hackathons
const tsxH = JSON.parse(fs.readFileSync('/tmp/tsx-0/17928-bbc8975fcf5c2add93763523896423e1dd11b786', 'utf-8'));
const codeH = tsxH.code;
const startH = codeH.indexOf('const HACKATHONS_DATABASE = [') !== -1 
  ? codeH.indexOf('const HACKATHONS_DATABASE = [') 
  : codeH.indexOf('const HACKATHONS_DATABASE=[');
const arrStartH = codeH.indexOf('[', startH);
const classH = codeH.indexOf('class HackathonsService');
const arrEndH = codeH.lastIndexOf(']', classH) + 1;
const arrStrH = codeH.slice(arrStartH, arrEndH);

fs.writeFileSync('/tmp/extracted_h.cjs', 'module.exports = ' + arrStrH + ';\n');
const hackathons = require('/tmp/extracted_h.cjs');
console.log('✅ Extracted hackathons count:', hackathons.length);

// Internships
const tsxI = JSON.parse(fs.readFileSync('/tmp/tsx-0/17928-d572ef722dfa5ef30b0618af07857bffed2cec0a', 'utf-8'));
const codeI = tsxI.code;
const startI = codeI.indexOf('const RECURRING_ANNUAL_INTERNSHIPS = [') !== -1 
  ? codeI.indexOf('const RECURRING_ANNUAL_INTERNSHIPS = [') 
  : codeI.indexOf('const RECURRING_ANNUAL_INTERNSHIPS=[');
const arrStartI = codeI.indexOf('[', startI);
const classI = codeI.indexOf('class UpcomingInternshipsService');
const arrEndI = codeI.lastIndexOf(']', classI) + 1;
const arrStrI = codeI.slice(arrStartI, arrEndI);

fs.writeFileSync('/tmp/extracted_i.cjs', 'module.exports = ' + arrStrI + ';\n');
const internships = require('/tmp/extracted_i.cjs');
console.log('✅ Extracted internships count:', internships.length);

fs.writeFileSync('./scripts/extracted_hackathons.json', JSON.stringify(hackathons, null, 2));
fs.writeFileSync('./scripts/extracted_internships.json', JSON.stringify(internships, null, 2));
console.log('✅ Saved extracted json files to ./scripts');
