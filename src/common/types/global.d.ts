// src/renderer/global.d.ts
interface Plant {
  plant_id: number;
  name: string;
  // Optional relationship properties
  exams?: Exam[];
}

interface Exam {
  exam_id: number;
  name: string;
  plant_id: number;
  // Optional relationship properties
  plant?: Plant;
  questions?: Question[];
}

interface Question {
  question_id: number;
  question_text: string;
  category: string | null;
  exam_level: string | null;
  technical_references: string | null;
  difficulty_level: number | null;
  cognitive_level: string | null;
  objective: string | null;
  last_used: string | null;
  // Optional relationship properties
  answers?: [Answer, Answer, Answer, Answer];
  exams?: Exam[];
  ka_numbers?: QuestionKaNumber[];
  system_numbers?: QuestionSystemNumber[];
}

interface QuestionAll {
  question_id: number;
  question_text: string;
  category: string | null;
  exam_level: string | null;
  technical_references: string | null;
  difficulty_level: number | null;
  cognitive_level: string | null;
  objective: string | null;
  last_used: string | null;
  answer_id: number | null;
  answer_text: string | null;
  answer_question_id: number | null;
  is_correct: number | null;
  option: string | null;
  justification: string | null;
  exam_id: number | null;
  exam_name: string | null;
  exam_plant_id: number | null;
}


interface ExamQuestion {
  exam_id: number;
  question_id: number;
  question_number: number | null;
  // Optional relationship properties
  exam?: Exam;
  question?: Question;
}

interface Answer {
  answer_id: number;
  question_id: number;
  answer_text: string;
  is_correct: number;
  option: string | null;
  justification: string | null;
  // Optional relationship properties
  question?: Question;
}

interface QuestionKaNumber {
  question_id: number;
  ka_number: string;
  ka_statement: string | null;
  ka_importance: string | null;
  // Optional relationship properties
  question?: Question;
}

interface QuestionSystemNumber {
  question_id: number;
  system_number: string;
  system_description: string | null;
  // Optional relationship properties
  question?: Question;
}

interface ApiResponse {
  success: boolean;
  error?: string;
}

interface PlantResponse extends ApiResponse {
  plantId: number;
  plant?: Plant;
  plants?: Plant[];
}

interface ExamResponse extends ApiResponse {
  examId: number;
  exam?: Exam;
  exams?: Exam[];
}

interface QuestionResponse extends ApiResponse {
  questionId: number;
  question?: Question;
  questions?: Question[];
}

interface AnswerResponse extends ApiResponse {
  answerId?: number;
  answer?: Answer;
  answers?: Answer[];
}

interface ExamQuestionResponse extends ApiResponse {
  examQuestion?: ExamQuestion;
  examQuestions?: ExamQuestion[];
}

interface QuestionKaNumberResponse extends ApiResponse {
  questionKaNumber?: QuestionKaNumber;
  questionKaNumbers?: QuestionKaNumber[];
}

interface QuestionSystemNumberResponse extends ApiResponse {
  questionSystemNumber?: QuestionSystemNumber;
  questionSystemNumbers?: QuestionSystemNumber[];
}

// Define all possible operations
type DataOperation =
  // Plants
  | { entity: 'plants'; action: 'create'; data: Plant }
  | { entity: 'plants'; action: 'read'; data?: number }
  | { entity: 'plants'; action: 'update'; data: Plant }
  | { entity: 'plants'; action: 'delete'; data: number }
  | { entity: 'plants'; action: 'readWithExams'; data?: number }
  // Exams  
  | { entity: 'exams'; action: 'create'; data: Exam }
  | { entity: 'exams'; action: 'read'; data?: number }
  | { entity: 'exams'; action: 'update'; data: Exam }
  | { entity: 'exams'; action: 'delete'; data: number }
  // Questions
  | { entity: 'questions'; action: 'create'; data: Question }
  | { entity: 'questions'; action: 'read'; data?: number }
  | { entity: 'questions'; action: 'update'; data: Question }
  | { entity: 'questions'; action: 'delete'; data: number }
  | { entity: 'questions'; action: 'readWithAll'; data: number }
  | { entity: 'questions'; action: 'readAnswers'; data: number }
  | { entity: 'questions'; action: 'readExams'; data: number };

interface DataResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}