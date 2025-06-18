// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Helper function to make database calls
const dbCall = (operation: string, data?: any) => {
  console.log("Preload DATA", data)
  return ipcRenderer.invoke('db-operation', { operation, data });
};
// Helper function to make file calls
const filesCall = (operation: string, data?: any) => {
  return ipcRenderer.invoke('files-operation', { operation, data });
};

contextBridge.exposeInMainWorld('db', {
  plants: {
    // Plant operations
    add: (plant: Plant) => dbCall('add-plant', plant),
    //single
    getById: (plantId: number) => dbCall('get-plant', plantId),
    getByIdWithExams: (plantId: number) => dbCall('get-plant-with-exams', plantId),

    //many
    get: () => dbCall('get-plants'),
    getWithExams: () => dbCall('get-plants-with-exams'),

    update: (plant: Plant) => dbCall('update-plant', plant),
    delete: (plantId: number) => dbCall('delete-plant', plantId),
  },
  exams: {
    // Exam operations
    add: (exam: Exam) => dbCall('add-exam', exam),
    // single
    getById: (examId: number) => dbCall('get-exam', examId),
    // many
    get: () => dbCall('get-exams'),
    getByQuestionId: (questionId: number) => dbCall('get-exams-by-question-id', questionId),

    update: (exam: Exam) => dbCall('update-exam', exam),
    delete: (examId: number) => dbCall('delete-exam', examId),
    removeQuestion: (examId: number, questionId: number) => dbCall('remove-exam-question', { examId, questionId }),
    addQuestionToExam: (examId: number, questionId: number) => dbCall('add-exam-question', { examId, questionId }),

  },
  questions: {
    // Question operations
    add: (question: Question) => dbCall('add-question', question),
    addBatch: (questions: Question[]) => dbCall('add-questions-batch', questions),
    // single
    getById: (questionId: number) => dbCall('get-question-by-id', questionId),
    getByIdComplete: (questionId: number) => dbCall('get-question-complete', questionId),
    // many
    get: (filters?: QuestionFilters) => dbCall('get-questions', filters),
    getComplete: (filters?: QuestionFilters) => dbCall("get-questions-complete", filters),
    getByExamId: (examId: number) => dbCall("get-questions-by-exam-id", examId),

    update: (question: Question) => dbCall('update-question', question),
    delete: (questionId: number) => dbCall('delete-question', questionId),

    getAnswersByQuestionId: (questionId: number) => dbCall('get-answers-by-question-id', questionId),
  },
  systems: {
    add: (system: System) => dbCall('add-system', system),
    get: (params?: DBSearchParams) => dbCall('get-system', params),
    getMany: (params?: DBSearchParams) => dbCall('get-systems', params),
    update: (system: System) => dbCall('update-system', system),
    delete: (systemNum: number) => dbCall('delete-system', systemNum),
  },
  kas: {
    add: (ka: System) => dbCall('add-ka', ka),
    get: (params?: DBSearchParams) => dbCall('get-ka', params),
    getMany: (params?: DBSearchParams) => dbCall('get-kas', params),
    update: (ka: System) => dbCall('update-ka', ka),
    delete: (kaNum: number) => dbCall('delete-ka', kaNum),
  }
});

contextBridge.exposeInMainWorld('files', {
  import: {
    questions: () => filesCall('import-questions'),
  },
  export: {
    questions: (questionIds: number[]) => filesCall('export-questions', questionIds),
  },
  openLocation: (filePath: string) => filesCall('open-location', filePath),
  changeDBLocation: () => filesCall('change-db-location'),
  selectSBDBLocation: () => filesCall('select-sb-db-location'),
})