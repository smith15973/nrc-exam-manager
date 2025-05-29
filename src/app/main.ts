import { app, BrowserWindow, ipcMain } from 'electron';
import { Database } from '../data/db'
import * as path from 'path';
import * as fs from 'fs';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Define WindowState interface
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

let mainWindow: BrowserWindow | null = null;
let db: Database | null = null;
let isShuttingDown = false;

// Path to store window position data
const getWindowStatePath = (): string => {
  return path.join(app.getPath('userData'), 'window-state.json');
};

// Function to save window position and size
const saveWindowState = (window: BrowserWindow): void => {
  if (!window.isMinimized() && !window.isMaximized()) {
    const position = window.getPosition();
    const size = window.getSize();

    const windowState: WindowState = {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1]
    };

    try {
      fs.writeFileSync(getWindowStatePath(), JSON.stringify(windowState));
    } catch (error) {
      console.error('Error saving window state:', error);
    }
  }
};

// Function to load saved window state
const loadWindowState = (): WindowState => {
  try {
    const windowStatePath = getWindowStatePath();
    if (fs.existsSync(windowStatePath)) {
      return JSON.parse(fs.readFileSync(windowStatePath, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading window state:', error);
  }

  // Default window state if no saved state exists
  return {
    width: 1200,
    height: 800
  };
};

// Add graceful shutdown function
const handleShutdown = async (): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('Application shutting down...');

  // Save window state if window exists
  if (mainWindow && !mainWindow.isDestroyed()) {
    saveWindowState(mainWindow);
  }

  // Close the database connection
  if (db) {
    console.log('Closing database...');
    try {
      await db.close();
      console.log('Database closed successfully');
    } catch (err) {
      console.error('Error closing database:', err);
    }
    db = null;
  }

  // Exit the application with success code
  process.exit(0);
};

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Load saved window state
  const windowState = loadWindowState();

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

  // Initialize database if not already initialized
  if (!db) {
    db = new Database();
    console.log('Database initialized');
  }

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();

  // Save window state when the window is closed
  mainWindow.on('close', () => {
    if (mainWindow) {
      saveWindowState(mainWindow);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', () => {
  createWindow();
});

// Register process event handlers for termination signals
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.on('SIGHUP', handleShutdown);

// Modify will-quit to use our handleShutdown function
app.on('will-quit', (event) => {
  if (!isShuttingDown) {
    // Prevent the default quit behavior
    event.preventDefault();
    // Use our custom shutdown handler
    handleShutdown();
  }
});


// Modified to keep database connection open on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  // Don't close the database here, just let the window close
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// Unified database handler
ipcMain.handle('db-operation', async (_event, { operation, data }) => {
  try {
    // Ensure database is initialized
    if (!db) {
      db = new Database();
    }

    // Route to appropriate database method
    switch (operation) {
      // Plant operations
      case 'add-plant':
        const plantId = await db.plants.add(data);
        return { success: true, plantId };

      case 'get-plants':
        const plants = await db.plants.getAll();
        return { success: true, plants };

      case 'get-plants-with-exams':
        const plantsWithExams = await db.plants.getAllWithExams();
        return { success: true, plants: plantsWithExams };

      case 'get-plant':
        const plant = await db.plants.getById(data)
        return { success: true, plant };

      case 'get-plant-with-exams':
        const plantWithExams = await db.plants.getByIdWithExams(data);
        return { success: true, plant: plantWithExams };

      case 'update-plant':
        await db.plants.update(data)
        return { success: true };

      case 'delete-plant':
        await db.plants.delete(data)
        return { success: true };

      // Exam operations
      case 'add-exam':
        if (!data.plant_id) {
          return { success: false, error: "Plant ID is required" };
        }
        const examId = await db.exams.add(data)
        return { success: true, examId };

      case 'get-exams':
        const exams = await db.exams.getAll();
        return { success: true, exams };

      case 'get-exam':
        const exam = await db.exams.getById(data);
        return { success: true, exam };

      case 'get-exams-by-question-id':
        const examsByQuestion = await db.exams.getByQuestionId(data)
        return { success: true, exams: examsByQuestion };

      case 'update-exam':
        await db.exams.update(data);
        return { success: true };

      case 'delete-exam':
        await db.exams.delete(data);
        return { success: true };

      // Question operations
      case 'add-question':
        const questionId = await db.questions.add(data);
        return { success: true, questionId };

      case 'get-questions':
        const questions = await db.questions.getAll();
        return { success: true, questions };

      case 'get-questions-by-exam-id':
        const examQuestions = await db.questions.getByExamId(data);
        return { success: true, questions: examQuestions };

      case 'get-question-by-id':
        const question = await db.questions.getById(data);
        return { success: true, question };

      case 'get-answers-by-question-id':
        const answers = await db.questions.getAnswersByQuestionId(data);
        return { success: true, answers };

      case 'get-question-complete':
        const questionWithAll = await db.questionService.getCompleteQuestion(data);
        return { success: true, question: questionWithAll };

      case 'get-questions-complete':
        const questionsComplete = await db.questionService.getQuestionsComplete();
        return { success: true, questions: questionsComplete };

      case 'update-question':
        await db.questions.update(data);
        return { success: true };

      case 'delete-question':
        await db.questions.delete(data);
        return { success: true };

      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});