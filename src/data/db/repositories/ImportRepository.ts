import { dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Database } from '../database';

export class ImportRepository {
  private db: Database;


  constructor(
    db: Database,
  ) {
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

  // Updated helper method to transform raw data into QuestionForDataTransfer format
  private async transformToQuestion(rawData: unknown): Promise<{ question: QuestionForDataTransfer; warnings: string[] }> {
    const warnings: string[] = [];

    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Invalid data type - expected object');
    }

    const data = rawData as Record<string, any>;

    // Validate required fields
    if (!data.question_text && !data.questionText && !data.text) {
      throw new Error('Missing required field: question_text');
    }

    // Transform the data to match QuestionForDataTransfer interface
    const question: QuestionForDataTransfer = {
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

    // Handle system_ka_numbers if they exist
    if (data.system_ka_numbers) {
      const systemKaData = data.system_ka_numbers;
      let systemKaNumbers: string[] = [];

      if (Array.isArray(systemKaData)) {
        systemKaNumbers = systemKaData.map(item => {
          if (typeof item === 'string') {
            return item;
          } else if (typeof item === 'object' && item !== null) {
            return this.extractString(item.number || item.ka_number || item.system_ka_number) || '';
          }
          return String(item);
        }).filter(item => item !== '');
      } else if (typeof systemKaData === 'string') {
        systemKaNumbers = [systemKaData];
      } else if (typeof systemKaData === 'object' && systemKaData !== null) {
        const extracted = this.extractString(systemKaData.number || systemKaData.ka_number || systemKaData.system_number || systemKaData.system_ka_number);
        if (extracted) {
          systemKaNumbers = [extracted];
        }
      }

      // Validate system_ka_numbers against database
      if (systemKaNumbers.length > 0) {
        const validatedNumbers: string[] = [];

        for (const originalNumber of systemKaNumbers) {
          // Try original number first
          let baseNumber = originalNumber;
          let systemKa;
          try {
            systemKa = await this.db.system_kas.get({ system_ka_number: originalNumber });
            if (systemKa) {
              validatedNumbers.push(originalNumber);
              continue;
            }
          } catch (error) {
            // Original number not found, continue to try prefixes
          }
          // If the originalNumber starts with '000'
          if (originalNumber.startsWith('000') && originalNumber.includes('_')) {
            // Remove the first three zeros from the originalNumber

            const [system_number, ka_number] = originalNumber.split('_');
            // Format system_number as a 3-digit string
            const formattedSystemNumber = String(parseInt(system_number, 10)).padStart(3, '0');
            baseNumber = `${formattedSystemNumber}_${ka_number}`;
          }

          try {
            systemKa = await this.db.system_kas.get({ system_ka_number: baseNumber });
            if (systemKa) {
              validatedNumbers.push(baseNumber);
              const system_name = (await this.db.systems.get({ system_number: systemKa.system_number })).system_name
              warnings.push(`Close match '${baseNumber} (${system_name})' found for System KA number '${originalNumber}'`);
              continue
            }
          } catch (error) {
            // Base number not found, continue to try prefixes
          }

          // Try with prefixes if original not found
          const prefixesToTry = ["APE", "EPE"];

          let found = false;
          for (const prefix of prefixesToTry) {
            const alteredNumber = `${prefix} ${baseNumber}`;
            try {
              systemKa = await this.db.system_kas.get({ system_ka_number: alteredNumber });
              if (systemKa) {
                validatedNumbers.push(alteredNumber);
                const system_name = (await this.db.systems.get({ system_number: systemKa.system_number })).system_name
                warnings.push(`Close match '${alteredNumber} (${system_name})' found for System KA number '${originalNumber}'`);
                found = true;
                break;
              }
            } catch (error) {
              // This altered number not found, continue to next prefix
            }
          }

          if (!found) {
            warnings.push(`System KA number '${originalNumber}' not found in database`);
          }
        }

        if (validatedNumbers.length > 0) {
          question.system_ka_numbers = validatedNumbers;
        }
      }
    }

    // Handle question_exams if they exist
    if (data.question_exams) {
      const examData = data.question_exams;
      if (Array.isArray(examData)) {
        question.question_exams = examData.map(exam => ({
          exam_name: this.extractString(exam.exam_name || exam.name) || '',
          main_system: this.extractString(exam.main_system || exam.system) || '',
          main_ka: this.extractString(exam.main_ka || exam.ka) || '',
          ka_match_justification: this.extractString(exam.ka_match_justification || exam.ka_justification) || '',
          sro_match_justification: this.extractString(exam.sro_match_justification || exam.sro_justification) || '',
          answers_order: this.extractString(exam.answers_order || exam.order) || 'ABCD',
        }));
      } else if (typeof examData === 'object') {
        question.question_exams = [{
          exam_name: this.extractString(examData.exam_name || examData.name) || '',
          main_system: this.extractString(examData.main_system || examData.system) || '',
          main_ka: this.extractString(examData.main_ka || examData.ka) || '',
          ka_match_justification: this.extractString(examData.ka_match_justification || examData.ka_justification) || '',
          sro_match_justification: this.extractString(examData.sro_match_justification || examData.sro_justification) || '',
          answers_order: this.extractString(examData.answers_order || examData.order) || 'ABCD',
        }];
      }

      // Validate exams and get exam_ids
      if (question.question_exams) {
        const examIds: number[] = [];
        for (const qe of question.question_exams) {
          if (qe.exam_name) {
            let exam;
            try {
              exam = await this.db.exams.get({ name: qe.exam_name });
              if (exam) {
                examIds.push(exam.exam_id);
                if (qe.main_system && qe.main_ka) {
                  // Check if the main_system/main_ka combination exists in the question's system_ka_numbers
                  const mainSystemKaNumber = `${qe.main_system}_${qe.main_ka}`;

                  // Try to find exact match first
                  let found = question.system_ka_numbers?.includes(mainSystemKaNumber);
                  let matchedNumber = mainSystemKaNumber;

                  if (!found) {
                    // Try with leading zeros removed
                    let baseNumber = mainSystemKaNumber;
                    if (mainSystemKaNumber.startsWith('000') && mainSystemKaNumber.includes('_')) {
                      // Remove the first three zeros from the originalNumber

                      const [system_number, ka_number] = mainSystemKaNumber.split('_');
                      // Format system_number as a 3-digit string
                      const formattedSystemNumber = String(parseInt(system_number, 10)).padStart(3, '0');
                      baseNumber = `${formattedSystemNumber}_${ka_number}`;
                      found = question.system_ka_numbers?.includes(baseNumber);
                      if (found) matchedNumber = baseNumber;
                    }

                    if (!found) {
                      // Try with prefixes
                      const prefixesToTry = ["APE", "EPE"];
                      for (const prefix of prefixesToTry) {
                        const alteredNumber = `${prefix} ${baseNumber}`;
                        if (question.system_ka_numbers?.includes(alteredNumber)) {
                          found = true;
                          matchedNumber = alteredNumber;
                          break;
                        }
                      }
                    }
                  }

                  if (!found) {
                    warnings.push(`Main SystemKa '${qe.main_system}_${qe.main_ka}' from exam '${exam.name}' is not in the question's system_ka_numbers. It has been reset.`);
                    qe.main_ka = '';
                    qe.main_system = '';
                  } else if (matchedNumber !== mainSystemKaNumber) {
                    // Update qe.main_system and qe.main_ka to match the found number
                    const [newMainSystem, newMainKa] = matchedNumber.split('_');
                    qe.main_system = newMainSystem;
                    qe.main_ka = newMainKa;
                    warnings.push(`Main SystemKa '${mainSystemKaNumber}' from exam '${exam.name}' updated to '${matchedNumber}' to match system_ka_numbers.`);
                  }
                } else if (qe.main_system && !qe.main_ka) {
                  warnings.push(`Main system '${qe.main_system}' provided but main_ka is missing from exam '${exam.name}'. It has been reset.`);
                  qe.main_ka = '';
                  qe.main_system = '';
                } else if (!qe.main_system && qe.main_ka) {
                  warnings.push(`Main KA '${qe.main_ka}' provided but main_system is missing from exam '${exam.name}'. It has been reset.`);
                  qe.main_ka = '';
                  qe.main_system = '';
                }
              } else {
                warnings.push(`Exam '${qe.exam_name}' not found in database`);
              }
            } catch (error) {
              warnings.push(`Error looking up exam '${qe.exam_name}': ${(error as Error).message}`);
            }
          }
        }
        if (examIds.length > 0) {
          question.exam_ids = examIds;
        }
      }
    }

    return { question, warnings };
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
  private async cleanAndValidateQuestion(question: QuestionForDataTransfer): Promise<{ question: QuestionForDataTransfer; warnings: string[] }> {
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

    const fetchedQuestion = await this.db.questions.getOne({ question_text: cleanedQuestion.question_text });
    // console.log(fetchedQuestion)
    if (fetchedQuestion) {
      warnings.push(`Duplicate question found in database with ID: ${fetchedQuestion.question_id}`);
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
    });

    justificationFields.forEach(field => {
      if (!cleanedQuestion[field] || cleanedQuestion[field].trim() === '') {
        cleanedQuestion[field] = '';
        warnings.push(`${field} was missing - set to empty string`);
      }
    });

    // Clean question_exams if present
    if (cleanedQuestion.question_exams) {
      cleanedQuestion.question_exams = cleanedQuestion.question_exams.map(exam => ({
        exam_name: exam.exam_name || '',
        main_system: exam.main_system || '',
        main_ka: exam.main_ka || '',
        ka_match_justification: exam.ka_match_justification || '',
        sro_match_justification: exam.sro_match_justification || '',
        answers_order: exam.answers_order || 'ABCD'
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

  // Helper method to convert QuestionForDataTransfer to Question interface
  private async convertToQuestionInterface(questionData: QuestionForDataTransfer): Promise<Question> {
    const question: Question = {
      question_id: 0, // Will be set when saved to database
      question_text: questionData.question_text,
      img_url: questionData.img_url,
      answer_a: questionData.answer_a,
      answer_a_justification: questionData.answer_a_justification,
      answer_b: questionData.answer_b,
      answer_b_justification: questionData.answer_b_justification,
      answer_c: questionData.answer_c,
      answer_c_justification: questionData.answer_c_justification,
      answer_d: questionData.answer_d,
      answer_d_justification: questionData.answer_d_justification,
      correct_answer: questionData.correct_answer,
      exam_level: questionData.exam_level,
      cognitive_level: questionData.cognitive_level,
      technical_references: questionData.technical_references,
      references_provided: questionData.references_provided,
      objective: questionData.objective,
    };

    // Convert question_exams to ExamQuestion format if they exist
    if (questionData.question_exams && questionData.exam_ids) {
      question.question_exams = [];

      for (let i = 0; i < questionData.question_exams.length; i++) {
        const qe = questionData.question_exams[i];
        const examId = questionData.exam_ids[i]; // Corresponding exam_id if it exists

        if (examId) {
          const examQuestion: ExamQuestion = {
            exam_id: examId,
            question_id: 0, // Will be set when saved to database
            question_number: 0, // Will be set when added to exam
            main_system_ka_system: qe.main_system || null,
            main_system_ka_ka: qe.main_ka || null,
            ka_match_justification: qe.ka_match_justification || null,
            sro_match_justification: qe.sro_match_justification || null,
            answers_order: qe.answers_order || null,
          };

          question.question_exams.push(examQuestion);
        }
      }
    }

    // Get full Exam objects if exam_ids exist
    if (questionData.exam_ids && questionData.exam_ids.length > 0) {
      question.exams = [];

      for (const examId of questionData.exam_ids) {
        try {
          const exam = await this.db.exams.getById(examId);
          if (exam) {
            question.exams.push(exam);
          }
        } catch (error) {
          console.warn(`Could not load exam with ID ${examId}:`, error);
        }
      }
    }

    // Get full SystemKa objects if system_ka_numbers exist
    if (questionData.system_ka_numbers && questionData.system_ka_numbers.length > 0) {
      question.system_kas = [];

      for (const systemKaNumber of questionData.system_ka_numbers) {
        try {
          const systemKa = await this.db.system_kas.get({ system_ka_number: systemKaNumber });
          if (systemKa) {
            question.system_kas.push(systemKa);
          }
        } catch (error) {
          console.warn(`Could not load SystemKa with number ${systemKaNumber}:`, error);
        }
      }
    }

    return question;
  }

  // Updated method to get import statistics with cleaned data and database validation
  async importQuestions(): Promise<{
    questions: Question[];
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
          const { question, warnings: transformWarnings } = await this.transformToQuestion(item);
          if (question) {
            const { question: cleanedQuestion, warnings: cleanWarnings } = await this.cleanAndValidateQuestion(question);

            // Convert to Question interface for frontend
            const frontendQuestion = await this.convertToQuestionInterface(cleanedQuestion);
            questions.push(frontendQuestion);
            successfullyProcessed++;

            // Combine warnings from transform and clean operations
            const allQuestionWarnings = [...transformWarnings, ...cleanWarnings];
            if (allQuestionWarnings.length > 0) {
              allWarnings.push({
                questionNumber: totalProcessed,
                msgs: allQuestionWarnings
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