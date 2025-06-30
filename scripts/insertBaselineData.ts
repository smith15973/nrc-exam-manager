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
const system_kas: SystemKa[] = JSON.parse(
  fs.readFileSync('scripts/data/system_kas.json', 'utf-8')
);

interface ValidationError {
  ka_number: string;
  stem_id: string;
  index: number;
}

interface SystemKaValidationError {
  system_number: string;
  ka_number: string;
  index: number;
  error_type: 'missing_system' | 'missing_ka' | 'both_missing';
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

function validateSystemKas(): SystemKaValidationError[] {
  console.log('Validating System-KA relationships...');
  
  // Create Sets for fast lookup
  const validSystemNumbers = new Set(systems.map(system => system.system_number));
  const validKaNumbers = new Set(kas.map(ka => ka.ka_number));
  
  console.log(`Valid system numbers: ${Array.from(validSystemNumbers).slice(0, 10).join(', ')}... (${validSystemNumbers.size} total)`);
  console.log(`Valid KA numbers: ${Array.from(validKaNumbers).slice(0, 10).join(', ')}... (${validKaNumbers.size} total)`);
  console.log(`Total System-KAs to validate: ${system_kas.length}`);
  
  const errors: SystemKaValidationError[] = [];
  
  system_kas.forEach((system_ka, index) => {
    const hasValidSystem = validSystemNumbers.has(system_ka.system_number);
    const hasValidKa = validKaNumbers.has(system_ka.ka_number);
    
    if (!hasValidSystem && !hasValidKa) {
      errors.push({
        system_number: system_ka.system_number,
        ka_number: system_ka.ka_number,
        index: index,
        error_type: 'both_missing'
      });
    } else if (!hasValidSystem) {
      errors.push({
        system_number: system_ka.system_number,
        ka_number: system_ka.ka_number,
        index: index,
        error_type: 'missing_system'
      });
    } else if (!hasValidKa) {
      errors.push({
        system_number: system_ka.system_number,
        ka_number: system_ka.ka_number,
        index: index,
        error_type: 'missing_ka'
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

function reportSystemKaValidationErrors(errors: SystemKaValidationError[]): void {
  console.error(`\n❌ SYSTEM-KA VALIDATION FAILED: Found ${errors.length} System-KA(s) with invalid references\n`);
  
  // Group errors by type for better reporting
  const errorsByType = errors.reduce((acc, error) => {
    if (!acc[error.error_type]) {
      acc[error.error_type] = [];
    }
    acc[error.error_type].push(error);
    return acc;
  }, {} as Record<string, SystemKaValidationError[]>);
  
  if (errorsByType.missing_system) {
    console.error(`Missing System Numbers (${errorsByType.missing_system.length} occurrences):`);
    errorsByType.missing_system.forEach(error => {
      console.error(`  - System: "${error.system_number}", KA: "${error.ka_number}" at index ${error.index}`);
    });
    console.error('');
  }
  
  if (errorsByType.missing_ka) {
    console.error(`Missing KA Numbers (${errorsByType.missing_ka.length} occurrences):`);
    errorsByType.missing_ka.forEach(error => {
      console.error(`  - System: "${error.system_number}", KA: "${error.ka_number}" at index ${error.index}`);
    });
    console.error('');
  }
  
  if (errorsByType.both_missing) {
    console.error(`Both System and KA Missing (${errorsByType.both_missing.length} occurrences):`);
    errorsByType.both_missing.forEach(error => {
      console.error(`  - System: "${error.system_number}", KA: "${error.ka_number}" at index ${error.index}`);
    });
    console.error('');
  }
  
  console.error('Available System Numbers:');
  systems.slice(0, 20).forEach(system => {
    console.error(`  - ${system.system_number}: ${system.system_name}`);
  });
  if (systems.length > 20) {
    console.error(`  ... and ${systems.length - 20} more systems`);
  }
  
  console.error('\nAvailable KA Numbers (first 20):');
  kas.slice(0, 20).forEach(ka => {
    console.error(`  - ${ka.ka_number}`);
  });
  if (kas.length > 20) {
    console.error(`  ... and ${kas.length - 20} more KAs`);
  }
  
  console.error('\n🛑 Database insert cancelled due to System-KA validation errors.');
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

export function insertSystemKas(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO system_kas 
        (system_number, ka_number, category, ro_importance, sro_importance, ka_statement, cfr_content) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      system_kas.forEach(({ 
        system_number, 
        ka_number, 
        category, 
        ro_importance, 
        sro_importance, 
        ka_statement, 
        cfr_content 
      }) => {
        stmt.run(
          system_number, 
          ka_number, 
          category, 
          ro_importance, 
          sro_importance, 
          ka_statement, 
          cfr_content
        );
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting System-KAs:', err);
          reject(err);
        } else {
          console.log("✅ System-KA insert complete.");
          resolve();
        }
      });
    });
  });
}

export async function insertDataWithValidation(): Promise<void> {
  try {
    // First, validate all KAs against stems
    const kaValidationErrors = validateKAsAgainstStems();
    
    if (kaValidationErrors.length > 0) {
      reportValidationErrors(kaValidationErrors);
      process.exit(1); // Exit with error code
    }
    
    console.log('✅ All KA numbers reference valid stem IDs');
    
    // Next, validate all System-KAs against systems and KAs
    const systemKaValidationErrors = validateSystemKas();
    
    if (systemKaValidationErrors.length > 0) {
      reportSystemKaValidationErrors(systemKaValidationErrors);
      process.exit(1); // Exit with error code
    }
    
    console.log('✅ All System-KA entries reference valid systems and KAs');
    console.log(`Processing ${stems.length} stems, ${kas.length} KAs, ${systems.length} systems, and ${system_kas.length} system-KAs...\n`);
    
    // If validation passes, proceed with inserts
    await insertStems();
    await insertKas();
    await insertSystems();
    await insertSystemKas();
    
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
export { validateKAsAgainstStems, validateSystemKas, reportValidationErrors, reportSystemKaValidationErrors };

// Main execution - ES module version
if (import.meta.url === `file://${process.argv[1]}`) {
  insertDataWithValidation();
}