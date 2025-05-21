import { app, BrowserWindow, ipcMain } from 'electron';
import { Database } from './components/lib/db';
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

// Only close the database when the app is really quitting
app.on('will-quit', () => {
  if (db) {
    db.close();
    db = null;
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

ipcMain.handle('add-plant', async (_event, plant: Plant) => {
  try {
    if (!db) {
      db = new Database(); // Reopen if needed
    }
    const plantId = await db.addPlant(plant);
    return { success: true, plantId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-plants', async () => {
  try {
    if (!db) {
      db = new Database(); // Reopen if needed
    }
    const plants = await db.getPlants();
    return { success: true, plants };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-plant', async (_event, plantId: number) => {
  try {
    if (!db) {
      db = new Database();
    }
    const plant = await db.getPlant(plantId);
    return { success: true, plant };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('update-plant', async (_event, plant: Plant) => {
  try {
    if (!db) {
      db = new Database();
    }
    await db.updatePlant(plant);
    return { success: true, plant };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-plant', async (_event, plantId: number) => {
  try {
    if (!db) {
      db = new Database();
    }
    await db.deletePlant(plantId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('add-exam', async (_event, exam: Exam) => {

  // Validate required fields
  if (!exam.plant_id) {
    return { success: false, error: "Plant ID is required" };
  }

  try {
    if (!db) {
      db = new Database(); // Reopen if needed
    }
    const examId = await db.addExam(exam);
    return { success: true, examId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-exams', async () => {
  try {
    if (!db) {
      db = new Database(); // Reopen if needed
    }
    const exams = await db.getExams();
    return { success: true, exams };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-exam', async (_event, examId: number) => {
  try {
    if (!db) {
      db = new Database();
    }
    const exam = await db.getExam(examId);
    return { success: true, exam };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('update-exam', async (_event, exam: Exam) => {
  try {
    if (!db) {
      db = new Database();
    }
    await db.updateExam(exam);
    return { success: true, exam };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-exam', async (_event, examId: number) => {
  try {
    if (!db) {
      db = new Database();
    }
    await db.deleteExam(examId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});