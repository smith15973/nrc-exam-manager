import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { Database } from '../data/db/database';
import * as path from 'path';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ImportRepository } from '../data/db/repositories/ImportRepository';
import { ExportRepository } from '../data/db/repositories/ExportRepository';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Define Config interface
interface Config {
  windowState: {
    x?: number;
    y?: number;
    width: number;
    height: number;
  };
  dbPath?: string | null;
}

let importRepository: ImportRepository | null = null;
let exportRepository: ExportRepository | null = null;
let mainWindow: BrowserWindow | null = null;
let db: Database | null = null;
let sbdb: Database | null = null;
let isShuttingDown = false;

// Path to store configuration
const getConfigPath = (): string => {
  return path.join(app.getPath('userData'), 'config.json');
};

const loadConfig = (): Config => {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');

      // Check if the content is empty or only whitespace
      if (!configContent.trim()) {
        console.warn('Config file is empty, returning default configuration');
        return {
          windowState: {
            width: 1200,
            height: 800,
          },
        };
      }

      const config = JSON.parse(configContent);

      // Ensure windowState is always present
      return {
        windowState: {
          width: 1200,
          height: 800,
          ...config.windowState, // Merge with saved windowState, if it exists
        },
        dbPath: config.dbPath,
      };
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  // Default configuration if file doesn't exist, is empty, or is invalid
  return {
    windowState: {
      width: 1200,
      height: 800,
    },
  };
};

// Function to save configuration
const saveConfig = (config: Config): void => {
  try {
    fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
  }
};

// Function to save window state
const saveWindowState = (window: BrowserWindow): void => {
  if (!window.isMinimized() && !window.isMaximized()) {
    const position = window.getPosition();
    const size = window.getSize();
    const config = loadConfig();
    config.windowState = {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
    saveConfig(config);
  }
};

// Function to show initial database choice dialog
const showInitialDatabaseChoice = async (): Promise<'new' | 'existing' | null> => {
  const result = await dialog.showMessageBox({
    type: 'question',
    title: 'Database Setup',
    message: 'Welcome! Please choose how you want to set up your database:',
    buttons: ['Create New Database', 'Open Existing Database', 'Cancel'],
    defaultId: 0,
    cancelId: 2
  });

  switch (result.response) {
    case 0: return 'new';
    case 1: return 'existing';
    default: return null;
  }
};

// Function to prompt for new database location
const promptForNewDbPath = async (sb?: boolean): Promise<string | null> => {
  const result = await dialog.showSaveDialog({
    title: 'Create New Database',
    defaultPath: sb ? path.join(app.getPath('userData'), 'secureDatabase.db') :
      loadConfig().dbPath || path.join(app.getPath('userData'), 'database.db'),
    filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] }],
    properties: ['createDirectory']
  });

  return result.canceled ? null : result.filePath || null;
};

// Function to prompt for existing database
const promptForExistingDbPath = async (sb?: boolean): Promise<string | null> => {
  const result = await dialog.showOpenDialog({
    title: 'Select Existing Database',
    defaultPath: sb ? app.getPath('userData') : loadConfig().dbPath || app.getPath('userData'),
    filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] }],
    properties: ['openFile']
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  const selectedPath = result.filePaths[0];

  // Verify the file exists and is accessible
  try {
    fs.accessSync(selectedPath, fs.constants.R_OK | fs.constants.W_OK);
    return selectedPath;
  } catch (error) {
    console.error('Database file is not accessible:', error);
    await dialog.showErrorBox(
      'Database Error',
      `Cannot access the selected database file: ${selectedPath}\n\nPlease check file permissions or select a different file.`
    );
    return null;
  }
};

// Function to handle initial database setup
const setupInitialDatabase = async (): Promise<string | null> => {
  const choice = await showInitialDatabaseChoice();

  if (!choice) {
    return null; // User cancelled
  }

  let dbPath: string | null = null;

  if (choice === 'new') {
    dbPath = await promptForNewDbPath();
    if (dbPath) {
      // Ensure the directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // If file already exists, ask for confirmation
      if (fs.existsSync(dbPath)) {
        const overwrite = await dialog.showMessageBox({
          type: 'warning',
          title: 'File Exists',
          message: `The file "${path.basename(dbPath)}" already exists. Do you want to overwrite it?`,
          buttons: ['Overwrite', 'Choose Different Location', 'Cancel'],
          defaultId: 1,
          cancelId: 2
        });

        if (overwrite.response === 1) {
          // Choose different location
          return await setupInitialDatabase();
        } else if (overwrite.response === 2) {
          // Cancel
          return null;
        }
        // If response === 0, continue with overwrite
      }
    }
  } else {
    dbPath = await promptForExistingDbPath();
  }

  return dbPath;
};

