// db/schemaGenerator.ts
// This file generates form schemas and default objects from the database structure
// It can be used to introspect the current database or work with known table structures
import sqlite3 from 'sqlite3'

export interface TableColumn {
    name: string;
    type: string;
    nullable: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    defaultValue?: any;
}

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
}

// Known table structures based on our migrations
// This could be generated dynamically by introspecting the database, but for now we'll define it statically
export const tableStructures = {
    plants: [
        { name: 'plant_id', type: 'INTEGER', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'name', type: 'TEXT', nullable: false, isPrimaryKey: false, isForeignKey: false },
    ],
    exams: [
        { name: 'exam_id', type: 'INTEGER', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'name', type: 'TEXT', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'plant_id', type: 'INTEGER', nullable: false, isPrimaryKey: false, isForeignKey: true },
    ],
    questions: [
        { name: 'question_id', type: 'INTEGER', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'question_text', type: 'TEXT', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'category', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'exam_level', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'technical_references', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'difficulty_level', type: 'INTEGER', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'cognitive_level', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'objective', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'last_used', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
    ],
    exam_questions: [
        { name: 'exam_id', type: 'INTEGER', nullable: false, isPrimaryKey: true, isForeignKey: true },
        { name: 'question_id', type: 'INTEGER', nullable: false, isPrimaryKey: true, isForeignKey: true },
    ],
    answers: [
        { name: 'answer_id', type: 'INTEGER', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'question_id', type: 'INTEGER', nullable: false, isPrimaryKey: false, isForeignKey: true },
        { name: 'answer_text', type: 'TEXT', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'is_correct', type: 'INTEGER', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'justification', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'option', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
    ],
    question_ka_numbers: [
        { name: 'question_id', type: 'INTEGER', nullable: false, isPrimaryKey: true, isForeignKey: true },
        { name: 'ka_number', type: 'TEXT', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'ka_statement', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'ka_importance', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
    ],
    question_system_numbers: [
        { name: 'question_id', type: 'INTEGER', nullable: false, isPrimaryKey: true, isForeignKey: true },
        { name: 'system_number', type: 'TEXT', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'system_description', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
    ],
} as const;

export type TableName = keyof typeof tableStructures;

// Generate form schema from table structure
export function generateFormSchema(tableName: TableName): FormField[] {
    const columns: readonly TableColumn[] = tableStructures[tableName];

    return Array.from(columns) // Convert readonly array to mutable array
        .filter((col: TableColumn) => !col.isPrimaryKey) // Exclude primary keys from forms
        .map((col: TableColumn) => ({
            key: col.name,
            label: col.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            type: getFormFieldType(col.type),
            required: !col.nullable,
        }));
}

function getFormFieldType(sqlType: string): FormField['type'] {
    switch (sqlType.toUpperCase()) {
        case 'INTEGER':
            return 'number';
        case 'TEXT':
            return 'text';
        case 'BOOLEAN':
            return 'boolean';
        default:
            return 'text';
    }
}

// Generate default object for a table
export function generateDefaultObject(tableName: TableName): Record<string, any> {
    const columns: readonly TableColumn[] = tableStructures[tableName];
    const defaultObj: Record<string, any> = {};

    columns.forEach(col => {
        if (col.isPrimaryKey && col.type === 'INTEGER') {
            defaultObj[col.name] = 0;
        } else if (col.type === 'TEXT') {
            defaultObj[col.name] = col.nullable ? null : '';
        } else if (col.type === 'INTEGER') {
            defaultObj[col.name] = col.nullable ? null : 0;
        } else {
            defaultObj[col.name] = null;
        }
    });

    return defaultObj;
}

// Export generated schemas
export const plantSchema = generateFormSchema('plants');
export const examSchema = generateFormSchema('exams');
export const questionSchema = generateFormSchema('questions');
export const examQuestionSchema = generateFormSchema('exam_questions');
export const answerSchema = generateFormSchema('answers');
export const questionKaNumberSchema = generateFormSchema('question_ka_numbers');
export const questionSystemNumberSchema = generateFormSchema('question_system_numbers');

// Export default objects
export const defaultPlant = {
    ...generateDefaultObject('plants'),
    exams: [], // Add relationships
};

export const defaultExam = generateDefaultObject('exams');

export const defaultQuestion = {
    ...generateDefaultObject('questions'),
    answers: [
        { ...generateDefaultObject('answers'), option: 'A' },
        { ...generateDefaultObject('answers'), option: 'B' },
        { ...generateDefaultObject('answers'), option: 'C' },
        { ...generateDefaultObject('answers'), option: 'D' },
    ],
    ka_numbers: [],
    system_numbers: [],
    exams: [],
};

export const defaultExamQuestion = generateDefaultObject('exam_questions');
export const defaultAnswer = generateDefaultObject('answers');
export const defaultQuestionKaNumber = generateDefaultObject('question_ka_numbers');
export const defaultQuestionSystemNumber = generateDefaultObject('question_system_numbers');

// Utility to introspect actual database (optional - for runtime schema discovery)
export class SchemaIntrospector {
    private db: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this.db = db;
    }

    async getTableColumns(tableName: string): Promise<TableColumn[]> {
        return new Promise((resolve, reject) => {
            this.db.all(`PRAGMA table_info(${tableName})`, (err, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                const columns: TableColumn[] = rows.map(row => ({
                    name: row.name,
                    type: row.type,
                    nullable: row.notnull === 0,
                    isPrimaryKey: row.pk === 1,
                    isForeignKey: false, // Would need to check foreign_key_list for this
                    defaultValue: row.dflt_value,
                }));

                resolve(columns);
            });
        });
    }

    async getAllTables(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
                (err, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows.map(row => row.name));
                }
            );
        });
    }
}