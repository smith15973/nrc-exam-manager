import sqlite3 from 'sqlite3';
const sqlite3v = sqlite3.verbose();
const db = new sqlite3v.Database('/Users/noah/Desktop/Projects/Davis_Besse_2025/nrc-exam-manager/src/data/nrc_exam_questions_database.db');

// Your array of stems
const stems = [
  { stem_id: "K1", stem_statement: "Knowledge of the physical connections and/or cause and effect relationships between the (SYSTEM) and the following systems" },
  { stem_id: "K2", stem_statement: "Knowledge of electrical power supplies to the following" },
  { stem_id: "K3", stem_statement: "Knowledge of the effect that a loss or malfunction of the (SYSTEM) will have on the following systems or system parameters" },
  { stem_id: "K4", stem_statement: "Knowledge of (SYSTEM) design features and/or interlocks that provide for the following" },
  { stem_id: "K5", stem_statement: "Knowledge of the operational implications or cause and effect relationships of the following concepts as they apply to the (SYSTEM)" },
  { stem_id: "K6", stem_statement: "Knowledge of the effect of the following plant conditions, system malfunctions, or component malfunctions on the (SYSTEM)" },
  { stem_id: "A1", stem_statement: "Ability to predict and/or monitor changes in parameters associated with operation of the (SYSTEM), including" },
  { stem_id: "A2", stem_statement: "Ability to (a) predict the impacts of the following on the (SYSTEM) and (b) based on those predictions, use procedures to correct, control, or mitigate the consequences of those abnormal operations" },
  { stem_id: "A3", stem_statement: "Ability to monitor automatic features of the (SYSTEM), including" },
  { stem_id: "A4", stem_statement: "Ability to manually operate and/or monitor the (SYSTEM) in the control room" },
  { stem_id: "E/AK1", stem_statement: "Knowledge of the operational implications and/or cause and effect relationships of the following concepts as they apply to the (EVOLUTION)" },
  { stem_id: "E/AK2", stem_statement: "Knowledge of the relationship between the (EVOLUTION) and the following systems or components" },
  { stem_id: "E/AK3", stem_statement: "Knowledge of the reasons for the following responses and/or actions as they apply to the (EVOLUTION)" },
  { stem_id: "E/AA1", stem_statement: "Ability to operate and/or monitor the following as they apply to (EVOLUTION)" },
  { stem_id: "E/AA2", stem_statement: "Ability to determine and/or interpret the following as they apply to (EVOLUTION)" }
];

// Insert stems
db.serialize(() => {
  const stmt = db.prepare("INSERT OR IGNORE INTO stems (stem_id, stem_statement) VALUES (?, ?)");

  stems.forEach(({ stem_id, stem_statement }) => {
    stmt.run(stem_id, stem_statement);
  });

  stmt.finalize();

  console.log("Stem insert complete.");
});

db.close();
