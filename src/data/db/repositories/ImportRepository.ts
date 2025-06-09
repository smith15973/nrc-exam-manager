// db/repositories/PlantRepository.ts
import sqlite3 from 'sqlite3';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Database } from '../database';

export class ImportRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // File Dialog Helpers
  async saveFileDialog(defaultName: string, filters: Electron.FileFilter[]): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters
    });

    return result.canceled ? null : result.filePath!;
  }

  async openFileDialog(filters: Electron.FileFilter[], allowMultiple = false): Promise<string[] | null> {
    const properties: Electron.OpenDialogOptions['properties'] = ['openFile'];
    if (allowMultiple) {
      properties.push('multiSelections');
    }

    const result = await dialog.showOpenDialog({
      properties,
      filters
    });

    return result.canceled ? null : result.filePaths;
  }

  // Unified import function that handles JSON, CSV, and XLSX files
  async importFiles(allowMultiple: boolean = true): Promise<any[] | { success: boolean; error: string }> {
    const filePaths = await this.openFileDialog([
      { name: 'All Supported Files', extensions: ['json', 'csv', 'xlsx'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'Excel Files', extensions: ['xlsx'] }
    ], allowMultiple);

    if (!filePaths || filePaths.length === 0) {
      return { success: false, error: 'No file selected' };
    }

    try {
      const results: any[] = [];

      for (const filePath of filePaths) {
        // Verify file exists and is readable
        if (!fs.existsSync(filePath)) {
          return { success: false, error: `File does not exist: ${filePath}` };
        }

        try {
          fs.accessSync(filePath, fs.constants.R_OK);
        } catch (permError) {
          return { success: false, error: `Permission denied for file: ${filePath}` };
        }

        // Determine file type by extension
        const extension = path.extname(filePath).toLowerCase();
        let fileData: any;

        switch (extension) {
          case '.json':
            fileData = await this.processJsonFile(filePath);
            break;
          case '.csv':
            fileData = await this.processCsvFile(filePath);
            break;
          case '.xlsx':
            fileData = await this.processXlsxFile(filePath);
            break;
          default:
            return { success: false, error: `Unsupported file type: ${extension}` };
        }

        // Add metadata about the file
        results.push({
          fileName: path.basename(filePath),
          filePath: filePath,
          fileType: extension.substring(1), // Remove the dot
          data: fileData
        });
      }

      return results;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Helper method to process JSON files
  private async processJsonFile(filePath: string): Promise<any> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON file: ${(error as Error).message}`);
    }
  }

  // Helper method to process CSV files
  private async processCsvFile(filePath: string): Promise<any[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Parse CSV using Papa Parse
      const parseResult = Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header: string) => header.trim() // Clean up headers
      });

      if (parseResult.errors && parseResult.errors.length > 0) {
        const errorMessages = parseResult.errors.map(err => err.message).join(', ');
        throw new Error(`CSV parsing errors: ${errorMessages}`);
      }

      return parseResult.data;
    } catch (error) {
      throw new Error(`Failed to parse CSV file: ${(error as Error).message}`);
    }
  }

  // Helper method to process XLSX files
  private async processXlsxFile(filePath: string): Promise<any[]> {
    try {
      const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });

      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }

      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, {
        defval: null,
        raw: false // This helps with date formatting
      });

      return data;
    } catch (error) {
      throw new Error(`Failed to parse XLSX file: ${(error as Error).message}`);
    }
  }

  // Alternative version that returns just the data without metadata
  async importFilesSimple(allowMultiple: boolean = true): Promise<any[] | { success: boolean; error: string }> {
    const result = await this.importFiles(allowMultiple);

    if ('success' in result && !result.success) {
      return result; // Return error as-is
    }

    // Extract just the data from each file
    const files = result as any[];
    const allData: any[] = [];

    for (const file of files) {
      if (Array.isArray(file.data)) {
        allData.push(...file.data); // Spread arrays
      } else {
        allData.push(file.data); // Push single objects
      }
    }

    return allData;
  }

  // Updated importQuestions method with proper Question[] formatting
  async importQuestionsSimple(): Promise<Question[] | { success: boolean; error: string }> {
    try {
      const result = await this.importFilesSimple(true);

      if ('success' in result && !result.success) {
        return result; // Return error as-is
      }

      const rawData = result as any[];
      const questions: Question[] = [];

      for (const item of rawData) {
        try {
          const question = this.transformToQuestion(item);
          if (question) {
            questions.push(question);
          }
        } catch (transformError) {
          console.warn(`Skipping invalid question data:`, item, transformError);
          // Continue processing other questions rather than failing entirely
        }
      }

      if (questions.length === 0) {
        return { success: false, error: 'No valid questions found in the imported data' };
      }

      return questions;
    } catch (error) {
      return { success: false, error: `Failed to import questions: ${(error as Error).message}` };
    }
  }

  // Helper method to transform raw data into Question format
  private transformToQuestion(rawData: any): Question | null {
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Invalid data type - expected object');
    }

    // Validate required fields
    if (!rawData.question_text && !rawData.questionText && !rawData.text) {
      throw new Error('Missing required field: question_text');
    }

    // Transform the data to match Question interface
    const question: Question = {
      question_id: this.extractNumber(rawData.question_id || rawData.questionId || rawData.id) || 0,
      question_text: this.extractString(rawData.question_text || rawData.questionText || rawData.text) || '',
      category: this.extractString(rawData.category) || null,
      exam_level: this.extractString(rawData.exam_level || rawData.examLevel || rawData.level) || null,
      technical_references: this.extractString(rawData.technical_references || rawData.technicalReferences || rawData.references) || null,
      difficulty_level: this.extractNumber(rawData.difficulty_level || rawData.difficultyLevel || rawData.difficulty) || null,
      cognitive_level: this.extractString(rawData.cognitive_level || rawData.cognitiveLevel) || null,
      objective: this.extractString(rawData.objective) || null,
      last_used: this.extractString(rawData.last_used || rawData.lastUsed) || null
    };

    // Handle answers if they exist
    if (rawData.answers || rawData.choices || rawData.options) {
      const answersData = rawData.answers || rawData.choices || rawData.options;
      question.answers = this.transformAnswers(answersData, question.question_id);
    }

    // Handle relationships if they exist
    if (rawData.exams) {
      question.exams = Array.isArray(rawData.exams) ? rawData.exams : [rawData.exams];
    }

    if (rawData.kas || rawData.knowledge_areas) {
      question.kas = Array.isArray(rawData.kas || rawData.knowledge_areas)
        ? (rawData.kas || rawData.knowledge_areas)
        : [rawData.kas || rawData.knowledge_areas];
    }

    if (rawData.systems) {
      question.systems = Array.isArray(rawData.systems) ? rawData.systems : [rawData.systems];
    }

    return question;
  }

  // Helper method to transform answers data
  private transformAnswers(answersData: any, questionId: number): [Answer, Answer, Answer, Answer] | undefined {
    if (!answersData) return undefined;

    let answers: any[] = [];

    if (Array.isArray(answersData)) {
      answers = answersData;
    } else if (typeof answersData === 'object') {
      // Handle object format like { a: "text", b: "text", c: "text", d: "text" }
      answers = Object.entries(answersData).map(([key, value]) => ({
        option: key.toUpperCase(),
        answer_text: value,
        is_correct: 0 // Default to incorrect, will be set based on correct_answer field
      }));
    }

    // Ensure we have exactly 4 answers
    while (answers.length < 4) {
      answers.push({
        answer_text: '',
        is_correct: 0,
        option: String.fromCharCode(65 + answers.length) // A, B, C, D
      });
    }

    // Transform to Answer format
    const transformedAnswers: Answer[] = answers.slice(0, 4).map((answer, index) => ({
      answer_id: 0, // Will be set by database
      question_id: questionId,
      answer_text: this.extractString(answer.answer_text || answer.text || answer.content) || '',
      is_correct: this.extractNumber(answer.is_correct || answer.correct) || 0,
      option: this.extractString(answer.option) || String.fromCharCode(65 + index), // A, B, C, D
      justification: this.extractString(answer.justification || answer.explanation) || null
    }));

    return transformedAnswers as [Answer, Answer, Answer, Answer];
  }

  // Helper method to safely extract string values
  private extractString(value: any): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    return String(value).trim();
  }

  // Helper method to safely extract number values
  private extractNumber(value: any): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private async validateQuestion(question: Question): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get all valid reference data
    const exams = await this.db.exams.getAll();
    const kas = await this.db.kas.getMany();
    const systems = await this.db.systems.getMany();

    // Check required fields
    if (!question.question_text || question.question_text.trim() === '') {
      errors.push('Question text is required');
    }

    // Validate answers if they exist
    if (question.answers) {
      if (question.answers.length !== 4) {
        errors.push('Question must have exactly 4 answers');
      }

      const correctAnswers = question.answers.filter(a => a.is_correct === 1);
      if (correctAnswers.length === 0) {
        errors.push('Question must have at least one correct answer');
      }

      // Check for multiple correct answers (assuming only one should be correct)
      if (correctAnswers.length > 1) {
        errors.push('Question should have only one correct answer');
      }

      question.answers.forEach((answer, index) => {
        if (!answer.answer_text || answer.answer_text.trim() === '') {
          errors.push(`Answer ${index + 1} text is required`);
        }
      });
    } else {
      errors.push('Question must have answers');
    }

    // Validate difficulty level range
    if (question.difficulty_level !== null && question.difficulty_level !== undefined) {
      if (question.difficulty_level < 1 || question.difficulty_level > 5) {
        errors.push('Difficulty level must be between 1 and 5');
      }
    }

    // Validate exam references
    if (question.exams && question.exams.length > 0) {
      const validExamIds = exams.map(exam => exam.exam_id);
      question.exams.forEach(examRef => {
        if (examRef.exam_id && !validExamIds.includes(examRef.exam_id)) {
          errors.push(`Referenced exam with ID ${examRef.exam_id} does not exist`);
        }
      });
    }

    // Validate KA (Knowledge Area) references
    if (question.kas && question.kas.length > 0) {
      const validKaNumbers = kas.map(ka => ka.ka_number);
      question.kas.forEach(kaRef => {
        if (kaRef.ka_number && !validKaNumbers.includes(kaRef.ka_number)) {
          errors.push(`Referenced KA with number ${kaRef.ka_number} does not exist`);
        }
      });
    }

    // Validate system references  
    if (question.systems && question.systems.length > 0) {
      const validSystemNumbers = systems.map(system => system.number);
      question.systems.forEach(systemRef => {
        if (systemRef.number && !validSystemNumbers.includes(systemRef.number)) {
          errors.push(`Referenced system with number ${systemRef.number} does not exist`);
        }
      });
    }

    // Validate date format if last_used is provided
    if (question.last_used) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(question.last_used)) {
        errors.push('Last used date must be in YYYY-MM-DD format');
      } else {
        const date = new Date(question.last_used);
        if (isNaN(date.getTime())) {
          errors.push('Last used date is not a valid date');
        }
      }
    }

    // Additional business logic validations
    if (question.question_text && question.question_text.length > 1000) {
      errors.push('Question text is too long (maximum 1000 characters)');
    }

    if (question.answers) {
      question.answers.forEach((answer, index) => {
        if (answer.answer_text && answer.answer_text.length > 500) {
          errors.push(`Answer ${index + 1} text is too long (maximum 500 characters)`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Method to get import statistics
  async importQuestions(): Promise<{
    questions: Question[];
    stats: { total: number; valid: number; invalid: number; errors: string[] }
  } | { success: boolean; error: string }> {
    try {
      const result = await this.importFilesSimple(true);

      if ('success' in result && !result.success) {
        return result;
      }

      const rawData = result as any[];
      const questions: Question[] = [];
      const errors: string[] = [];
      let totalProcessed = 0;
      let validQuestions = 0;

      for (const item of rawData) {
        totalProcessed++;
        try {
          const question = this.transformToQuestion(item);
          if (question) {
            const validation = await this.validateQuestion(question);
            if (validation.isValid) {
              questions.push(question);
              validQuestions++;
            } else {
              errors.push(`Question ${totalProcessed}: ${validation.errors.join(', ')}`);
            }
          }
        } catch (transformError) {
          errors.push(`Question ${totalProcessed}: ${(transformError as Error).message}`);
        }
      }

      return {
        questions,
        stats: {
          total: totalProcessed,
          valid: validQuestions,
          invalid: totalProcessed - validQuestions,
          errors
        }
      };
    } catch (error) {
      return { success: false, error: `Failed to import questions: ${(error as Error).message}` };
    }
  }


  async exportQuestions(questionIds: number[], defaultFileName?: string): Promise<{ success: boolean; error?: string; filePath?: string }> {
    try {
      // Get question data
      const questions = await Promise.all(
        questionIds.map(id => this.db.questionService.getCompleteQuestion(id))
      );

      // Show save dialog
      const fileName = defaultFileName || `nem_questions_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = await this.saveFileDialog(fileName, [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]);

      if (!filePath) {
        return { success: false, error: 'Export cancelled by user' };
      }

      // Write file
      fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');

      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: `Failed to export questions: ${(error as Error).message}` };
    }
  }

}