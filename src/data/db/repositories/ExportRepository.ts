import { dialog } from 'electron';
import * as fs from 'fs';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
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

  async exportQuestions(questionIds: number[], defaultFileName?: string): Promise<QuestionsExportResponse> {
    try {
      // Get question data
      const questions = await Promise.all(
        questionIds.map(id => this.db.questionService.getQuestionForExport(id))
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

  async exportDocx({ questionIds, examId, templatePath }: { questionIds: number[]; examId?: number; templatePath?: string }): Promise<QuestionsExportResponse> {
    try {
      // Step 1: Read template file once (consider caching this)
      const resolvedTemplatePath = templatePath ?? '/Users/noah/Desktop/Projects/Davis_Besse_2025/nrc-exam-manager/src/resources/default-questions-template.docx';
      const content = fs.readFileSync(resolvedTemplatePath, 'binary');

      // Step 2: Load the template
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip);

      // Step 3: Fetch data in parallel
      const [questions, exam] = await Promise.all([
        Promise.all(questionIds.map(id => this.db.questionService.getQuestionForExport(id))),
        examId ? this.db.exams.getById(examId) : Promise.resolve(null)
      ]);

      const examName = exam?.name || '';

      // Step 4: Create efficient answer reordering system
      const createAnswersData = (question: QuestionForDataTransfer, answersOrder = 'ABCD') => {
        // Map from original positions to new positions
        const orderMap = {
          A: answersOrder.indexOf('A'),
          B: answersOrder.indexOf('B'),
          C: answersOrder.indexOf('C'),
          D: answersOrder.indexOf('D')
        };

        // Create reverse mapping for correct answer translation
        const reverseMap: Record<number, string> = {
          0: 'A', 1: 'B', 2: 'C', 3: 'D'
        };

        // Original answers and justifications in ABCD order
        const originalAnswers = [
          question.answer_a,
          question.answer_b,
          question.answer_c,
          question.answer_d
        ];

        const originalJustifications = [
          question.answer_a_justification,
          question.answer_b_justification,
          question.answer_c_justification,
          question.answer_d_justification
        ];

        // Reorder according to the specified order
        const reorderedAnswers = new Array(4);
        const reorderedJustifications = new Array(4);

        // Place each original answer in its new position
        Object.entries(orderMap).forEach(([originalLetter, newPosition]) => {
          const originalIndex = originalLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          reorderedAnswers[newPosition] = originalAnswers[originalIndex];
          reorderedJustifications[newPosition] = originalJustifications[originalIndex];
        });

        // Translate correct answer
        // const originalCorrectIndex = question.correct_answer.charCodeAt(0) - 65;
        const newCorrectIndex = orderMap[question.correct_answer as 'A' | 'B' | 'C' | 'D'];
        const newCorrectAnswer = reverseMap[newCorrectIndex];

        return {
          answer_a: reorderedAnswers[0],
          answer_b: reorderedAnswers[1],
          answer_c: reorderedAnswers[2],
          answer_d: reorderedAnswers[3],
          answer_a_justification: reorderedJustifications[0],
          answer_b_justification: reorderedJustifications[1],
          answer_c_justification: reorderedJustifications[2],
          answer_d_justification: reorderedJustifications[3],
          correct_answer: newCorrectAnswer
        };
      };

      const createBaseQuestionData = (question: QuestionForDataTransfer) => ({
        question_text: question.question_text,
        exam_level: question.exam_level ? 'SRO' : 'RO',
        cognitive_level: question.cognitive_level ? 'HIGH' : 'LOW',
        technical_references: question.technical_references,
        references_provided: question.references_provided,
        objective: question.objective,
        related_system_kas: question.question_exams?.map((qe) => `${qe.main_system}_${qe.main_ka}`) || [],
        related_exams: question.question_exams?.map((qe) => ({
          exam_name: qe.exam_name,
          question_number: qe.question_number
        })) || []
      });

      // Step 5: Process questions efficiently
      let processedQuestions;
      let examName_final;

      if (examId && exam) {
        // Process questions for specific exam
        processedQuestions = questions.map(question => {
          const examData = question.question_exams?.find((qe) => qe.exam_id === examId);
          const answersData = createAnswersData(question, examData?.answers_order);

          return {
            ...createBaseQuestionData(question),
            ...answersData,
            system_number: examData?.main_system,
            ka_number: examData?.main_ka,
            ka_match_justification: examData?.ka_match_justification,
            sro_match_justification: examData?.sro_match_justification,
            question_number: examData?.question_number,
          };
        });
        examName_final = examName;
      } else {
        // Process questions without specific exam
        processedQuestions = questions.map((question, idx) => ({
          ...createBaseQuestionData(question),
          ...createAnswersData(question), // Uses default ABCD order
          question_number: idx + 1,
        }));
        examName_final = `${questions.length} NEM Questions`;
      }

      // Step 6: Render the document
      doc.render({
        questions: processedQuestions.sort((a, b) => (a.question_number ?? 0) - (b.question_number ?? 0)),
        examName: examName_final,
        isExam: examId ? true : false,
      });

      // Step 7: Generate buffer
      const buffer = doc.getZip().generate({ type: 'nodebuffer' });

      // Step 8: Handle file saving
      const fileName = `${questions.length}_NEM_questions_${new Date().toISOString().split('T')[0]}.docx`;

      const filePath = await this.saveFileDialog(fileName, [
        { name: 'Word Documents', extensions: ['docx'] },
        { name: 'All Files', extensions: ['*'] }
      ]);

      if (!filePath) {
        return { success: false, error: 'Docx generation cancelled by user' };
      }

      // Write file
      fs.writeFileSync(filePath, buffer);

      return { success: true, filePath };

    } catch (error) {
      return { success: false, error: `Failed to generate docx file: ${(error as Error).message}` };
    }
  }
}