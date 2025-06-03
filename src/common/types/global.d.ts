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
  kas?: Ka[];
  systems?: System[];
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

interface Ka {
  ka_number: string;
  ka_description: string;
}

interface System {
  number: string;
  name: string;
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

interface KaResponse extends ApiResponse {
  ka?: Ka;
  kas?: Ka[];
}

interface SystemResponse extends ApiResponse {
  system?: System;
  systems?: System[];
}

interface Window {
  db: {
    plants: {
      // plant operations
      add: (plant: Plant) => Promise<PlantResponse>;
      get: () => Promise<PlantResponse>;
      getWithExams: () => Promise<PlantResponse>;
      getById: (plantId: number) => Promise<PlantResponse>;
      getByIdWithExams: (plantId: number) => Promise<PlantResponse>;
      update: (plant: Plant) => Promise<PlantResponse>;
      delete: (plantId: number) => Promise<PlantResponse>;
    }
    exams: {
      // exam operations
      add: (exam: Exam) => Promise<ExamResponse>;
      get: () => Promise<ExamResponse>;
      getById: (examId: number) => Promise<ExamResponse>;
      getByQuestionId: (questionId: number) => Promise<ExamResponse>;
      update: (exam: Exam) => Promise<ExamResponse>;
      delete: (examId: number) => Promise<ExamResponse>;
    },
    questions: {
      add: (question: Question) => Promise<QuestionResponse>;
      get: () => Promise<QuestionResponse>;
      getComplete: () => Promise<QuestionResponse>;
      getById: (questionId: number) => Promise<QuestionResponse>;
      getByIdComplete: (questionId: number) => Promise<QuestionResponse>;
      getByExamId: (examId: number) => Promise<QuestionResponse>;
      update: (question: Question) => Promise<QuestionResponse>;
      delete: (questionId: number) => Promise<QuestionResponse>;

      getAnswersByQuestionId: (questionId: number) => Promise<AnswerResponse>;
    },
    systems: {
      add: (system: System) => Promise<SystemResponse>;
      get: (params?: DBSearchParams) => Promise<SystemResponse>;
      getMany: (params?: DBSearchParams) => Promise<SystemResponse>;
      update: (system: System) => Promise<SystemResponse>;
      delete: (systemNum: string) => Promise<SystemResponse>;
    },
    kas: {
      add: (ka: Ka) => Promise<KaResponse>;
      get: (params?: DBSearchParams) => Promise<KaResponse>;
      getMany: (params?: DBSearchParams) => Promise<KaResponse>;
      update: (ka: Ka) => Promise<KaResponse>;
      delete: (kaNum: string) => Promise<KaResponse>;
    }
  };
}

interface DBSearchParams {
  [key: string]: any;
}