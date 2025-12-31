// scripts/load-env.ts
import { config } from 'dotenv';
import path from 'path';

// Charger .env.local depuis la racine du projet
config({ path: path.resolve(__dirname, '../.env.local') });
