// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  addPlant: (plant: Plant) => ipcRenderer.invoke('add-plant', plant),
  getPlants: () => ipcRenderer.invoke('get-plants'),
  getPlant: (plantId: number) => ipcRenderer.invoke('get-plant', plantId),
  updatePlant: (plant: Plant) => ipcRenderer.invoke('update-plant', plant),
  deletePlant: (plantId: number) => ipcRenderer.invoke('delete-plant', plantId),

});