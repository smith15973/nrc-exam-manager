// src/renderer/global.d.ts
interface Plant {
  plant_id: number;
  name: string;
  exams?: Exam[];
}

interface Exam {
  exam_id: number;
  name: string;
  plant_id: number;
  plant?: Plant;
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