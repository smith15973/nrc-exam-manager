import { app, BrowserWindow, ipcMain } from 'electron';
import { Database, User } from '../db/db';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
let db: Database | null = null;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
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

app.on('ready', createWindow);

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

ipcMain.handle('add-user', async (_event, user: User) => {
  try {
    if (!db) {
      db = new Database(); // Reopen if needed
    }
    await db.addUser(user);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-users', async () => {
  try {
    if (!db) {
      db = new Database(); // Reopen if needed
    }
    const users = await db.getUsers();
    return { success: true, users };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});