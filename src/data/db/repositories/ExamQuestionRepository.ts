// db/repositories/ExamQuestionRepository.ts
import sqlite3 from 'sqlite3';

export class ExamQuestionRepository {
  constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

  async add(examQuestion: ExamQuestion): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      console.log("examQuestion", examQuestion);

      this.db.run(
        `INSERT INTO exam_questions (
          exam_id, 
          question_id, 
          question_number, 
          main_system_ka_system, 
          main_system_ka_ka, 
          ka_match_justification, 
          sro_match_justification, 
          answers_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          examQuestion.exam_id,
          examQuestion.question_id,
          examQuestion.question_number,
          examQuestion.main_system_ka_system,
          examQuestion.main_system_ka_ka,
          examQuestion.ka_match_justification,
          examQuestion.sro_match_justification,
          examQuestion.answers_order
        ],
        function (err) {
          if (err) {
            reject(err);
            console.error(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getMany(params?: DBSearchParams): Promise<ExamQuestion[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      // Build WHERE clause dynamically
      const keys = Object.keys(params || {});
      const values = Object.values(params || {});

      let sql = 'SELECT * FROM exam_questions';
      if (keys.length > 0) {
        const conditions = keys.map(key => `${key} = ?`).join(' AND ');
        sql += ` WHERE ${conditions}`;
      }
      sql += ' ORDER BY question_number';

      this.db.all(sql, values, (err, rows: ExamQuestion[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async get(params: DBSearchParams): Promise<ExamQuestion> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      const keys = Object.keys(params || {});
      const values = Object.values(params || {});

      if (keys.length === 0) {
        reject(new Error("No search parameters provided"));
        return;
      }

      const conditions = keys.map(key => `${key} = ?`).join(' AND ');
      const sql = `SELECT * FROM exam_questions WHERE ${conditions}`;

      this.db.get(sql, values, (err, row: ExamQuestion) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('ExamQuestion not found'));
        } else {
          resolve(row);
        }
      });
    });
  }

  async getWithDetails(params?: DBSearchParams): Promise<ExamQuestion[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const keys = Object.keys(params || {});
      const values = Object.values(params || {});

      let whereClause = '';
      if (keys.length > 0) {
        const conditions = keys.map(key => `eq.${key} = ?`).join(' AND ');
        whereClause = ` WHERE ${conditions}`;
      }

      const query = `
        SELECT 
          eq.exam_id,
          eq.question_id,
          eq.question_number,
          eq.main_system_ka_system,
          eq.main_system_ka_ka,
          eq.ka_match_justification,
          eq.sro_match_justification,
          eq.answers_order,
          q.question_text,
          q.img_url,
          q.answer_a,
          q.answer_a_justification,
          q.answer_b,
          q.answer_b_justification,
          q.answer_c,
          q.answer_c_justification,
          q.answer_d,
          q.answer_d_justification,
          q.correct_answer,
          q.exam_level,
          q.cognitive_level,
          q.technical_references,
          q.references_provided,
          q.objective,
          q.last_used,
          e.name as exam_name,
          e.plant_id
        FROM exam_questions eq
        INNER JOIN questions q ON eq.question_id = q.question_id
        INNER JOIN exams e ON eq.exam_id = e.exam_id
        ${whereClause}
        ORDER BY eq.question_number
      `;

      this.db.all(query, values, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const examQuestions: ExamQuestion[] = rows.map(row => ({
            exam_id: row.exam_id,
            question_id: row.question_id,
            question_number: row.question_number,
            main_system_ka_system: row.main_system_ka_system,
            main_system_ka_ka: row.main_system_ka_ka,
            ka_match_justification: row.ka_match_justification,
            sro_match_justification: row.sro_match_justification,
            answers_order: row.answers_order,
            exam: {
              exam_id: row.exam_id,
              name: row.exam_name,
              plant_id: row.plant_id
            },
            question: {
              question_id: row.question_id,
              question_text: row.question_text,
              img_url: row.img_url,
              answer_a: row.answer_a,
              answer_a_justification: row.answer_a_justification,
              answer_b: row.answer_b,
              answer_b_justification: row.answer_b_justification,
              answer_c: row.answer_c,
              answer_c_justification: row.answer_c_justification,
              answer_d: row.answer_d,
              answer_d_justification: row.answer_d_justification,
              correct_answer: row.correct_answer,
              exam_level: row.exam_level,
              cognitive_level: row.cognitive_level,
              technical_references: row.technical_references,
              references_provided: row.references_provided,
              objective: row.objective,
              last_used: row.last_used
            }
          }));
          resolve(examQuestions);
        }
      });
    });
  }

  async update(examQuestion: ExamQuestion): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!examQuestion.exam_id) {
        reject(new Error('Exam ID is required for update'));
        return;
      }
      if (!examQuestion.question_id) {
        reject(new Error('Question ID is required for update'));
        return;
      }

      this.db.run(
        `UPDATE exam_questions SET
          question_number = ?, 
          main_system_ka_system = ?, 
          main_system_ka_ka = ?, 
          ka_match_justification = ?, 
          sro_match_justification = ?, 
          answers_order = ?
         WHERE exam_id = ? AND question_id = ?`,
        [
          examQuestion.question_number,
          examQuestion.main_system_ka_system,
          examQuestion.main_system_ka_ka,
          examQuestion.ka_match_justification,
          examQuestion.sro_match_justification,
          examQuestion.answers_order,
          examQuestion.exam_id,
          examQuestion.question_id
        ],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('ExamQuestion not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async delete(examId: number, questionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM exam_questions WHERE exam_id = ? AND question_id = ?',
        [examId, questionId],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('ExamQuestion not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getByExamId(examId: number): Promise<ExamQuestion[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
        SELECT * FROM exam_questions 
        WHERE exam_id = ? 
        ORDER BY question_number
      `;

      this.db.all(query, [examId], (err, rows: ExamQuestion[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getByQuestionId(questionId: number): Promise<ExamQuestion[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
        SELECT * FROM exam_questions 
        WHERE question_id = ? 
        ORDER BY question_number
      `;

      this.db.all(query, [questionId], (err, rows: ExamQuestion[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}