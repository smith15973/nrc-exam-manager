// db/repositories/PlantRepository.ts
import sqlite3 from 'sqlite3';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Database } from '../database';

export class ImportExportRepository {
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

  // Specific method for importing questions (backward compatibility)
  async importQuestions(): Promise<any[] | { success: boolean; error: string }> {
    const result = await this.importFilesSimple(true);
    console.log(result)
    return result;
  }

  async exportExamJson(examId: number, defaultFileName?: string): Promise<{ success: boolean; error?: string; filePath?: string }> {
    try {
      // Get exam data
      const exam = await this.db.exams.getById(examId);
      exam.questions = await this.db.questionService.getQuestionsByExam(examId);

      // Show save dialog
      const fileName = defaultFileName || `exam_${exam.name}_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = await this.saveFileDialog(fileName, [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]);

      if (!filePath) {
        return { success: false, error: 'Export cancelled by user' };
      }

      // Write file
      fs.writeFileSync(filePath, JSON.stringify(exam, null, 2), 'utf-8');

      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: `Failed to export exam: ${(error as Error).message}` };
    }
  }

}