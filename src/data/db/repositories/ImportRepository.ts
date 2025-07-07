import { dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Database } from '../database';
import { ExamRepository } from './ExamRepository';

export class ImportRepository {
  private db: Database;
  private examRepo: ExamRepository;

  constructor(db: Database) {
    this.db = db;
  }

  // File Dialog Helpers
  async saveFileDialog(defaultName: string, filters: Electron.FileFilter[]): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters
    });

    return result.canceled ? null : result.filePath;
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
  async importFiles(allowMultiple = true): Promise<unknown[] | { success: boolean; error: string }> {
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
      const results: unknown[] = [];

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
        let fileData: unknown;

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
  private async processJsonFile(filePath: string): Promise<unknown> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON file: ${(error as Error).message}`);
    }
  }

  // Helper method to process CSV files
  private async processCsvFile(filePath: string): Promise<unknown[]> {
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
  private async processXlsxFile(filePath: string): Promise<unknown[]> {
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

  async importFilesSimple(allowMultiple = true): Promise<unknown[] | { success: boolean; error: string }> {
    const result = await this.importFiles(allowMultiple);

    if ('success' in result && !result.success) {
      return result; // Return error as-is
    }

    const files = result as unknown[];
    const allData: unknown[] = [];

    for (const file of files) {
      if (!(typeof file === 'object' && file !== null && 'data' in file)) {
        console.warn('File object missing data property:', file);
        continue;
      }

      if (Array.isArray(file.data)) {
        allData.push(...file.data); // Spread arrays
      } else {
        allData.push(file.data); // Push single objects
      }
    }

    return allData;
  }

  // Updated importQuestionsSimple method with proper QuestionForDataTransfer formatting
  async importQuestionsSimple(): Promise<Question[] | { success: boolean; error: string }> {
    try {
      const result = await this.importFilesSimple(true);

      if ('success' in result && !result.success) {
        return result; // Return error as-is
      }

      const rawData = result as unknown[];
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

  // Updated helper method to transform raw data into QuestionForDataTransfer format
  private transformToQuestion(rawData: unknown): Question | null {
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Invalid data type - expected object');
    }

    const data = rawData as Record<string, any>;

    // Validate required fields
    if (!data.question_text && !data.questionText && !data.text) {
      throw new Error('Missing required field: question_text');
    }

    let question_exams;

    // Handle question_exams if they exist
    if (data.question_exams || data.exams) {
      const examData = data.question_exams || data.exams;
      if (Array.isArray(examData)) {
        question_exams = examData.map(exam => ({
          exam_name: this.extractString(exam.exam_name || exam.name) || '',
          main_system: this.extractString(exam.main_system || exam.system) || '',
          main_ka: this.extractString(exam.main_ka || exam.ka) || '',
          ka_match_justification: this.extractString(exam.ka_match_justification || exam.ka_justification) || '',
          sro_match_justification: this.extractString(exam.sro_match_justification || exam.sro_justification) || '',
          answers_order: this.extractString(exam.answers_order || exam.order) || ''
        }));
      } else if (typeof examData === 'object') {
        question_exams = [{
          exam_name: this.extractString(examData.exam_name || examData.name) || '',
          main_system: this.extractString(examData.main_system || examData.system) || '',
          main_ka: this.extractString(examData.main_ka || examData.ka) || '',
          ka_match_justification: this.extractString(examData.ka_match_justification || examData.ka_justification) || '',
          sro_match_justification: this.extractString(examData.sro_match_justification || examData.sro_justification) || '',
          answers_order: this.extractString(examData.answers_order || examData.order) || 'ABCD'
        }];
      }
    }

    question_exams?.forEach(async (qe) => {
      const exam = await this.examRepo.get({ 'name': qe.exam_name })
      qe.exam_id = exam.exam_id;
    })

    // Handle system_ka_numbers if they exist
    if (data.system_ka_numbers || data.systems || data.kas) {
      const systemKaData = data.system_ka_numbers || data.systems || data.kas;
      if (Array.isArray(systemKaData)) {
        question.system_ka_numbers = systemKaData.map(item => {
          if (typeof item === 'string') {
            return item;
          } else if (typeof item === 'object' && item !== null) {
            return this.extractString(item.number || item.ka_number || item.system_number) || '';
          }
          return String(item);
        }).filter(item => item !== '');
      } else if (typeof systemKaData === 'string') {
        question.system_ka_numbers = [systemKaData];
      } else if (typeof systemKaData === 'object' && systemKaData !== null) {
        const extracted = this.extractString(systemKaData.number || systemKaData.ka_number || systemKaData.system_number);
        if (extracted) {
          question.system_ka_numbers = [extracted];
        }
      }
    }

    // Transform the data to match QuestionForDataTransfer interface
    const question: Question = {
      question_text: this.extractString(data.question_text || data.questionText || data.text) || '',
      img_url: this.extractString(data.img_url || data.image || data.imgUrl) || null,
      answer_a: this.extractString(data.answer_a || data.a || data.option_a) || '',
      answer_a_justification: this.extractString(data.answer_a_justification || data.a_justification || data.justification_a) || '',
      answer_b: this.extractString(data.answer_b || data.b || data.option_b) || '',
      answer_b_justification: this.extractString(data.answer_b_justification || data.b_justification || data.justification_b) || '',
      answer_c: this.extractString(data.answer_c || data.c || data.option_c) || '',
      answer_c_justification: this.extractString(data.answer_c_justification || data.c_justification || data.justification_c) || '',
      answer_d: this.extractString(data.answer_d || data.d || data.option_d) || '',
      answer_d_justification: this.extractString(data.answer_d_justification || data.d_justification || data.justification_d) || '',
      correct_answer: (this.extractString(data.correct_answer || data.correct || data.answer) || 'A').toUpperCase() as "A" | "B" | "C" | "D",
      exam_level: (this.extractNumber(data.exam_level || data.examLevel || data.level) === 1 ? 1 : 0) as 0 | 1,
      cognitive_level: (this.extractNumber(data.cognitive_level || data.cognitiveLevel) === 1 ? 1 : 0) as 0 | 1,
      technical_references: this.extractString(data.technical_references || data.technicalReferences || data.references) || null,
      references_provided: this.extractString(data.references_provided || data.referencesProvided) || null,
      objective: this.extractString(data.objective) || null
    };



    return question;
  }

  // Helper method to safely extract string values
  private extractString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    return String(value).trim();
  }

  // Helper method to safely extract number values
  private extractNumber(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  // Updated validation method for QuestionForDataTransfer
  private async cleanAndValidateQuestionForDataTransfer(question: QuestionForDataTransfer): Promise<{ question: QuestionForDataTransfer; warnings: string[] }> {
    const warnings: string[] = [];
    const cleanedQuestion = { ...question };

    // Define allowed field names for type safety
    type AnswerField = 'answer_a' | 'answer_b' | 'answer_c' | 'answer_d';
    type JustificationField = 'answer_a_justification' | 'answer_b_justification' | 'answer_c_justification' | 'answer_d_justification';

    // Clean required fields
    if (!cleanedQuestion.question_text || cleanedQuestion.question_text.trim() === '') {
      cleanedQuestion.question_text = '';
      warnings.push('Question text was missing - set to empty string');
    }

    // Validate correct_answer
    if (!['A', 'B', 'C', 'D'].includes(cleanedQuestion.correct_answer)) {
      cleanedQuestion.correct_answer = 'A';
      warnings.push('Invalid correct_answer - set to A');
    }

    // Validate exam_level and cognitive_level
    if (cleanedQuestion.exam_level !== 0 && cleanedQuestion.exam_level !== 1) {
      cleanedQuestion.exam_level = 0;
      warnings.push('Invalid exam_level - set to 0');
    }

    if (cleanedQuestion.cognitive_level !== 0 && cleanedQuestion.cognitive_level !== 1) {
      cleanedQuestion.cognitive_level = 0;
      warnings.push('Invalid cognitive_level - set to 0');
    }

    // Clean answer fields
    const answerFields: AnswerField[] = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
    const justificationFields: JustificationField[] = ['answer_a_justification', 'answer_b_justification', 'answer_c_justification', 'answer_d_justification'];

    answerFields.forEach(field => {
      if (!cleanedQuestion[field] || cleanedQuestion[field].trim() === '') {
        cleanedQuestion[field] = '';
        warnings.push(`${field} was missing - set to empty string`);
      }

      // Truncate long answer text
      if (cleanedQuestion[field] && cleanedQuestion[field].length > 500) {
        cleanedQuestion[field] = cleanedQuestion[field].substring(0, 500);
        warnings.push(`${field} was too long - truncated to 500 characters`);
      }
    });

    justificationFields.forEach(field => {
      if (!cleanedQuestion[field] || cleanedQuestion[field].trim() === '') {
        cleanedQuestion[field] = '';
        warnings.push(`${field} was missing - set to empty string`);
      }
    });

    // Truncate long question text
    if (cleanedQuestion.question_text && cleanedQuestion.question_text.length > 1000) {
      cleanedQuestion.question_text = cleanedQuestion.question_text.substring(0, 1000);
      warnings.push('Question text was too long - truncated to 1000 characters');
    }

    // Clean question_exams if present
    if (cleanedQuestion.question_exams) {
      cleanedQuestion.question_exams = cleanedQuestion.question_exams.map(exam => ({
        exam_name: exam.exam_name || '',
        main_system: exam.main_system || '',
        main_ka: exam.main_ka || '',
        ka_match_justification: exam.ka_match_justification || '',
        sro_match_justification: exam.sro_match_justification || '',
        answers_order: exam.answers_order || ''
      }));
    }

    // Clean system_ka_numbers if present
    if (cleanedQuestion.system_ka_numbers) {
      cleanedQuestion.system_ka_numbers = cleanedQuestion.system_ka_numbers.filter(num => num && num.trim() !== '');
    }

    return {
      question: cleanedQuestion,
      warnings
    };
  }

  // Updated method to get import statistics with cleaned data for QuestionForDataTransfer
  async importQuestionsForDataTransfer(): Promise<{
    questions: QuestionForDataTransfer[];
    stats: { total: number; processed: number; warnings: { questionNumber: number, msgs: string[] }[] }
  } | { success: boolean; error: string }> {
    try {
      const result = await this.importFilesSimple(true);

      if ('success' in result && !result.success) {
        return result;
      }

      const rawData = result as unknown[];
      const questions: Question[] = [];
      const allWarnings: { questionNumber: number, msgs: string[] }[] = [];
      let totalProcessed = 0;
      let successfullyProcessed = 0;

      for (const item of rawData) {
        totalProcessed++;
        try {
          const question = this.transformToQuestion(item);
          if (question) {
            const { question: cleanedQuestion, warnings } = await this.cleanAndValidateQuestionForDataTransfer(question);
            questions.push(cleanedQuestion);
            successfullyProcessed++;

            // Add warnings with question context
            if (warnings.length > 0) {
              allWarnings.push({
                questionNumber: totalProcessed,
                msgs: warnings
              });
            }
          }
        } catch (transformError) {
          allWarnings.push({
            questionNumber: totalProcessed,
            msgs: [`Failed to transform question - ${(transformError as Error).message}`]
          });
        }
      }

      console.log("RESULTS", questions)

      return {
        questions,
        stats: {
          total: totalProcessed,
          processed: successfullyProcessed,
          warnings: allWarnings
        }
      };
    } catch (error) {
      return { success: false, error: `Failed to import questions: ${(error as Error).message}` };
    }
  }

  // Keep the old importQuestions method for backward compatibility
  async importQuestions(): Promise<{
    questions: QuestionForDataTransfer[];
    stats: { total: number; processed: number; warnings: { questionNumber: number, msgs: string[] }[] }
  } | { success: boolean; error: string }> {
    // For backward compatibility, delegate to the new method
    return this.importQuestionsForDataTransfer();
  }
}