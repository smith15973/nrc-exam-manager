// Database schema definition
export const schema = {
  plants: {
    columns: [
      'plant_id INTEGER PRIMARY KEY AUTOINCREMENT',
      'name TEXT NOT NULL',
    ],
  },
  exams: {
    columns: [
      'exam_id INTEGER PRIMARY KEY AUTOINCREMENT',
      'name TEXT NOT NULL',
      'plant_id INTEGER NOT NULL',
      'FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE',
    ],
  },
  questions: {
    columns: [
      'question_id INTEGER PRIMARY KEY AUTOINCREMENT',
      'question_text TEXT NOT NULL',
      'category TEXT',
      'exam_level TEXT',
      'technical_references TEXT',
      'difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5)',
      'cognitive_level TEXT',
      'objective TEXT',
      'last_used DATE',
    ],
  },
  exam_questions: {
    columns: [
      'exam_id INTEGER NOT NULL',
      'question_id INTEGER NOT NULL',
      'PRIMARY KEY (exam_id, question_id)',
      'FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
    ],
  },
  answers: {
    columns: [
      'answer_id INTEGER PRIMARY KEY AUTOINCREMENT',
      'question_id INTEGER NOT NULL',
      'answer_text TEXT NOT NULL',
      'is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1))',
      'justification TEXT CHECK (is_correct = 0 OR justification IS NOT NULL)',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
    ],
  },
  question_ka_numbers: {
    columns: [
      'question_id INTEGER NOT NULL',
      'ka_number TEXT NOT NULL',
      'ka_statement TEXT',
      'ka_importance TEXT',
      'PRIMARY KEY (question_id, ka_number)',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
    ],
  },
  question_system_numbers: {
    columns: [
      'question_id INTEGER NOT NULL',
      'system_number TEXT NOT NULL',
      'system_description TEXT',
      'PRIMARY KEY (question_id, system_number)',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
    ],
  },
  schema_version: {
    columns: [
      'version INTEGER PRIMARY KEY',
      'applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    ],
  },
};

// Form schema for plants (derived from schema.plants)
export const plantSchema = schema.plants.columns
  .filter(col => !col.includes('PRIMARY KEY') && !col.includes('FOREIGN KEY'))
  .map(col => {
    const [name, type] = col.split(' ');
    return {
      key: name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      type: type === 'TEXT' ? 'text' : 'number',
      required: col.includes('NOT NULL'),
    };
  });

// Default plant object
export const defaultPlant: Plant = {
  plant_id: 0,
  name: '',
};


// Form schema for exams (derived from schema.exams)
export const examSchema = schema.exams.columns
  .filter(col => !col.includes('PRIMARY KEY') && !col.includes('FOREIGN KEY'))
  .map(col => {
    const [name, type] = col.split(' ');
    return {
      key: name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      type: type === 'TEXT' ? 'text' : 'number',
      required: col.includes('NOT NULL'),
    };
  });

// Default plant object
export const defaultExam: Exam = {
  exam_id: 0,
  name: '',
  plant_id: 0,
};