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
  img_url: string | null;
  answer_a: string;
  answer_a_justification: string;
  answer_b: string;
  answer_b_justification: string;
  answer_c: string;
  answer_c_justification: string;
  answer_d: string;
  answer_d_justification: string;
  correct_answer: "A" | "B" | "C" | "D";
  exam_level: 0 | 1;
  cognitive_level: 0 | 1;
  technical_references: string | null;
  references_provided: string | null;
  objective: string | null;
  last_used: string | null;
  exams?: Exam[];
  system_kas?: SystemKa[];
}

interface Answer {
  answer_text: string;
  isCorrect: 0 | 1;
  justification: string;
}

interface ExamQuestion {
  exam_id: number;
  question_id: number;
  question_number: number;
  main_system_ka_system: string | null;
  main_system_ka_ka: string | null;
  ka_match_justification: string | null;
  sro_match_justification: string | null;
  answers_order: string | null;
  // Optional relationship properties
  exam?: Exam;
  question?: Question;
}

interface Category {
  category_number: string;
  category_description: string;
}
interface Ka {
  ka_number: string;
  category_number: string;

  category?: Category;
}
interface System {
  system_number: string;
  system_name: string;
}

interface SystemKa {
  system_number: string;
  ka_number: string;
  system_ka_number: string;
  ka_statement: string | null;
  ro_importance: number;
  sro_importance: number;
  cfr_content: string | null;

  system?: System;
  ka?: Ka;
}

interface QuestionSystemKa {
  question_id: number;
  ka_number: string;
  system_number: string;

  question?: Question;
  ka?: Ka;
  system?: System;
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

interface CategoryResponse extends ApiResponse {
  category?: Category;
  categories?: Category[];
}

interface SystemKaResponse extends ApiResponse {
  systemKa?: SystemKa;
  systemKas?: SystemKa[];
}

interface QuestionSystemKasResponse extends ApiResponse {
  questionSystemKa?: QuestionSystemKa;
  questionSystemKas?: QuestionSystemKa[];
}

interface QuestionsImportResponse extends ApiResponse {
  questions: Question[];
  stats: {
    total: number;
    processed: number;
    warnings: {
      questionNumber: number;
      msgs: string[];
    }[]
  }
}


interface QuestionsExportResponse extends ApiResponse {
  filePath?: string;
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
      removeQuestion: (examId: number, questionId: number) => Promise<ExamResponse>
      addQuestionToExam: (examId: number, questionId: number) => Promise<ExamResponse>
    },
    questions: {
      add: (question: Question) => Promise<QuestionResponse>;
      addBatch: (questions: Question[]) => Promise<{ success: boolean, inserted: number[], ignored: number[] }>;
      get: (filters?: QuestionFilters) => Promise<QuestionResponse>;
      getComplete: (filters?: QuestionFilters) => Promise<QuestionResponse>;
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

  files: {
    import: {
      questions: () => Promise<QuestionsImportResponse>
    },
    export: {
      questions: (questionIds: number[]) => Promise<QuestionsExportResponse>
    },
    openLocation: (filePath: string) => void,
    changeDBLocation: () => Promise<ApiResponse>;
    selectSBDBLocation: () => Promise<ApiResponse>;
  }
}

interface DBSearchParams {
  [key: string]: unknown;
}

interface QuestionFilters {
  question_id?: number;
  question_text?: string;
  query?: string;
  examIds?: number[];
  kaNums?: string[];
  systemNums?: string[];
  lastUsedStart?: string;
  lastUsedEnd?: string;
  examLevelStart?: string;
  examLevelEnd?: string;
  diffLevelStart?: string;
  diffLevelEnd?: string;
  cogLevelStart?: string;
  cogLevelEnd?: string;
  objective?: string;
  category?: string;
  technical_references?: string;

}