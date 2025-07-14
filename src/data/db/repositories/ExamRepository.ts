// db/repositories/ExamRepository.ts
import sqlite3 from 'sqlite3';

interface ExamDbRow {
    exam_id: number;
    name: string;
    plant_id: number;
    nrc_url?: string;
    pdf_url?: string;
    plant_plant_id?: number;
    plant_name?: string;
}

export class ExamRepository {
    constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

    async add(exam: Exam): Promise<number> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            this.db.run(
                'INSERT INTO exams (name, plant_id, nrc_url, pdf_url) VALUES (?, ?, ?, ?)',
                [exam.name, exam.plant_id, exam.nrc_url, exam.pdf_url],
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

    async getMany(params?: DBSearchParams): Promise<Exam[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            // Build WHERE clause dynamically
            const keys = Object.keys(params || {});
            const values = Object.values(params || {});

            // SQL query to join exams with plants
            let sql = `
                SELECT 
                    e.*,
                    p.plant_id AS plant_plant_id,
                    p.name AS plant_name
                FROM exams e
                LEFT JOIN plants p ON e.plant_id = p.plant_id
            `;

            if (keys.length > 0) {
                const conditions = keys.map(key => `e.${key} = ?`).join(' AND ');
                sql += ` WHERE ${conditions}`;
            }

            this.db.all(sql, values, (err, rows: ExamDbRow[]) => {
                if (err) {
                    reject(err);
                } else {
                    // Transform the flat rows into nested objects
                    const exams = rows.map((row) => {
                        const exam: Exam = {
                            exam_id: row.exam_id,
                            name: row.name,
                            plant_id: row.plant_id,
                            nrc_url: row.nrc_url,
                            pdf_url: row.pdf_url,
                            // Create nested plant object
                            plant: row.plant_plant_id ? {
                                plant_id: row.plant_plant_id,
                                name: row.plant_name ?? "",
                            } : undefined
                        };
                        return exam;
                    });

                    resolve(exams);
                }
            });
        });
    }

    async get(params: DBSearchParams): Promise<Exam> {
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

            const conditions = keys.map(key => `e.${key} = ?`).join(' AND ');

            // SQL query to join exams with plants
            const sql = `
                SELECT 
                    e.*,
                    p.plant_id AS plant_plant_id,
                    p.name AS plant_name
                FROM exams e
                LEFT JOIN plants p ON e.plant_id = p.plant_id
                WHERE ${conditions}
            `;

            this.db.get(sql, values, (err, row: ExamDbRow) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Exam not found'));
                } else {
                    const exam: Exam = {
                        exam_id: row.exam_id,
                        name: row.name,
                        plant_id: row.plant_id,
                        nrc_url: row.nrc_url,
                        pdf_url: row.pdf_url,
                        // Create nested plant object
                        plant: row.plant_plant_id ? {
                            plant_id: row.plant_plant_id,
                            name: row.plant_name ?? "",
                        } : undefined
                    };
                    resolve(exam);
                }
            });
        });
    }

    // Keep the original getAll method for backward compatibility
    async getAll(): Promise<Exam[]> {
        return this.getMany();
    }

    // Keep the original getById method for backward compatibility
    async getById(examId: number): Promise<Exam> {
        return this.get({ exam_id: examId });
    }

    async getByQuestionId(questionId: number): Promise<Exam[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            const query = `
                SELECT e.exam_id, e.name, e.plant_id, e.nrc_url, e.pdf_url
                FROM exams e
                INNER JOIN exam_questions eq ON e.exam_id = eq.exam_id
                WHERE eq.question_id = ?
                ORDER BY e.exam_id
            `;

            this.db.all(query, [questionId], (err, rows: ExamDbRow[]) => {
                if (err) {
                    reject(err);
                } else {
                    const exams = rows.map(row => ({
                        exam_id: row.exam_id,
                        name: row.name,
                        plant_id: row.plant_id,
                        nrc_url: row.nrc_url,
                        pdf_url: row.pdf_url,
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
                'UPDATE exams SET name = ?, plant_id = ?, nrc_url = ?, pdf_url = ? WHERE exam_id = ?',
                [exam.name, exam.plant_id, exam.nrc_url, exam.pdf_url, exam.exam_id],
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
                    } else if (this.changes === 0) {
                        reject(new Error('Exam question not found'));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async addQuestionToExam(examId: number, questionId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error("Database is closing"));
                return;
            }

            this.db.run(
                'INSERT INTO exam_questions (exam_id, question_id) VALUES (?, ?)',
                [examId, questionId],
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
}