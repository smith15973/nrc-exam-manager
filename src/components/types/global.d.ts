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
  answers?: Answer[];
  exams?: Exam[];
  ka_numbers?: QuestionKaNumber[];
  system_numbers?: QuestionSystemNumber[];
}

interface ExamQuestion {
  exam_id: number;
  question_id: number;
  // Optional relationship properties
  exam?: Exam;
  question?: Question;
}

interface Answer {
  answer_id: number;
  question_id: number;
  answer_text: string;
  is_correct: number;
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

interface Window {
  api: {
    // plant operations
    addPlant: (plant: Plant) => Promise<PlantResponse>;
    getPlants: () => Promise<PlantResponse>;
    getPlant: (plantId: number) => Promise<PlantResponse>;
    getPlantWithExams: (plantId: number) => Promise<PlantResponse>;
    getPlantsWithExams: () => Promise<PlantResponse>;
    updatePlant: (plant: Plant) => Promise<PlantResponse>;
    deletePlant: (plantId: number) => Promise<PlantResponse>;

    // exam operations
    addExam: (exam: Exam) => Promise<ExamResponse>;
    getExams: () => Promise<ExamResponse>;
    getExam: (examId: number) => Promise<ExamResponse>;
    updateExam: (exam: Exam) => Promise<ExamResponse>;
    deleteExam: (examId: number) => Promise<ExamResponse>;
  };
}