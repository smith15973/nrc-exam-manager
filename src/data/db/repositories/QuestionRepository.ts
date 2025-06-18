// db/repositories/QuestionRepository.ts
import sqlite3 from 'sqlite3';

export class QuestionRepository {
    constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

    async add(question: Question): Promise<number> {
        if (this.isClosing()) {
            throw new Error('Database is closing');
        }

        // Check for duplicates first
        if (question.question_id) {
            try {
                const existing = await this.getById(question.question_id);
                if (existing && this.isDuplicate(existing, question)) {
                    console.log("Duplicate question found, skipping");
                    return existing.question_id!;
                }
            } catch (error) {
                // Question doesn't exist, continue with insertion
            }
        }

        // Also check by text/content hash to catch duplicates with different IDs
        const existingByContent = await this.findByContentHash(question);
        if (existingByContent) {
            console.log("Duplicate question content found, skipping");
            return existingByContent.question_id!;
        }



        return this.insertQuestion(question);
    }


    async addBatch(questions: Question[]): Promise<{ inserted: number[], ignored: number[] }> {
        const self = this;
        const results = {
            inserted: [] as number[],
            ignored: [] as number[]
        };

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                let processed = 0;
                let transactionActive = true; // Track transaction state
                const total = questions.length;

                const finishTransaction = (success: boolean, error?: any) => {
                    if (!transactionActive) return; // Prevent double transaction operations

                    transactionActive = false;
                    if (success) {
                        self.db.run('COMMIT', (commitErr) => {
                            if (commitErr) reject(commitErr);
                            else resolve(results);
                        });
                    } else {
                        self.db.run('ROLLBACK', (rollbackErr) => {
                            // Ignore rollback errors if transaction is already inactive
                            reject(error || rollbackErr);
                        });
                    }
                };

                const processQuestion = async (question: Question, index: number) => {
                    try {
                        if (this.isClosing()) {
                            throw new Error('Database is closing');
                        }

                        // Insert the question with all relations - same as single add
                        this.db.run(
                            `INSERT INTO questions 
                         (question_text, category, exam_level, technical_references, 
                          difficulty_level, cognitive_level, objective, last_used) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
                            function (this: sqlite3.RunResult, err: any) {
                                if (err) {
                                    console.log("THERE IS AN ERROR1", err);
                                    finishTransaction(false, err);
                                    return;
                                }

                                const questionId = this.lastID;

                                // Insert all relations - same logic as single add
                                const insertOperations = [
                                    question.exams?.length ? QuestionRepository.prototype.insertExamRelations.call({ db: self.db }, questionId, question.exams) : Promise.resolve(),
                                    question.answers?.length ? QuestionRepository.prototype.insertAnswers.call({ db: self.db }, questionId, question.answers) : Promise.resolve(),
                                    question.kas?.length ? QuestionRepository.prototype.insertKaRelations.call({ db: self.db }, questionId, question.kas) : Promise.resolve(),
                                    question.systems?.length ? QuestionRepository.prototype.insertSystemRelations.call({ db: self.db }, questionId, question.systems) : Promise.resolve()
                                ].filter(p => p !== Promise.resolve());

                                Promise.all(insertOperations)
                                    .then(() => {
                                        results.inserted.push(questionId);
                                        processed++;

                                        if (processed === total) {
                                            finishTransaction(true);
                                        }
                                    })
                                    .catch((insertErr) => {
                                        console.log("THERE IS AN ERROR2", insertErr); // Fixed: was logging 'err' instead of 'insertErr'
                                        finishTransaction(false, insertErr);
                                    });
                            }
                        );

                    } catch (error) {
                        console.log("THERE IS AN ERROR3", error);
                        finishTransaction(false, error);
                    }
                };

                // Process all questions
                questions.forEach((question, index) => {
                    processQuestion(question, index);
                });
            });
        });
    }

    private isDuplicate(existing: Question, newQuestion: Question): boolean {
        return existing.question_text === newQuestion.question_text &&
            existing.category === newQuestion.category &&
            existing.exam_level === newQuestion.exam_level;
        // Add other fields as needed for your duplicate definition
    }

    private async findByContentHash(question: Question): Promise<Question | null> {
        // Create a hash or use key fields to find potential duplicates
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM questions WHERE question_text = ? AND category = ?',
                [question.question_text, question.category],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row as Question || null);
                }
            );
        });
    }


    async insertQuestion(question: Question): Promise<number> {
        return new Promise((resolve, reject) => {
            const db = this.db;
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(
                    `INSERT INTO questions 
                 (question_text, category, exam_level, technical_references, 
                  difficulty_level, cognitive_level, objective, last_used) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        const questionId = this.lastID;

                        // Use Promise.all with proper error handling
                        const insertOperations = [
                            question.exams?.length ? QuestionRepository.prototype.insertExamRelations.call({ db }, questionId, question.exams) : Promise.resolve(),
                            question.answers?.length ? QuestionRepository.prototype.insertAnswers.call({ db }, questionId, question.answers) : Promise.resolve(),
                            question.kas?.length ? QuestionRepository.prototype.insertKaRelations.call({ db }, questionId, question.kas) : Promise.resolve(),
                            question.systems?.length ? QuestionRepository.prototype.insertSystemRelations.call({ db }, questionId, question.systems) : Promise.resolve()
                        ].filter(p => p !== Promise.resolve()); // Remove empty promises

                        Promise.all(insertOperations)
                            .then(() => {
                                db.run('COMMIT', (commitErr) => {
                                    if (commitErr) reject(commitErr);
                                    else resolve(questionId);
                                });
                            })
                            .catch((insertErr) => {
                                db.run('ROLLBACK');
                                reject(insertErr);
                            });
                    }
                );
            });
        });
    }

    // Extract repetitive insertion logic into separate methods
    insertExamRelations(questionId: number, exams: Exam[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const placeholders = exams.map(() => '(?, ?)').join(', ');
            const values = exams.flatMap(exam => [exam.exam_id, questionId]);

            this.db.run(
                `INSERT INTO exam_questions (exam_id, question_id) VALUES ${placeholders}`,
                values,
                (err) => err ? reject(err) : resolve()
            );
        });
    }

    insertAnswers(questionId: number, answers: Answer[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const placeholders = answers.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const values = answers.flatMap(answer => [
                questionId,
                answer.answer_text,
                answer.is_correct ? 1 : 0,
                answer.justification,
                answer.option
            ]);

            this.db.run(
                `INSERT INTO answers (question_id, answer_text, is_correct, justification, option) VALUES ${placeholders}`,
                values,
                (err) => err ? reject(err) : resolve()
            );
        });
    }

    insertKaRelations(questionId: number, kas: Ka[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const placeholders = kas.map(() => '(?, ?)').join(', ');
            const values = kas.flatMap(ka => [questionId, ka.ka_number]);

            this.db.run(
                `INSERT INTO question_kas (question_id, ka_number) VALUES ${placeholders}`,
                values,
                (err) => err ? reject(err) : resolve()
            );
        });
    }

    insertSystemRelations(questionId: number, systems: System[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const placeholders = systems.map(() => '(?, ?)').join(', ');
            const values = systems.flatMap(system => [questionId, system.number]);

            this.db.run(
                `INSERT INTO question_systems (question_id, system_number) VALUES ${placeholders}`,
                values,
                (err) => err ? reject(err) : resolve()
            );
        });
    }


    async getOne(filters?: QuestionFilters): Promise<Question | null> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            console.log("IN THE SQL getOne", filters);

            // Build the base query
            let query = 'SELECT * FROM questions';
            const conditions: string[] = [];
            const params: any[] = [];

            // Apply filters if provided
            if (filters) {
                filters.query = filters.query?.trim() || '';

                // Text search in question_text
                if (filters.query) {
                    conditions.push('question_text LIKE ?');
                    params.push(`%${filters.query}%`);
                }

                // Date range filters
                if (filters.lastUsedStart) {
                    conditions.push('last_used >= ?');
                    params.push(filters.lastUsedStart);
                }
                if (filters.lastUsedEnd) {
                    conditions.push('last_used <= ?');
                    params.push(filters.lastUsedEnd);
                }

                // Exam level filters
                if (filters.examLevelStart) {
                    conditions.push('exam_level >= ?');
                    params.push(filters.examLevelStart);
                }
                if (filters.examLevelEnd) {
                    conditions.push('exam_level <= ?');
                    params.push(filters.examLevelEnd);
                }

                // Difficulty level filters
                if (filters.diffLevelStart) {
                    conditions.push('difficulty_level >= ?');
                    params.push(parseInt(filters.diffLevelStart));
                }
                if (filters.diffLevelEnd) {
                    conditions.push('difficulty_level <= ?');
                    params.push(parseInt(filters.diffLevelEnd));
                }

                // Cognitive level filters
                if (filters.cogLevelStart) {
                    conditions.push('cognitive_level >= ?');
                    params.push(filters.cogLevelStart);
                }
                if (filters.cogLevelEnd) {
                    conditions.push('cognitive_level <= ?');
                    params.push(filters.cogLevelEnd);
                }

                // Objective filter
                if (filters.objective) {
                    conditions.push('objective LIKE ?');
                    params.push(`%${filters.objective}%`);
                }

                // Handle relationship-based filters (requires JOINs)
                if (filters.examIds && filters.examIds.length > 0) {
                    const placeholders = filters.examIds.map(() => '?').join(',');
                    conditions.push(`question_id IN (
                    SELECT question_id FROM exam_questions
                    WHERE exam_id IN (${placeholders})
                )`);
                    params.push(...filters.examIds);
                }

                if (filters.kaNums && filters.kaNums.length > 0) {
                    const placeholders = filters.kaNums.map(() => '?').join(',');
                    conditions.push(`question_id IN (
                    SELECT question_id FROM question_kas 
                    WHERE ka_number IN (${placeholders})
                )`);
                    params.push(...filters.kaNums);
                }

                if (filters.systemNums && filters.systemNums.length > 0) {
                    const placeholders = filters.systemNums.map(() => '?').join(',');
                    conditions.push(`question_id IN (
                    SELECT question_id FROM question_systems 
                    WHERE system_number IN (${placeholders})
                )`);
                    params.push(...filters.systemNums);
                }
            }

            // Add WHERE clause if there are conditions
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            // Add LIMIT 1 for single record retrieval
            query += ' LIMIT 1';

            // Execute the query using db.get() instead of db.all()
            this.db.get(query, params, (err, row: Question | undefined) => {
                if (err) {
                    reject(err);
                } else {
                    // Return null if no record found, otherwise return the question
                    resolve(row || null);
                }
            });
        });
    }

    async getMany(filters?: QuestionFilters): Promise<Question[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            console.log("IN THE SQL", filters)

            // Build the base query
            let query = 'SELECT * FROM questions';
            const conditions: string[] = [];
            const params: any[] = [];

            // Apply filters if provided
            if (filters) {
                filters.query = filters.query?.trim() || '';

                // Text search in question_text
                if (filters.query) {
                    conditions.push('question_text LIKE ?');
                    params.push(`%${filters.query}%`);
                }

                // Date range filters
                if (filters.lastUsedStart) {
                    conditions.push('last_used >= ?');
                    params.push(filters.lastUsedStart);
                }
                if (filters.lastUsedEnd) {
                    conditions.push('last_used <= ?');
                    params.push(filters.lastUsedEnd);
                }

                // Exam level filters
                if (filters.examLevelStart) {
                    conditions.push('exam_level >= ?');
                    params.push(filters.examLevelStart);
                }
                if (filters.examLevelEnd) {
                    conditions.push('exam_level <= ?');
                    params.push(filters.examLevelEnd);
                }

                // Difficulty level filters
                if (filters.diffLevelStart) {
                    conditions.push('difficulty_level >= ?');
                    params.push(parseInt(filters.diffLevelStart));
                }
                if (filters.diffLevelEnd) {
                    conditions.push('difficulty_level <= ?');
                    params.push(parseInt(filters.diffLevelEnd));
                }

                // Cognitive level filters
                if (filters.cogLevelStart) {
                    conditions.push('cognitive_level >= ?');
                    params.push(filters.cogLevelStart);
                }
                if (filters.cogLevelEnd) {
                    conditions.push('cognitive_level <= ?');
                    params.push(filters.cogLevelEnd);
                }

                // Objective filter
                if (filters.objective) {
                    conditions.push('objective LIKE ?');
                    params.push(`%${filters.objective}%`);
                }

                // Handle relationship-based filters (requires JOINs)
                if (filters.examIds && filters.examIds.length > 0) {
                    const placeholders = filters.examIds.map(() => '?').join(',');
                    conditions.push(`question_id IN (
                    SELECT question_id FROM exam_questions
                    WHERE exam_id IN (${placeholders})
                )`);
                    params.push(...filters.examIds);
                }

                if (filters.kaNums && filters.kaNums.length > 0) {
                    const placeholders = filters.kaNums.map(() => '?').join(',');
                    conditions.push(`question_id IN (
                    SELECT question_id FROM question_kas 
                    WHERE ka_number IN (${placeholders})
                )`);
                    params.push(...filters.kaNums);
                }

                if (filters.systemNums && filters.systemNums.length > 0) {
                    const placeholders = filters.systemNums.map(() => '?').join(',');
                    conditions.push(`question_id IN (
                    SELECT question_id FROM question_systems 
                    WHERE system_number IN (${placeholders})
                )`);
                    params.push(...filters.systemNums);
                }
            }

            // Add WHERE clause if there are conditions
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            // Execute the query
            this.db.all(query, params, (err, rows: Question[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Alternative: More efficient version that builds query with JOINs for better performance
    async getManyWithJoins(filters?: QuestionFilters): Promise<Question[]> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            let query = 'SELECT DISTINCT q.* FROM questions q';
            const joins: string[] = [];
            const conditions: string[] = [];
            const params: any[] = [];

            if (filters) {
                filters.query = filters.query?.trim() || '';
                // Add JOINs for relationship filters
                if (filters.examIds && filters.examIds.length > 0) {
                    joins.push('JOIN exam_questions qe ON q.question_id = qe.question_id');
                    const placeholders = filters.examIds.map(() => '?').join(',');
                    conditions.push(`qe.exam_id IN (${placeholders})`);
                    params.push(...filters.examIds);
                }

                if (filters.kaNums && filters.kaNums.length > 0) {
                    joins.push('JOIN question_kas qk ON q.question_id = qk.question_id');
                    const placeholders = filters.kaNums.map(() => '?').join(',');
                    conditions.push(`qk.ka_num IN (${placeholders})`);
                    params.push(...filters.kaNums);
                }

                if (filters.systemNums && filters.systemNums.length > 0) {
                    joins.push('JOIN question_systems qs ON q.question_id = qs.question_id');
                    const placeholders = filters.systemNums.map(() => '?').join(',');
                    conditions.push(`qs.system_num IN (${placeholders})`);
                    params.push(...filters.systemNums);
                }

                // Direct column filters
                if (filters.query) {
                    conditions.push('q.question_text LIKE ?');
                    params.push(`%${filters.query}%`);
                }

                if (filters.lastUsedStart) {
                    conditions.push('q.last_used >= ?');
                    params.push(filters.lastUsedStart);
                }
                if (filters.lastUsedEnd) {
                    conditions.push('q.last_used <= ?');
                    params.push(filters.lastUsedEnd);
                }

                if (filters.examLevelStart) {
                    conditions.push('q.exam_level >= ?');
                    params.push(filters.examLevelStart);
                }
                if (filters.examLevelEnd) {
                    conditions.push('q.exam_level <= ?');
                    params.push(filters.examLevelEnd);
                }

                if (filters.diffLevelStart) {
                    conditions.push('q.difficulty_level >= ?');
                    params.push(parseInt(filters.diffLevelStart));
                }
                if (filters.diffLevelEnd) {
                    conditions.push('q.difficulty_level <= ?');
                    params.push(parseInt(filters.diffLevelEnd));
                }

                if (filters.cogLevelStart) {
                    conditions.push('q.cognitive_level >= ?');
                    params.push(filters.cogLevelStart);
                }
                if (filters.cogLevelEnd) {
                    conditions.push('q.cognitive_level <= ?');
                    params.push(filters.cogLevelEnd);
                }

                if (filters.objective) {
                    conditions.push('q.objective LIKE ?');
                    params.push(`%${filters.objective}%`);
                }
            }

            // Combine query parts
            if (joins.length > 0) {
                query += ' ' + joins.join(' ');
            }
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            this.db.all(query, params, (err, rows: Question[]) => {
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

    async update(question: Question): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isClosing()) {
                reject(new Error('Database is closing'));
                return;
            }

            if (!question.question_id) {
                reject(new Error('Question ID is required for update'));
                return;
            }

            const self = this;
            this.db.serialize(() => {
                self.db.run('BEGIN TRANSACTION');

                // First, update the main question record
                self.db.run(
                    'UPDATE questions SET question_text = ?, category = ?, exam_level = ?, technical_references = ?, difficulty_level = ?, cognitive_level = ?, objective = ?, last_used = ? WHERE question_id = ?',
                    [
                        question.question_text,
                        question.category,
                        question.exam_level,
                        question.technical_references,
                        question.difficulty_level,
                        question.cognitive_level,
                        question.objective,
                        question.last_used,
                        question.question_id
                    ],
                    function (err) {
                        if (err) {
                            self.db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        if (this.changes === 0) {
                            self.db.run('ROLLBACK');
                            reject(new Error('Question not found'));
                            return;
                        }

                        // Delete existing relationships before inserting new ones
                        const deleteOperations: Promise<void>[] = [
                            // Delete existing exam relationships
                            new Promise<void>((resolveDelete, rejectDelete) => {
                                self.db.run(
                                    'DELETE FROM exam_questions WHERE question_id = ?',
                                    [question.question_id],
                                    (deleteErr) => {
                                        if (deleteErr) rejectDelete(deleteErr);
                                        else resolveDelete();
                                    }
                                );
                            }),
                            // Delete existing answers
                            new Promise<void>((resolveDelete, rejectDelete) => {
                                self.db.run(
                                    'DELETE FROM answers WHERE question_id = ?',
                                    [question.question_id],
                                    (deleteErr) => {
                                        if (deleteErr) rejectDelete(deleteErr);
                                        else resolveDelete();
                                    }
                                );
                            }),
                            // Delete existing ka relationships
                            new Promise<void>((resolveDelete, rejectDelete) => {
                                self.db.run(
                                    'DELETE FROM question_kas WHERE question_id = ?',
                                    [question.question_id],
                                    (deleteErr) => {
                                        if (deleteErr) rejectDelete(deleteErr);
                                        else resolveDelete();
                                    }
                                );
                            }),
                            // Delete existing system relationships
                            new Promise<void>((resolveDelete, rejectDelete) => {
                                self.db.run(
                                    'DELETE FROM question_systems WHERE question_id = ?',
                                    [question.question_id],
                                    (deleteErr) => {
                                        if (deleteErr) rejectDelete(deleteErr);
                                        else resolveDelete();
                                    }
                                );
                            })
                        ];

                        Promise.all(deleteOperations).then(() => {
                            // Now insert the new relationships
                            const insertOperations: Promise<void>[] = [];

                            // Handle exam relationships
                            if (question.exams?.length) {
                                const examPromise = new Promise<void>((resolveExam, rejectExam) => {
                                    const placeholders = question.exams!.map(() => '(?, ?)').join(', ');
                                    const values: any[] = [];

                                    question.exams!.forEach(exam => {
                                        values.push(exam.exam_id, question.question_id);
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

                            // Handle answers
                            if (question.answers?.length) {
                                const answerPromise = new Promise<void>((resolveAnswer, rejectAnswer) => {
                                    const placeholders = question.answers!.map(() => '(?, ?, ?, ?, ?)').join(', ');
                                    const values: any[] = [];

                                    question.answers!.forEach(answer => {
                                        values.push(
                                            question.question_id,
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

                            // Handle ka relationships
                            if (question.kas?.length) {
                                const kaPromise = new Promise<void>((resolveKa, rejectKa) => {
                                    const placeholders = question.kas!.map(() => '(?, ?)').join(', ');
                                    const values: any[] = [];

                                    question.kas!.forEach(ka => {
                                        values.push(question.question_id, ka.ka_number);
                                    });

                                    self.db.run(
                                        `INSERT INTO question_kas (question_id, ka_number) VALUES ${placeholders}`,
                                        values,
                                        (kaErr) => {
                                            if (kaErr) rejectKa(kaErr);
                                            else resolveKa();
                                        }
                                    );
                                });
                                insertOperations.push(kaPromise);
                            }

                            // Handle system relationships
                            if (question.systems?.length) {
                                const systemPromise = new Promise<void>((resolveSystem, rejectSystem) => {
                                    const placeholders = question.systems!.map(() => '(?, ?)').join(', ');
                                    const values: any[] = [];

                                    question.systems!.forEach(system => {
                                        values.push(question.question_id, system.number);
                                    });

                                    self.db.run(
                                        `INSERT INTO question_systems (question_id, system_number) VALUES ${placeholders}`,
                                        values,
                                        (systemErr) => {
                                            if (systemErr) rejectSystem(systemErr);
                                            else resolveSystem();
                                        }
                                    );
                                });
                                insertOperations.push(systemPromise);
                            }

                            Promise.all(insertOperations).then(() => {
                                self.db.run('COMMIT', (commitErr) => {
                                    if (commitErr) {
                                        reject(commitErr);
                                    } else {
                                        resolve();
                                    }
                                });
                            }).catch((insertErr) => {
                                self.db.run('ROLLBACK');
                                reject(insertErr);
                            });

                        }).catch((deleteErr) => {
                            self.db.run('ROLLBACK');
                            reject(deleteErr);
                        });
                    }
                );
            });
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

}