// db/repositories/ExamRepository.ts
import sqlite3 from 'sqlite3';

export class ExamRepository {
    constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

    async add(exam: Exam): Promise<number> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            this.db.run(
                'INSERT INTO exams (name, plant_id) VALUES (?, ?)',
                [exam.name, exam.plant_id],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    async getAll(): Promise<Exam[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            // SQL query to join exams with plants
            const query = `
      SELECT 
        e.*,
        p.plant_id AS plant_plant_id,
        p.name AS plant_name
      FROM exams e
      LEFT JOIN plants p ON e.plant_id = p.plant_id
    `;

            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Transform the flat rows into nested objects
                    const exams = rows.map((row: any) => {
                        // Extract exam fields
                        const exam: any = {
                            exam_id: row.exam_id,
                            name: row.name,
                            // Add other exam fields
                            plant_id: row.plant_id,
                            // Create nested plant object
                            plant: row.plant_plant_id ? {
                                plant_id: row.plant_plant_id,
                                name: row.plant_name,
                                // Add other plant fields
                            } : undefined
                        };
                        return exam;
                    });

                    resolve(exams);
                }
            });
        });
    }

    async getById(examId: number): Promise<Exam> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            // SQL query to join exams with plants
            const query = `
      SELECT 
        e.*,
        p.plant_id AS plant_plant_id,
        p.name AS plant_name
      FROM exams e
      LEFT JOIN plants p ON e.plant_id = p.plant_id
      WHERE exam_id = ?
    `;

            this.db.all(query, [examId], (err, rows) => {
                if (err) {
                    reject(err);
                } else if (!rows || rows.length === 0) {
                    reject(new Error('Exam not found'));
                } else {
                    // Extract the first row as the exam
                    const row: any = rows[0];
                    const exam: any = {
                        exam_id: row.exam_id,
                        name: row.name,
                        // Add other exam fields
                        plant_id: row.plant_id,
                        // Create nested plant object
                        plant: row.plant_plant_id ? {
                            plant_id: row.plant_plant_id,
                            name: row.plant_name,
                            // Add other plant fields
                        } : null
                    };
                    resolve(exam);
                }
            });
        });
    }

    async getByQuestionId(questionId: number): Promise<Exam[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            const query = `
      SELECT e.exam_id, e.name, e.plant_id 
      FROM exams e
      INNER JOIN exam_questions eq ON e.exam_id = eq.exam_id
      WHERE eq.question_id = ?
      ORDER BY e.exam_id
    `;

            this.db.all(query, [questionId], (err, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const exams = rows.map(row => ({
                        exam_id: row.exam_id,
                        name: row.name,
                        plant_id: row.plant_id,
                    }));
                    resolve(exams);
                }
            });
        });
    }

    async update(exam: Exam): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error("Database is closing"));
                return;
            }

            if (!exam.exam_id) {
                reject(new Error('Exam ID is required for update'));
                return;
            }
            if (!exam.plant_id) {
                reject(new Error('Plant ID is required for update'));
                return;
            }

            this.db.run(
                'UPDATE exams SET (name, plant_id) = (?, ?) WHERE exam_id = ?',
                [exam.name, exam.plant_id, exam.exam_id],
                function (err) {
                    if (err) {
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Exam not found'));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async delete(examId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error("Database is closing"));
                return;
            }

            this.db.run(
                'DELETE FROM exams WHERE exam_id = ?',
                [examId],
                function (err) {
                    if (err) {
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Exam not found'));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }


    async removeQuestion(examId: number, questionId: number): Promise<void> {
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
                    } else if (this.changes === 0) { // `this` here refers to the Statement, NOT your class
                        reject(new Error('Exam question not found'));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }




}