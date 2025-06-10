import { dialog } from 'electron';
import * as fs from 'fs';
import { Database } from '../database';

export class ExportRepository {
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

  async exportQuestions(questionIds: number[], defaultFileName?: string): Promise<QuestionsExportResponse> {
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