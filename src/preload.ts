// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  addPlant: (plant: Plant) => ipcRenderer.invoke('add-plant', plant),
  getPlants: () => ipcRenderer.invoke('get-plants'),
  getPlantsWithExams: () => ipcRenderer.invoke('get-plants-with-exams'),
  getPlantWithExams: (plantId: number) => ipcRenderer.invoke('get-plant-with-exams', plantId),
  getPlant: (plantId: number) => ipcRenderer.invoke('get-plant', plantId),
  updatePlant: (plant: Plant) => ipcRenderer.invoke('update-plant', plant),
  deletePlant: (plantId: number) => ipcRenderer.invoke('delete-plant', plantId),

  addExam: (exam: Exam) => ipcRenderer.invoke('add-exam', exam),
  getExams: () => ipcRenderer.invoke('get-exams'),
  getExam: (examId: number) => ipcRenderer.invoke('get-exam', examId),
  updateExam: (exam: Exam) => ipcRenderer.invoke('update-exam', exam),
  deleteExam: (examId: number) => ipcRenderer.invoke('delete-exam', examId),

  addQuestion: (question: Question) => ipcRenderer.invoke('add-question', question),
  getQuestions: () => ipcRenderer.invoke('get-questions'),
  getQuestion: (questionId: number) => ipcRenderer.invoke('get-question', questionId),
  getQuestionAll: (questionId: number) => ipcRenderer.invoke('get-question-with-all', questionId),
  updateQuestion: (question: Question) => ipcRenderer.invoke('update-question', question),
  deleteQuestion: (questionId: number) => ipcRenderer.invoke('delete-question', questionId),

});