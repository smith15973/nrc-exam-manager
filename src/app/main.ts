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

export class DataHandler {
  private db: Database

  constructor() {
    this.db = new Database();
    this.setupHandler();
  }

  private setupHandler() {
    // ONE SINGLE IPC HANDLER FOR EVERYTHING
    ipcMain.handle('data', async (_event, operation: DataOperation): Promise<DataResponse> => {
      try {
        const result = await this.executeOperation(operation);
        return { success: true, data: result };
      } catch (error: any) {
        console.error('Data operation failed:', error);
        return { success: false, error: error.message };
      }
    });
  }

  private async executeOperation(op: DataOperation): Promise<any> {
    const { entity, action, data } = op;

    // Route to appropriate handler based on entity and action
    switch (entity) {
      case 'plants':
        return this.handlePlants(action as any, data);
      case 'exams':
        return this.handleExams(action as any, data);
      case 'questions':
        return this.handleQuestions(action as any, data);
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }
  }

  private async handlePlants(action: string, data: any) {
    switch (action) {
      case 'create': return await this.db.addPlant(data);
      case 'read': return data ? await this.db.getPlant(data) : await this.db.getPlants();
      case 'update': return await this.db.updatePlant(data);
      case 'delete': return await this.db.deletePlant(data);
      case 'readWithExams': return data ? await this.db.getPlantWithExams(data) : await this.db.getPlantsWithExams();
      default: throw new Error(`Unknown plants action: ${action}`);
    }
  }

  private async handleExams(action: string, data: any) {
    switch (action) {
      case 'create': return await this.db.addExam(data);
      case 'read': return data ? await this.db.getExam(data) : await this.db.getExams();
      case 'update': return await this.db.updateExam(data);
      case 'delete': return await this.db.deleteExam(data);
      default: throw new Error(`Unknown exams action: ${action}`);
    }
  }

  private async handleQuestions(action: string, data: any) {
    switch (action) {
      case 'create': return await this.db.addQuestion(data);
      case 'read': return data ? await this.db.getQuestionById(data) : await this.db.getQuestions();
      case 'update': return await this.db.updateQuestion(data);
      case 'delete': return await this.db.deleteQuestion(data);
      case 'readWithAll': return await this.db.getQuestionAll(data);
      case 'readAnswers': return await this.db.getAnswersByQuestionId(data);
      case 'readExams': return await this.db.getExamsByQuestionId(data);
      default: throw new Error(`Unknown questions action: ${action}`);
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
    }
  }
}