import { Client, Functions } from 'appwrite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '');

const functions = new Functions(client);

const functionDirs = [
  { id: 'mizani-config', dir: 'config', runtime: 'node-20.x' },
  { id: 'mizani-score-csv', dir: 'score-csv', runtime: 'node-20.x' },
  { id: 'mizani-generate-report', dir: 'generate-report', runtime: 'node-20.x' },
  { id: 'mizani-onchain-payments', dir: 'onchain-payments', runtime: 'node-20.x' },
];

async function deployFunctions() {
  for (const func of functionDirs) {
    const funcPath = path.join(__dirname, '..', 'mizani-backend', 'functions', func.dir);
    const codePath = path.join(funcPath, 'index.js');
    
    if (!fs.existsSync(codePath)) {
      console.log(`Skipping ${func.id}: ${codePath} not found`);
      continue;
    }
    
    const code = fs.readFileSync(codePath, 'utf-8');
    
    try {
      const existing = await functions.getFunction(func.id);
      console.log(`Updating ${func.id}...`);
      await functions.updateFunction(
        func.id,
        code,
        [], // events
        [], // vars
        func.runtime
      );
    } catch (err) {
      console.log(`Creating ${func.id}...`);
      await functions.createFunction(
        func.id,
        code,
        [], // events
        func.runtime
      );
    }
    
    console.log(`Deployed ${func.id}`);
  }
  
  console.log('All functions deployed successfully');
}

deployFunctions().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
