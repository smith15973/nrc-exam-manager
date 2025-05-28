// src/main/preload.ts
import { contextBridge, Data, ipcRenderer } from 'electron';

const api = {
  // Single data function that handles everything
  data: (operation: DataOperation): Promise<DataResponse> =>
    ipcRenderer.invoke('data', operation),

  // Convenience methods for better DX
  plants: {
    create: (plant: Plant) => ipcRenderer.invoke('data', { entity: 'plants', action: 'create', data: plant }),
    getAll: () => ipcRenderer.invoke('data', { entity: 'plants', action: 'read' }),
    getById: (id: number) => ipcRenderer.invoke('data', { entity: 'plants', action: 'read', data: id }),
    update: (plant: Plant) => ipcRenderer.invoke('data', { entity: 'plants', action: 'update', data: plant }),
    delete: (id: number) => ipcRenderer.invoke('data', { entity: 'plants', action: 'delete', data: id }),
    getAllWithExams: () => ipcRenderer.invoke('data', { entity: 'plants', action: 'readWithExams' }),
    getByIdWithExams: (id: number) => ipcRenderer.invoke('data', { entity: 'plants', action: 'readWithExams', data: id }),
  },

  exams: {
    create: (exam: Exam) => ipcRenderer.invoke('data', { entity: 'exams', action: 'create', data: exam }),
    getAll: () => ipcRenderer.invoke('data', { entity: 'exams', action: 'read' }),
    getById: (id: number) => ipcRenderer.invoke('data', { entity: 'exams', action: 'read', data: id }),
    update: (exam: Exam) => ipcRenderer.invoke('data', { entity: 'exams', action: 'update', data: exam }),
    delete: (id: number) => ipcRenderer.invoke('data', { entity: 'exams', action: 'delete', data: id }),
  },

  questions: {
    create: (question: Question) => ipcRenderer.invoke('data', { entity: 'questions', action: 'create', data: question }),
    getAll: () => ipcRenderer.invoke('data', { entity: 'questions', action: 'read' }),
    getById: (id: number) => ipcRenderer.invoke('data', { entity: 'questions', action: 'read', data: id }),
    update: (question: Question) => ipcRenderer.invoke('data', { entity: 'questions', action: 'update', data: question }),
    delete: (id: number) => ipcRenderer.invoke('data', { entity: 'questions', action: 'delete', data: id }),
    getWithAll: (id: number) => ipcRenderer.invoke('data', { entity: 'questions', action: 'readWithAll', data: id }),
    getAnswers: (id: number) => ipcRenderer.invoke('data', { entity: 'questions', action: 'readAnswers', data: id }),
    getExams: (id: number) => ipcRenderer.invoke('data', { entity: 'questions', action: 'readExams', data: id }),
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;