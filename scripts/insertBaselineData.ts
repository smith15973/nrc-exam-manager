import sqlite3 from 'sqlite3';
import fs from 'fs';

const sqlite3v = sqlite3.verbose();
const db = new sqlite3v.Database('/Users/noah/Desktop/Projects/Davis_Besse_2025/nrc-exam-manager/src/data/nrc_exam_questions_database.db');

// Your array of stems
const stems: Stem[] = JSON.parse(
  fs.readFileSync('scripts/data/stems.json', 'utf-8')
);

const kas: Ka[] = JSON.parse(
  fs.readFileSync('scripts/data/kas.json', 'utf-8')
);
const systems: System[] = JSON.parse(
  fs.readFileSync('scripts/data/systems.json', 'utf-8')
);

interface ValidationError {
  ka_number: string;
  stem_id: string;
  index: number;
}

function validateKAsAgainstStems(): ValidationError[] {
  console.log('Validating KA numbers against stems...');
  
  // Create a Set of valid stem_ids for fast lookup
  const validStemIds = new Set(stems.map(stem => stem.stem_id));
  
  console.log(`Valid stem IDs: ${Array.from(validStemIds).join(', ')}`);
  console.log(`Total KAs to validate: ${kas.length}`);
  
  const errors: ValidationError[] = [];
  
  kas.forEach((ka, index) => {
    if (!validStemIds.has(ka.stem_id)) {
      errors.push({
        ka_number: ka.ka_number,
        stem_id: ka.stem_id,
        index: index
      });
    }
  });
  
  return errors;
}

function reportValidationErrors(errors: ValidationError[]): void {
  console.error(`\n❌ VALIDATION FAILED: Found ${errors.length} KA(s) with invalid stem IDs\n`);
  
  // Group errors by stem_id for better reporting
  const errorsByStem = errors.reduce((acc, error) => {
    if (!acc[error.stem_id]) {
      acc[error.stem_id] = [];
    }
    acc[error.stem_id].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);
  
  Object.entries(errorsByStem).forEach(([stemId, stemErrors]) => {
    console.error(`Invalid stem ID: "${stemId}" (${stemErrors.length} occurrences)`);
    stemErrors.forEach(error => {
      console.error(`  - KA: "${error.ka_number}" at index ${error.index}`);
    });
    console.error('');
  });
  
  console.error('Available stem IDs:');
  stems.forEach(stem => {
    console.error(`  - ${stem.stem_id}: ${stem.stem_statement.substring(0, 60)}...`);
  });
  
  console.error('\n🛑 Database insert cancelled due to validation errors.');
}

export function insertStems(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare("INSERT OR IGNORE INTO stems (stem_id, stem_statement) VALUES (?, ?)");
      
      stems.forEach(({ stem_id, stem_statement }) => {
        stmt.run(stem_id, stem_statement);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting stems:', err);
          reject(err);
        } else {
          console.log("✅ Stem insert complete.");
          resolve();
        }
      });
    });
  });
}

export function insertKas(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare("INSERT OR IGNORE INTO kas (ka_number, stem_id) VALUES (?, ?)");
      
      kas.forEach(({ ka_number, stem_id }) => {
        stmt.run(ka_number, stem_id);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting KAs:', err);
          reject(err);
        } else {
          console.log("✅ KA insert complete.");
          resolve();
        }
      });
    });
  });
}
export function insertSystems(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare("INSERT OR IGNORE INTO systems (system_number, system_name) VALUES (?, ?)");
      
      systems.forEach(({ system_number, system_name }) => {
        stmt.run(system_number, system_name);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting Systems:', err);
          reject(err);
        } else {
          console.log("✅ System insert complete.");
          resolve();
        }
      });
    });
  });
}

export async function insertDataWithValidation(): Promise<void> {
  try {
    // First, validate all KAs against stems
    const validationErrors = validateKAsAgainstStems();
    
    if (validationErrors.length > 0) {
      reportValidationErrors(validationErrors);
      process.exit(1); // Exit with error code
    }
    
    console.log('✅ All KA numbers reference valid stem IDs');
    console.log(`Processing ${stems.length} stems and ${kas.length} KAs...\n`);
    
    // If validation passes, proceed with inserts
    await insertStems();
    await insertKas();
    await insertSystems();
    
    console.log('\n🎉 All data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error during database operations:', error);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}

// Export individual functions for flexibility
export { validateKAsAgainstStems, reportValidationErrors };

// Main execution - ES module version
if (import.meta.url === `file://${process.argv[1]}`) {
  insertDataWithValidation();
}