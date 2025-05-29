// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Helper function to make database calls
const dbCall = (operation: string, data?: any) => {
  return ipcRenderer.invoke('db-operation', { operation, data });
};

contextBridge.exposeInMainWorld('api', {
  // Plant operations
  addPlant: (plant: Plant) => dbCall('add-plant', plant),
  getPlants: () => dbCall('get-plants'),
  getPlantsWithExams: () => dbCall('get-plants-with-exams'),
  getPlantWithExams: (plantId: number) => dbCall('get-plant-with-exams', plantId),
  getPlant: (plantId: number) => dbCall('get-plant', plantId),
  updatePlant: (plant: Plant) => dbCall('update-plant', plant),
  deletePlant: (plantId: number) => dbCall('delete-plant', plantId),

  // Exam operations
  addExam: (exam: Exam) => dbCall('add-exam', exam),
  getExams: () => dbCall('get-exams'),
  getExam: (examId: number) => dbCall('get-exam', examId),
  updateExam: (exam: Exam) => dbCall('update-exam', exam),
  deleteExam: (examId: number) => dbCall('delete-exam', examId),

  // Question operations
  addQuestion: (question: Question) => dbCall('add-question', question),
  getQuestions: () => dbCall('get-questions'),
  getQuestionById: (questionId: number) => dbCall('get-question-by-id', questionId),
  getAnswersByQuestionId: (questionId: number) => dbCall('get-answers-by-question-id', questionId),
  getExamsByQuestionId: (questionId: number) => dbCall('get-exams-by-question-id', questionId),
  getQuestionAll: (questionId: number) => dbCall('get-questions', questionId),
  updateQuestion: (question: Question) => dbCall('update-question', question),
  deleteQuestion: (questionId: number) => dbCall('delete-question', questionId),
});