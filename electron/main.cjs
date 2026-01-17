const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, '../public/favicon.ico'), // Ensure you have an icon or remove this line if not
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // Optional if we need it, but for now we might not need a preload if just wrapping.
            // If we leverage localStorage, we don't strictly need nodeIntegration.
        }
    });

    // In production, load the local index.html
    // In dev, usually load localhost, but for this task "Convert... into a Windows desktop application", 
    // we assume we are building for production mostly.

    // We can try to detect dev mode or just default to file loading for the final build.
    // Let's assume production build structure:
    // root/
    //   dist/index.html
    //   electron/main.cjs

    // So path to index.html is ../dist/index.html

    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        // In Development, we might want to load the vite server if running?
        // But the user asked to "Convert existing system". 
        // Let's support both for convenience if I was testing, but for the "Packaging" task, the build matters.
        // Let's stick to loading the file if it exists, or localhost if we were running dev.
        // For simplicity and robustness of the "Offline" requirement:
        // We will default to loading the build file.
        // The user can run `npm run build` then electron.

        // win.loadURL('http://localhost:5173'); // Dev mode
        // Falling back to file for consistency with requirement "Offline".
        const distIndex = path.join(__dirname, '../dist/index.html');
        win.loadFile(distIndex).catch(() => {
            console.log("Could not load dist/index.html. Make sure to run 'npm run build' first.");
        });
    }

    // win.webContents.openDevTools(); // Optional: remove for production
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
