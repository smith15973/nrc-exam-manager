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
      'img_url TEXT',
      'answer_a TEXT NOT NULL',
      'answer_a_justification TEXT NOT NULL',
      'answer_b TEXT NOT NULL',
      'answer_b_justification TEXT NOT NULL',
      'answer_c TEXT NOT NULL',
      'answer_c_justification TEXT NOT NULL',
      'answer_d TEXT NOT NULL',
      'answer_d_justification TEXT NOT NULL',
      'correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ("A", "B", "C", "D"))',
      'exam_level INTEGER NOT NULL CHECK (exam_level IN (0, 1))',
      'cognitive_level INTEGER NOT NULL CHECK (cognitive_level IN (0, 1))',
      'technical_references TEXT',
      'references_provided TEXT',
      'objective TEXT',
      'last_used TEXT',
    ],
  },
  categories: {
    columns: [
      'category_number TEXT PRIMARY KEY',
      'category_description TEXT NOT NULL'
    ]
  },
  systems: {
    columns: [
      'system_number TEXT PRIMARY KEY',
      'system_name TEXT NOT NULL',
    ],
  },
  kas: {
    columns: [
      'ka_number TEXT PRIMARY KEY',
      'category_number TEXT NOT NULL',
      'FOREIGN KEY (category_number) REFERENCES categories(category_number) ON DELETE CASCADE',
    ]
  },
  system_kas: {
    columns: [
      'system_number TEXT NOT NULL',
      'ka_number TEXT NOT NULL',
      'system_ka_number TEXT GENERATED ALWAYS AS (system_number || ka_number) STORED',
      'ka_statement TEXT',
      'ro_importance REAL',
      'sro_importance REAL',
      'cfr_content TEXT',
      'PRIMARY KEY (system_number, ka_number)',
      'FOREIGN KEY (system_number) REFERENCES systems(system_number) ON DELETE CASCADE',
      'FOREIGN KEY (ka_number) REFERENCES kas(ka_number) ON DELETE CASCADE',
    ]
  },
  exam_questions: {
    columns: [
      'exam_id INTEGER NOT NULL',
      'question_id INTEGER NOT NULL',
      'question_number INTEGER NOT NULL',
      'main_system_ka_system TEXT',
      'main_system_ka_ka TEXT',
      'ka_match_justification TEXT NOT NULL',
      'sro_match_justification TEXT',
      'answers_order TEXT',
      'PRIMARY KEY (exam_id, question_id)',
      'FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
      'FOREIGN KEY (main_system_ka_system, main_system_ka_ka) REFERENCES system_kas(system_number, ka_number) ON DELETE CASCADE',
    ],
  },
  question_system_kas: {
    columns: [
      'question_id INTEGER NOT NULL',
      'system_number TEXT NOT NULL',
      'ka_number TEXT NOT NULL',
      'PRIMARY KEY (question_id, system_number, ka_number)',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
      'FOREIGN KEY (system_number, ka_number) REFERENCES system_kas(system_number, ka_number) ON DELETE CASCADE',
    ],
  },
  schema_version: {
    columns: [
      'version INTEGER PRIMARY KEY',
      'applied_at TEXT DEFAULT CURRENT_TIMESTAMP',
    ],
  },
};


// Utility function to generate form schema from table definition
function generateSchema(table: { columns?: string[] }) {
  if (!table || !Array.isArray(table.columns)) return [];
  return table.columns
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
}

export const plantSchema = generateSchema(schema.plants);
export const examSchema = generateSchema(schema.exams);
export const questionSchema = generateSchema(schema.questions);
export const examQuestionSchema = generateSchema(schema.exam_questions);
export const questionKaNumberSchema = generateSchema(schema.kas);
export const systemSchema = generateSchema(schema.systems);


// Default plant object
export const defaultPlant: Plant = {
  plant_id: 0,
  name: '',
  exams: [],
};

// Default exam object
export const defaultExam: Exam = {
  exam_id: 0,
  name: '',
  plant_id: 0,
};

// Default question object
export const defaultQuestion: Question = {
  question_id: 0,
  question_text: '',
  img_url: null,
  answer_a: '',
  answer_a_justification: '',
  answer_b: '',
  answer_b_justification: '',
  answer_c: '',
  answer_c_justification: '',
  answer_d: '',
  answer_d_justification: '',
  correct_answer: 'A',
  exam_level: 0,
  cognitive_level: 0,
  technical_references: null,
  references_provided: null,
  objective: null,
  last_used: null,
  system_kas: [],
  exams: [],
}

export const defaultExamQuestion: ExamQuestion = {
  exam_id: 0,
  question_id: 0,
  question_number: 0,
  main_system_ka_system: '',
  main_system_ka_ka: '',
  ka_match_justification: '',
  sro_match_justification: null,
  answers_order: 'ABCD',
}

export const defaultKa: Ka = {
  ka_number: '',
  category_number: '',
}

export const defaultSystem: System = {
  system_number: '',
  system_name: '',
}
export const defaultCategory: Category = {
  category_number: '',
  category_description: '',
}

export const defaultSystemKa: SystemKa = {
  system_number: '',
  ka_number: '',
  system_ka_number: '',
  ka_statement: null,
  ro_importance: 0,
  sro_importance: 0,
  cfr_content: '',
}

export const defaultQuestionSystemKa: QuestionSystemKa = {
  question_id: 0,
  ka_number: '',
  system_number: ','
}
