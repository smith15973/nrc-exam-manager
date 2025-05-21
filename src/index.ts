import { app, BrowserWindow, ipcMain } from 'electron';
import { Database } from './components/lib/db';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
let db: Database | null = null;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
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