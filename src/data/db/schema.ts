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
      'last_used TEXT',
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
      'justification TEXT',
      'option TEXT',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
    ],
  },
  kas: {
    columns: [
      'ka_number TEXT PRIMARY KEY',
      'ka_description TEXT',
    ]
  },
  question_kas: {
    columns: [
      'question_id INTEGER NOT NULL',
      'ka_number TEXT NOT NULL',
      'PRIMARY KEY (question_id, ka_number)',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
    ],
  },
  systems: {
    columns: [
      'number TEXT PRIMARY KEY',
      'name TEXT NOT NULL',
    ],
  },
  question_systems: {
    columns: [
      'question_id INTEGER NOT NULL',
      'system_number TEXT NOT NULL',
      'PRIMARY KEY (question_id, system_number)',
      'FOREIGN KEY (system_number) REFERENCES systems(number) ON DELETE CASCADE',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
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
export const answerSchema = generateSchema(schema.answers);
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
  category: null,
  exam_level: null,
  technical_references: null,
  difficulty_level: null,
  cognitive_level: null,
  objective: null,
  last_used: null,
  answers: [
    { answer_id: 0, question_id: 0, answer_text: '', is_correct: 0, option: 'A', justification: null },
    { answer_id: 0, question_id: 0, answer_text: '', is_correct: 0, option: 'B', justification: null },
    { answer_id: 0, question_id: 0, answer_text: '', is_correct: 0, option: 'C', justification: null },
    { answer_id: 0, question_id: 0, answer_text: '', is_correct: 0, option: 'D', justification: null },
  ],
  kas: [],
  systems: [],
  exams: [],
}

export const defaultExamQuestion: ExamQuestion = {
  exam_id: 0,
  question_id: 0,
  question_number: null,
}

export const defaultAnswer: Answer = {
  answer_id: 0,
  question_id: 0,
  answer_text: '',
  is_correct: 0,
  option: null,
  justification: null,
}

export const defaultKa: Ka = {
  ka_number: '',
  ka_description: ''
}

export const defaultSystem: System = {
  number: '',
  name: '',
}

