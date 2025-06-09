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

  async importJson(): Promise<any[] | { success: boolean; error: string }> {
    const filePaths = await this.openFileDialog([
      { name: 'JSON Files', extensions: ['json'] }
    ], true);

    if (filePaths && filePaths.length) {
      try {
        const results = filePaths.map(filepath => {
          const content = fs.readFileSync(filepath, 'utf-8');
          return JSON.parse(content);
        });

        return results;
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }

    return { success: false, error: 'No file selected' };
  }

  async importCSV(): Promise<any[] | { success: boolean; error: string }> {
    const csvFilePaths = await this.openFileDialog([
      { name: 'CSV Files', extensions: ['csv'] }
    ], true);

    if (csvFilePaths && csvFilePaths.length) {
      try {
        return csvFilePaths.map(filepath => {
          return fs.readFileSync(filepath, 'utf-8');
        })
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }

    return { success: false, error: 'No file selected' };
  }

  async importXLSX(): Promise<any> {
    const filePaths = await this.openFileDialog(
      [{ name: 'XLSX Files', extensions: ['xlsx'] }],
      false
    );

    if (filePaths && filePaths.length > 0) {
      const filePath = filePaths[0];
      try {
        // Verify file exists and is readable
        if (!fs.existsSync(filePath)) {
          return { success: false, error: `File does not exist: ${filePath}` };
        }
        // Check file permissions
        try {
          fs.accessSync(filePath, fs.constants.R_OK);
        } catch (permError) {
          return { success: false, error: `Permission denied for file: ${filePath}` };
        }
        // Attempt to read the file with xlsx
        const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
        // Convert the first sheet to JSON array
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        return data;
      } catch (error) {
        return { success: false, error: `Failed to read XLSX file: ${filePath}, Error: ${(error as Error).message}` };
      }

    }
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