// Function to show change database choice dialog
const showChangeDatabaseChoice = async (sb?: boolean): Promise<'new' | 'existing' | null> => {
  const result = await dialog.showMessageBox({
    type: 'question',
    title: sb ? 'Secure Database Access' : 'Change Database',
    message: sb
      ? 'Please select your preferred method for accessing a secure database:'
      : 'Please choose how you would like to change your database:',
    buttons: ['Create New Database', 'Use Existing Database', 'Cancel'],
    defaultId: 0,
    cancelId: 2
  });

  switch (result.response) {
    case 0: return 'new';
    case 1: return 'existing';
    default: return null;
  }
};

// Function to handle database change
const changeDatabaseLocation = async (sb?: boolean): Promise<{ success: boolean; dbPath?: string; error?: string }> => {
  const choice = await showChangeDatabaseChoice(sb);

  if (!choice) {
    return { success: false, error: 'Operation cancelled' };
  }

  let newDbPath: string | null = null;

  if (choice === 'new') {
    newDbPath = await promptForNewDbPath(sb);
    if (newDbPath) {
      // Ensure the directory exists
      const dir = path.dirname(newDbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // If file already exists, ask for confirmation
      if (fs.existsSync(newDbPath)) {
        const overwrite = await dialog.showMessageBox({
          type: 'warning',
          title: 'File Exists',
          message: `The file "${path.basename(newDbPath)}" already exists. Do you want to overwrite it?`,
          buttons: ['Overwrite', 'Cancel'],
          defaultId: 1,
          cancelId: 1
        });

        if (overwrite.response === 1) {
          return { success: false, error: 'Operation cancelled' };
        }
      }
    }
  } else {
    newDbPath = await promptForExistingDbPath();
  }

  if (!newDbPath) {
    return { success: false, error: 'No database path selected' };
  }


  // Sandbox mode
  if (sb) {
    try {
      // Close existing database connection
      if (sbdb) {
        console.log('Closing existing secure database connection...');
        sbdb.close();
        sbdb = null;
        importRepository = null;
        exportRepository = null;
      }

      // Update config with new database path
      // const config = loadConfig();
      // config.dbPath = newDbPath;
      // saveConfig(config);

      // Initialize new database connection
      sbdb = new Database(newDbPath, true);
      importRepository = new ImportRepository(sbdb);
      exportRepository = new ExportRepository(sbdb);

      console.log('Secure database changed to:', newDbPath);

      return { success: true, dbPath: newDbPath };
    } catch (error) {
      console.error('Error changing secure database:', error);
      return { success: false, error: `Failed to switch database: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }

    // Main Database
  } else {
    try {
      // Close existing database connection
      if (db) {
        console.log('Closing existing database connection...');
        db.close();
        db = null;
        importRepository = null;
        exportRepository = null;
      }

      // Update config with new database path
      const config = loadConfig();
      config.dbPath = newDbPath;
      saveConfig(config);

      // Initialize new database connection
      db = new Database(newDbPath);
      importRepository = new ImportRepository(db);
      exportRepository = new ExportRepository(db);

      console.log('Database changed to:', newDbPath);

      return { success: true, dbPath: newDbPath };
    } catch (error) {
      console.error('Error changing database:', error);
      return { success: false, error: `Failed to switch database: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
};

// Add graceful shutdown function
const handleShutdown = async (): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('Application shutting down...');
  if (mainWindow && !mainWindow.isDestroyed()) {
    saveWindowState(mainWindow);
  }
  if (db) {
    console.log('Closing database...');
    try {
      db.close();
      console.log('Database closed successfully');
    } catch (err) {
      console.error('Error closing database:', err);
    }
    db = null;
  }
  process.exit(0);
};

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async (): Promise<void> => {
  const config = loadConfig();
  const windowState = config.windowState || { width: 1200, height: 800 };

  let dbPath = config.dbPath;

  // If no database path is configured, show initial setup
  if (!dbPath) {
    dbPath = await setupInitialDatabase();
    if (!dbPath) {
      console.log('No database path selected, quitting app');
      app.quit();
      return;
    }
    config.dbPath = dbPath;
    saveConfig(config);
  } else {
    // Verify existing database path is still accessible
    try {
      fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      console.warn('Configured database path is not accessible:', dbPath);
      const reconnect = await dialog.showMessageBox({
        type: 'warning',
        title: 'Database Not Found',
        message: `The configured database at "${dbPath}" is not accessible.\n\nWould you like to select a different database?`,
        buttons: ['Select Different Database', 'Quit Application'],
        defaultId: 0,
        cancelId: 1
      });

      if (reconnect.response === 0) {
        dbPath = await setupInitialDatabase();
        if (!dbPath) {
          console.log('No database path selected, quitting app');
          app.quit();
          return;
        }
        config.dbPath = dbPath;
        saveConfig(config);
      } else {
        app.quit();
        return;
      }
    }
  }

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Initialize database and repositories
  if (!db) {
    db = new Database(dbPath);
    console.log('Database initialized at:', dbPath);
  }

  if (!importRepository) {
    importRepository = new ImportRepository(db);
    console.log('Import Repo initialized');
  }
  if (!exportRepository) {
    exportRepository = new ExportRepository(db);
    console.log('Export Repo initialized');
  }

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();

  mainWindow.on('close', () => {
    if (mainWindow) {
      saveWindowState(mainWindow);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', async () => {
  await createWindow();
});

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.on('SIGHUP', handleShutdown);

app.on('will-quit', (event) => {
  if (!isShuttingDown) {
    event.preventDefault();
    handleShutdown();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

// Import handlers
ipcMain.handle('files-operation', async (_event, { operation, data }) => {
  // Ensure database is initialized
  if (!db) {
    const config = loadConfig();
    const dbPath = config.dbPath || path.join(app.getPath('userData'), 'nrc_exam_questions_database.db');
    db = new Database(dbPath);
  }

  if (!importRepository) {
    importRepository = new ImportRepository(db);
  }
  if (!exportRepository) {
    exportRepository = new ExportRepository(db);
  }

  switch (operation) {
    case 'import-questions': {
      return importRepository.importQuestions();
    }

    case 'export-questions': {
      return exportRepository.exportQuestions(data)
    }
    case 'open-location': {
      return shell.showItemInFolder(data);
    }
    case 'change-db-location': {
      return await changeDatabaseLocation();
    }
    case 'select-sb-db-location': {
      return await changeDatabaseLocation(true);
    }

    default:
      return { success: false, error: `Unknown files operation ${operation}` };
  }
})

// Unified database handler
ipcMain.handle('db-operation', async (_event, { operation, data }) => {
  try {
    // Ensure database is initialized
    if (!db) {
      const config = loadConfig();
      const dbPath = config.dbPath || path.join(app.getPath('userData'), 'nrc_exam_questions_database.db');
      db = new Database(dbPath);
    }

    // Route to appropriate database method
    switch (operation) {
      // Plant operations
      case 'add-plant': {
        const plantId = await db.plants.add(data);
        return { success: true, plantId };
      }

      case 'get-plants': {
        const plants = await db.plants.getAll();
        return { success: true, plants };
      }

      case 'get-plants-with-exams': {
        const plantsWithExams = await db.plants.getAllWithExams();
        return { success: true, plants: plantsWithExams };
      }

      case 'get-plant': {
        const plant = await db.plants.getById(data)
        return { success: true, plant };
      }

      case 'get-plant-with-exams': {
        const plantWithExams = await db.plants.getByIdWithExams(data);
        return { success: true, plant: plantWithExams };
      }

      case 'update-plant': {
        await db.plants.update(data)
        return { success: true };
      }

      case 'delete-plant': {
        await db.plants.delete(data)
        return { success: true };
      }

      // Exam operations
      case 'add-exam': {
        if (!data.plant_id) {
          return { success: false, error: "Plant ID is required" };
        }
        const examId = await db.exams.add(data)
        return { success: true, examId };
      }
      case 'get-exams': {
        const exams = await db.exams.getAll();
        return { success: true, exams };
      }
      case 'get-exams-by-params': {
        const exams = await db.exams.getMany(data);
        return { success: true, exams };
      }
      case 'get-exam': {
        const exam = await db.exams.getById(data);
        return { success: true, exam };
      }
      case 'get-exam-by-params': {
        const exam = await db.exams.get(data);
        return { success: true, exam };
      }
      case 'get-exams-by-question-id': {
        const examsByQuestion = await db.exams.getByQuestionId(data)
        return { success: true, exams: examsByQuestion };
      }
      case 'update-exam': {
        await db.exams.update(data);
        return { success: true };
      }
      case 'delete-exam': {
        await db.exams.delete(data);
        return { success: true };
      }
      case 'remove-exam-question': {
        await db.exams.removeQuestion(data.examId, data.questionId)
        return { success: true };
      }
      // case 'add-exam-question': {
      //   const examQuestionId = await db.exams.addQuestionToExam(data.examId, data.questionId)
      //   return { success: true, examQuestionId };
      // }

      // Question operations
      case 'add-question': {
        const questionId = await db.questions.add(data);
        return { success: true, questionId };
      }

      case 'add-questions-batch': {
        const questionIds = await db.questions.addBatch(data);
        return { success: true, questionIds };
      }

      case 'get-questions': {
        const questions = await db.questions.getMany(data);
        return { success: true, questions };
      }

      case 'get-questions-by-exam-id': {
        const examQuestionIds = (await db.questions.getByExamId(data)).map(question => question.question_id);
        const questionService = db.questionService;
        const examQuestions = await Promise.all(
          examQuestionIds.map(examQuestionId => questionService.getCompleteQuestion(examQuestionId))
        );
        return { success: true, questions: examQuestions };
      }

      case 'get-question-by-id': {
        const question = await db.questions.getById(data);
        return { success: true, question };
      }

      case 'get-question-complete': {
        const questionWithAll = await db.questionService.getCompleteQuestion(data);
        return { success: true, question: questionWithAll };
      }

      case 'get-questions-complete': {
        const questionsComplete = await db.questionService.getQuestionsComplete(data);
        return { success: true, questions: questionsComplete };
      }

      case 'update-question': {
        await db.questions.update(data);
        return { success: true };
      }

      case 'delete-question': {
        await db.questions.delete(data);
        return { success: true };
      }

      // System operations
      case 'add-system': {
        await db.systems.add(data);
        return { success: true }
      }
      case 'get-system': {
        const system = await db.systems.get(data);
        return { success: true, system }
      }
      case 'get-systems': {
        const systems = await db.systems.getMany(data);
        return { success: true, systems }
      }
      case 'update-system': {
        await db.systems.update(data);
        return { success: true }
      }
      case 'delete-system': {
        await db.systems.delete(data);
        return { success: true }
      }

      // System KA operations
      case 'add-system-ka': {
        await db.system_kas.add(data);
        return { success: true }
      }
      case 'get-system-ka': {
        const system_ka = await db.system_kas.get(data);
        return { success: true, system_ka }
      }
      case 'get-system-kas': {
        const system_kas = await db.system_kas.getMany(data);
        return { success: true, system_kas }
      }
      case 'update-system-ka': {
        await db.system_kas.update(data);
        return { success: true }
      }
      case 'delete-system-ka': {
        await db.system_kas.delete(data);
        return { success: true }
      }

      // Exam Question operations
      case 'add-exam-question': {
        await db.exam_questions.add(data);
        return { success: true }
      }
      case 'get-exam-question': {
        const exam_question = await db.exam_questions.get(data);
        return { success: true, exam_question }
      }
      case 'get-exam-questions': {
        const exam_questions = await db.exam_questions.getMany(data);
        return { success: true, exam_questions }
      }
      case 'get-exam-question-with-details': {
        const exam_question = await db.exam_questions.getWithDetails(data);
        return { success: true, exam_question }
      }
      case 'get-exam-question-by-exam-id': {
        const exam_question = await db.exam_questions.getByExamId(data);
        return { success: true, exam_question }
      }
      case 'get-exam-question-by-question-id': {
        const exam_question = await db.exam_questions.getByQuestionId(data);
        return { success: true, exam_question }
      }
      case 'update-exam-question': {
        await db.exam_questions.update(data);
        return { success: true }
      }
      case 'delete-exam-question': {
        await db.exam_questions.delete(data.examId, data.questionId);
        return { success: true }
      }

      // Stem operations
      case 'add-stem': {
        await db.stems.add(data);
        return { success: true }
      }
      case 'get-stem': {
        const stem = await db.stems.get(data);
        return { success: true, stem }
      }
      case 'get-stems': {
        const stems = await db.stems.getMany(data);
        return { success: true, stems }
      }
      case 'update-stem': {
        await db.stems.update(data);
        return { success: true }
      }
      case 'delete-stem': {
        await db.stems.delete(data);
        return { success: true }
      }

      // KA operations
      case 'add-ka': {
        await db.kas.add(data);
        return { success: true }
      }
      case 'get-ka': {
        const ka = await db.kas.get(data);
        return { success: true, ka }
      }
      case 'get-kas': {
        const kas = await db.kas.getMany(data);
        return { success: true, kas }
      }
      case 'update-ka': {
        await db.kas.update(data);
        return { success: true }
      }
      case 'delete-ka': {
        await db.kas.delete(data);
        return { success: true }
      }

      default: {
        return { success: false, error: `Unknown operation: ${operation}` };
      }
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
});
