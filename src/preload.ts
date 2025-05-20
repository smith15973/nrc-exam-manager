// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
import { User } from '../db/db';

contextBridge.exposeInMainWorld('api', {
  addUser: (user: User) => ipcRenderer.invoke('add-user', user),
  getUsers: () => ipcRenderer.invoke('get-users'),
});