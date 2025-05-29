// db/repositories/QuestionRepository.ts
import sqlite3 from 'sqlite3';
import { ExamRepository } from './ExamRepository';

export class QuestionRepository {
    constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

    async add(question: Question): Promise<number> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            const self = this;
            this.db.serialize(() => {
                self.db.run('BEGIN TRANSACTION');

                self.db.run(
                    'INSERT INTO questions (question_text, category, exam_level, technical_references, difficulty_level, cognitive_level, objective, last_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        question.question_text,
                        question.category,
                        question.exam_level,
                        question.technical_references,
                        question.difficulty_level,
                        question.cognitive_level,
                        question.objective,
                        question.last_used
                    ],
                    function (err) {
                        if (err) {
                            self.db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        const questionId = this.lastID;
                        const insertOperations: Promise<void>[] = [];

                        // Handle exam relationships
                        if (question.exams?.length) {
                            const examPromise = new Promise<void>((resolveExam, rejectExam) => {
                                const placeholders = question.exams!.map(() => '(?, ?)').join(', ');
                                const values: any[] = [];

                                question.exams!.forEach(exam => {
                                    values.push(exam.exam_id, questionId);
                                });

                                self.db.run(
                                    `INSERT INTO exam_questions (exam_id, question_id) VALUES ${placeholders}`,
                                    values,
                                    (examErr) => {
                                        if (examErr) rejectExam(examErr);
                                        else resolveExam();
                                    }
                                );
                            });
                            insertOperations.push(examPromise);
                        }

                        // handle answers
                        if (question.answers?.length) {
                            const answerPromise = new Promise<void>((resolveAnswer, rejectAnswer) => {
                                const placeholders = question.answers!.map(() => '(?, ?, ?, ?, ?)').join(', ');
                                const values: any[] = [];

                                question.answers!.forEach(answer => {
                                    values.push(
                                        questionId,
                                        answer.answer_text,
                                        answer.is_correct ? 1 : 0,
                                        answer.justification,
                                        answer.option
                                    );
                                });

                                self.db.run(
                                    `INSERT INTO answers (question_id, answer_text, is_correct, justification, option) VALUES ${placeholders}`,
                                    values,
                                    (answerErr) => {
                                        if (answerErr) rejectAnswer(answerErr);
                                        else resolveAnswer();
                                    }
                                );
                            });
                            insertOperations.push(answerPromise);
                        }

                        Promise.all(insertOperations).then(() => {
                            self.db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    reject(commitErr);
                                } else {
                                    resolve(questionId)
                                }
                            });
                        })
                            .catch((insertErr) => {
                                self.db.run('ROLLBACK');
                                reject(insertErr)
                            });
                    }
                );
            });
        });
    }

    async getAll(): Promise<Question[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            this.db.all('SELECT * FROM questions', [], (err, rows: Question[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getByExamId(examId: number): Promise<Question[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            const query = `
            SELECT q.* 
            FROM questions q
            INNER JOIN exam_questions eq ON q.question_id = eq.question_id
            WHERE eq.exam_id = ?
        `;

            this.db.all(query, [examId], (err, rows: Question[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Individual query functions
    async getById(questionId: number): Promise<Question> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            const query = 'SELECT * FROM questions WHERE question_id = ?';

            this.db.get(query, [questionId], (err, row: Question) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error(`Question with ID ${questionId} not found`));
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            const query = 'SELECT * FROM answers WHERE question_id = ? ORDER BY answer_id';

            this.db.all(query, [questionId], (err, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const answers: Answer[] = rows.map(row => ({
                        answer_id: row.answer_id,
                        question_id: row.question_id,
                        answer_text: row.answer_text,
                        is_correct: row.is_correct,
                        option: row.option,
                        justification: row.justification
                    }));
                    resolve(answers);
                }
            });
        });
    }

    async update(question: Question): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error("Database is closing"));
                return;
            }

            if (!question.question_id) {
                reject(new Error('Question ID is required for update'));
                return;
            }

            this.db.run(
                'UPDATE questions SET (question_text) = (?) WHERE question_id = ?',
                [question.question_text, question.question_id],
                function (err) {
                    if (err) {
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Question not found'));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async delete(questionId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error("Database is closing"));
                return;
            }

            this.db.run(
                'DELETE FROM questions WHERE question_id = ?',
                [questionId],
                function (err) {
                    if (err) {
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Question not found'));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

}