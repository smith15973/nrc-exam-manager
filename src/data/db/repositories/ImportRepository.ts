import { dialog } from 'electron';
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
  async importFiles(allowMultiple = true): Promise<any[] | { success: boolean; error: string }> {
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
  async importFilesSimple(allowMultiple = true): Promise<any[] | { success: boolean; error: string }> {
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

  // Updated importQuestionsSimple method with proper Question[] formatting
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
      img_url: this.extractString(rawData.img_url || rawData.image || rawData.imgUrl) || null,
      answer_a: this.extractString(rawData.answer_a || rawData.a || rawData.option_a) || '',
      answer_a_justification: this.extractString(rawData.answer_a_justification || rawData.a_justification || rawData.justification_a) || '',
      answer_b: this.extractString(rawData.answer_b || rawData.b || rawData.option_b) || '',
      answer_b_justification: this.extractString(rawData.answer_b_justification || rawData.b_justification || rawData.justification_b) || '',
      answer_c: this.extractString(rawData.answer_c || rawData.c || rawData.option_c) || '',
      answer_c_justification: this.extractString(rawData.answer_c_justification || rawData.c_justification || rawData.justification_c) || '',
      answer_d: this.extractString(rawData.answer_d || rawData.d || rawData.option_d) || '',
      answer_d_justification: this.extractString(rawData.answer_d_justification || rawData.d_justification || rawData.justification_d) || '',
      correct_answer: (this.extractString(rawData.correct_answer || rawData.correct || rawData.answer) || 'A').toUpperCase() as "A" | "B" | "C" | "D",
      exam_level: (this.extractNumber(rawData.exam_level || rawData.examLevel || rawData.level) === 1 ? 1 : 0),
      cognitive_level: (this.extractNumber(rawData.cognitive_level || rawData.cognitiveLevel) === 1 ? 1 : 0),
      technical_references: this.extractString(rawData.technical_references || rawData.technicalReferences || rawData.references) || null,
      references_provided: this.extractString(rawData.references_provided || rawData.referencesProvided) || null,
      objective: this.extractString(rawData.objective) || null,
      last_used: this.extractString(rawData.last_used || rawData.lastUsed) || null
    };


    // Handle relationships if they exist
    if (rawData.exams) {
      question.exams = Array.isArray(rawData.exams) ? rawData.exams : [rawData.exams];
    }

    if (rawData.systems) {
      question.system_kas = Array.isArray(rawData.system_kas) ? rawData.system_kas : [rawData.system_kas];
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

  // Updated validation method that cleans data instead of rejecting it
  private async cleanAndValidateQuestion(question: Question): Promise<{ question: Question; warnings: string[] }> {
    const warnings: string[] = [];
    const cleanedQuestion = { ...question };

    // Get all valid reference data
    const exams = await this.db.exams.getAll();
    const kas = await this.db.kas.getMany();
    const systems = await this.db.systems.getMany();

    // Clean required fields
    if (!cleanedQuestion.question_text || cleanedQuestion.question_text.trim() === '') {
      cleanedQuestion.question_text = '';
      warnings.push('Question text was missing - set to empty string');
    }

    if (cleanedQuestion.question_text && cleanedQuestion.question_text.trim() !== '') {
      const existingQuestions = await this.db.questions.getMany({ query: cleanedQuestion.question_text.trim() });
      const existingQuestion = existingQuestions[0];
      if (existingQuestion) {
        warnings.push(`Duplicate question detected - matches existing question ID ${existingQuestion.question_id}`);
      }
    }

    // Clean and validate answers
    if (!cleanedQuestion.answers) {
      // Create 4 empty answers if none exist
      cleanedQuestion.answers = [
        { answer_id: 0, question_id: cleanedQuestion.question_id, answer_text: '', is_correct: 0, option: 'A', justification: null },
        { answer_id: 0, question_id: cleanedQuestion.question_id, answer_text: '', is_correct: 0, option: 'B', justification: null },
        { answer_id: 0, question_id: cleanedQuestion.question_id, answer_text: '', is_correct: 0, option: 'C', justification: null },
        { answer_id: 0, question_id: cleanedQuestion.question_id, answer_text: '', is_correct: 0, option: 'D', justification: null }
      ] as [Answer, Answer, Answer, Answer];
      warnings.push('Question had no answers - created 4 empty answers');
    } else {
      // Ensure exactly 4 answers
      if (cleanedQuestion.answers.length !== 4) {
        const currentAnswers = [...cleanedQuestion.answers];

        // Pad with empty answers if less than 4
        while (currentAnswers.length < 4) {
          currentAnswers.push({
            answer_id: 0,
            question_id: cleanedQuestion.question_id,
            answer_text: '',
            is_correct: 0,
            option: String.fromCharCode(65 + currentAnswers.length),
            justification: null
          });
        }

        // Trim to 4 if more than 4
        if (currentAnswers.length > 4) {
          warnings.push(`Question had ${cleanedQuestion.answers.length} answers - trimmed to 4`);
        } else {
          warnings.push(`Question had ${cleanedQuestion.answers.length} answers - padded to 4`);
        }

        cleanedQuestion.answers = currentAnswers.slice(0, 4) as [Answer, Answer, Answer, Answer];
      }

      // Check for correct answers and fix if needed
      const correctAnswers = cleanedQuestion.answers.filter(a => a.is_correct === 1);
      if (correctAnswers.length === 0) {
        // Set first answer as correct if none are marked
        cleanedQuestion.answers[0].is_correct = 1;
        warnings.push('No correct answer found - set answer A as correct');
      } else if (correctAnswers.length > 1) {
        // Keep only the first correct answer
        let foundCorrect = false;
        cleanedQuestion.answers.forEach(answer => {
          if (answer.is_correct === 1) {
            if (foundCorrect) {
              answer.is_correct = 0;
            } else {
              foundCorrect = true;
            }
          }
        });
        warnings.push(`Multiple correct answers found - kept only the first one`);
      }

      // Clean answer texts
      cleanedQuestion.answers.forEach((answer, index) => {
        if (!answer.answer_text || answer.answer_text.trim() === '') {
          answer.answer_text = '';
          warnings.push(`Answer ${String.fromCharCode(65 + index)} text was missing - set to empty string`);
        }

        // Truncate long answer text
        if (answer.answer_text && answer.answer_text.length > 500) {
          answer.answer_text = answer.answer_text.substring(0, 500);
          warnings.push(`Answer ${String.fromCharCode(65 + index)} text was too long - truncated to 500 characters`);
        }
      });
    }

    // Clean difficulty level
    if (cleanedQuestion.difficulty_level !== null && cleanedQuestion.difficulty_level !== undefined) {
      if (cleanedQuestion.difficulty_level < 1) {
        cleanedQuestion.difficulty_level = 1;
        warnings.push('Difficulty level was below 1 - set to 1');
      } else if (cleanedQuestion.difficulty_level > 5) {
        cleanedQuestion.difficulty_level = 5;
        warnings.push('Difficulty level was above 5 - set to 5');
      }
    }

    // Clean exam references
    if (cleanedQuestion.exams && cleanedQuestion.exams.length > 0) {
      const validExamIds = exams.map(exam => exam.exam_id);
      const rejectedExams: string[] = [];

      cleanedQuestion.exams = cleanedQuestion.exams.filter(examRef => {
        if (!examRef.exam_id || validExamIds.includes(examRef.exam_id)) {
          return true;
        } else {
          // Find the exam name for the rejected reference
          const examName = examRef.name || `ID ${examRef.exam_id}`;
          rejectedExams.push(examName);
          return false;
        }
      });

      if (rejectedExams.length > 0) {
        warnings.push(`Removed invalid exam references: ${rejectedExams.join(', ')}`);
      }
    }

    // Clean exam references
    if (cleanedQuestion.kas && cleanedQuestion.kas.length > 0) {
      const validKaNums = kas.map(ka => ka.ka_number);
      const rejectedKas: string[] = [];

      cleanedQuestion.kas = cleanedQuestion.kas.filter(kaRef => {
        if (!kaRef.ka_number || validKaNums.includes(kaRef.ka_number)) {
          return true;
        } else {
          // Find the exam name for the rejected reference
          const kaNumber = kaRef.ka_number;
          rejectedKas.push(kaNumber);
          return false;
        }
      });

      if (rejectedKas.length > 0) {
        warnings.push(`Removed invalid KA references: ${rejectedKas.join(', ')}`);
      }
    }

    // Clean system references
    if (cleanedQuestion.systems && cleanedQuestion.systems.length > 0) {
      const validSystemNumbers = systems.map(system => system.system_number);
      const rejectedSystems: string[] = [];

      cleanedQuestion.systems = cleanedQuestion.systems.filter(systemRef => {
        if (!systemRef.number || validSystemNumbers.includes(systemRef.number)) {
          return true;
        } else {
          const systemNumber = systemRef.number;
          rejectedSystems.push(systemNumber);
          return false;
        }
      });

      if (rejectedSystems.length > 0) {
        warnings.push(`Removed invalid system references: ${rejectedSystems.join(', ')}`);
      }
    }

    // Clean date format
    if (cleanedQuestion.last_used) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(cleanedQuestion.last_used)) {
        // Try to parse and reformat the date
        const date = new Date(cleanedQuestion.last_used);
        if (!isNaN(date.getTime())) {
          cleanedQuestion.last_used = date.toISOString().split('T')[0];
          warnings.push('Last used date was reformatted to YYYY-MM-DD');
        } else {
          cleanedQuestion.last_used = null;
          warnings.push('Last used date was invalid - set to null');
        }
      }
    }

    // Truncate long question text
    if (cleanedQuestion.question_text && cleanedQuestion.question_text.length > 1000) {
      cleanedQuestion.question_text = cleanedQuestion.question_text.substring(0, 1000);
      warnings.push('Question text was too long - truncated to 1000 characters');
    }

    return {
      question: cleanedQuestion,
      warnings
    };
  }

  // Method to get import statistics with cleaned data
  // Method to get import statistics with cleaned data
  async importQuestions(): Promise<{
    questions: Question[];
    stats: { total: number; processed: number; warnings: { questionNumber: number, msgs: string[] }[] }
  } | { success: boolean; error: string }> {
    try {
      const result = await this.importFilesSimple(true);

      if ('success' in result && !result.success) {
        return result;
      }

      const rawData = result as any[];
      const questions: Question[] = [];
      const allWarnings: { questionNumber: number, msgs: string[] }[] = [];
      let totalProcessed = 0;
      let successfullyProcessed = 0;

      for (const item of rawData) {
        totalProcessed++;
        try {
          const question = this.transformToQuestion(item);
          if (question) {
            const { question: cleanedQuestion, warnings } = await this.cleanAndValidateQuestion(question);
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
            msgs: [`Failed to transformToQuestion - ${(transformError as Error).message}`]
          });
        }
      }

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
}
