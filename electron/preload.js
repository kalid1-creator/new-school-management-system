// Basic preload script to satisfy Electron and provide bridge if needed
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // We can add safe async IPC here if needed later
    // For now, keeping it clean to prevent sync misuse
});
