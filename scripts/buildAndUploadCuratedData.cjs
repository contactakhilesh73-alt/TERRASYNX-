const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, writeBatch } = require('firebase/firestore');

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const NOW = Date.now();

function cleanUndefined(obj) {
  return JSON.parse(JSON.stringify(obj, (_k, v) => (v === undefined ? null : v)));
}

const hackathons = JSON.parse(fs.readFileSync('./scripts/extracted_hackathons.json', 'utf-8'));
const internships = JSON.parse(fs.readFileSync('./scripts/extracted_internships.json', 'utf-8'));

console.log(`Processing ${hackathons.length} hackathons and ${internships.length} internships...`);

const sourcesMap = new Map();
const recordsList = [];

// 1. Process Hackathons
for (const h of hackathons) {
  const rawUrl = (h.officialUrl || '').trim();
  const hasVerifiableSource = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
  const sourceId = `src_hackathon_${(h.organizer || h.name).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}`;

  if (!sourcesMap.has(sourceId)) {
    sourcesMap.set(sourceId, {
      id: sourceId,
      name: h.organizer || h.name,
      officialUrls: hasVerifiableSource ? [rawUrl] : [],
      category: 'hackathon',
      country: h.country || 'Global',
      parserType: 'official_page_watcher',
      createdAt: NOW,
    });
  }

  const status = hasVerifiableSource ? 'UNVERIFIED_CURATED' : 'UNKNOWN';
  const evidence = hasVerifiableSource
    ? `Curated from official hackathon portal (${rawUrl}) under status UNVERIFIED_CURATED pending crawler verification.`
    : 'No verifiable official source URL found; categorized UNKNOWN.';

  recordsList.push({
    id: h.id,
    sourceId,
    sourceUrl: rawUrl,
    status,
    curatedOn: NOW,
    lastVerifiedAt: NOW,
    evidence,
    title: h.name,
    organizer: h.organizer || h.name,
    category: 'hackathon',
    country: h.country || 'Global',
    verifiedFacts: cleanUndefined(h),
  });
}

// 2. Process Internships
for (const cycle of internships) {
  const rawUrl = (cycle.officialCareersUrl || '').trim();
  const hasVerifiableSource = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
  const sourceId = `src_program_${(cycle.companyName || cycle.programTitle).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}`;
  const cat = cycle.programCategory || cycle.tierCategory || 'internship';

  if (!sourcesMap.has(sourceId)) {
    sourcesMap.set(sourceId, {
      id: sourceId,
      name: cycle.companyName,
      officialUrls: hasVerifiableSource ? [rawUrl] : [],
      category: cat,
      country: cycle.country || 'Global',
      parserType: 'official_page_watcher',
      createdAt: NOW,
    });
  }

  const status = hasVerifiableSource ? 'UNVERIFIED_CURATED' : 'UNKNOWN';
  const evidence = hasVerifiableSource
    ? `Curated from official program portal (${rawUrl}) under status UNVERIFIED_CURATED pending crawler verification.`
    : 'No verifiable official source URL found; categorized UNKNOWN.';

  recordsList.push({
    id: cycle.id,
    sourceId,
    sourceUrl: rawUrl,
    status,
    curatedOn: NOW,
    lastVerifiedAt: NOW,
    evidence,
    title: cycle.programTitle,
    organizer: cycle.companyName,
    category: cat,
    country: cycle.country || 'Global',
    verifiedFacts: cleanUndefined(cycle),
  });
}

console.log(`Generated ${sourcesMap.size} unique sources and ${recordsList.length} records.`);

// Save to disk
fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync('./src/data/curatedSources.json', JSON.stringify(Array.from(sourcesMap.values()), null, 2));
fs.writeFileSync('./src/data/curatedRecords.json', JSON.stringify(recordsList, null, 2));
console.log('✅ Saved updated snapshots to src/data/curatedSources.json and src/data/curatedRecords.json');

async function uploadToFirestore() {
  const allSources = Array.from(sourcesMap.values());
  const BATCH_SIZE = 400;

  console.log('Committing sources to Firestore in batches...');
  for (let i = 0; i < allSources.length; i += BATCH_SIZE) {
    const chunk = allSources.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const src of chunk) {
      const ref = doc(db, 'sources', src.id);
      batch.set(ref, cleanUndefined(src));
    }
    await batch.commit();
    console.log(`Committed sources batch ${i + 1} to ${Math.min(i + BATCH_SIZE, allSources.length)}`);
  }

  console.log('Committing records to Firestore in batches...');
  for (let i = 0; i < recordsList.length; i += BATCH_SIZE) {
    const chunk = recordsList.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const rec of chunk) {
      const ref = doc(db, 'records', rec.id);
      batch.set(ref, cleanUndefined(rec));
    }
    await batch.commit();
    console.log(`Committed records batch ${i + 1} to ${Math.min(i + BATCH_SIZE, recordsList.length)}`);
  }

  console.log('🎉 Successfully uploaded all sources and records to Firestore!');
}

uploadToFirestore().catch(err => {
  console.error('Firestore upload failed:', err);
  process.exit(1);
});
