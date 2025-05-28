// useDatabase.ts 
import { useState, useEffect, useCallback } from "react";
// If ElectronAPI is defined in a different file, update the path accordingly, for example:
import { ElectronAPI } from "../../app/preload";

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export const useDatabase = () => {
    const executeDataOperation = useCallback(async(operation: DataOperation) => {
        return await window.electronAPI.data(operation);
    }, [])

   
    return {
        data: executeDataOperation,

        plants: window.electronAPI.plants,
        exams: window.electronAPI.exams,
        questions: window.electronAPI.questions,
    }
}