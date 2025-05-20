-- Enable foreign key support (required in SQLite3)
PRAGMA foreign_keys = ON;

-- creating table for plants
CREATE TABLE plants (
  plant_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- creating table for exams
CREATE TABLE exams (
  exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  plant_id INTEGER NOT NULL,
  FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE
);

-- creating table for questions
CREATE TABLE questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    category TEXT,
    exam_level TEXT,
    technical_references TEXT,
    difficulty_level INTEGER CHECK (difficulty_level >=1 AND difficulty_level <= 5),
    cognitive_level TEXT,
    objective TEXT,
    last_used DATE
);

CREATE TABLE exam_questions (
    exam_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

CREATE TABLE answers (
    answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)), -- (0=false, 1=true)
    justification TEXT CHECK (is_correct = 0 OR justification IS NOT NULL),
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

CREATE TABLE question_ka_numbers (
    question_id INTEGER NOT NULL,
    ka_number TEXT NOT NULL,
    ka_statement TEXT,
    ka_importance TEXT,
    PRIMARY KEY (question_id, ka_number),
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

CREATE TABLE question_system_numbers (
    question_id INTEGER NOT NULL,
    system_number TEXT NOT NULL,
    system_description TEXT,
    PRIMARY KEY (question_id, system_number),
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);
