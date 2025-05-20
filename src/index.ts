import { app, BrowserWindow, ipcMain } from 'electron';
import { Database, Plant } from '../db/db';
import path from 'path'
import fs from 'fs'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
let db: Database | null = null;

// Ensure schema.sql is copied to the correct location
const setupSchemaFile = () => {
  const appPath = app.getAppPath();
  const schemaSrc = path.join(__dirname, '..', 'db', 'schema.sql');
  const schemaDestDir = path.join(appPath, 'db');
  const schemaDest = path.join(schemaDestDir, 'schema.sql');

  // Ensure destination directory exists
  if (!fs.existsSync(schemaDestDir)) {
    fs.mkdirSync(schemaDestDir, { recursive: true });
  }

  // Only copy if destination doesn't exist
  if (!fs.existsSync(schemaDest) && fs.existsSync(schemaSrc)) {
    try {
      fs.copyFileSync(schemaSrc, schemaDest);
      console.log('Schema file copied successfully');
    } catch (err) {
      console.error('Failed to copy schema file:', err);
    }
  }
};

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
  setupSchemaFile();
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
    return { success: true };
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