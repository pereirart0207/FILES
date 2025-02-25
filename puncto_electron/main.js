const { app, BrowserWindow } = require('electron');
const path = require('path'); // Asegúrate de incluir este import

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'icon.ico'), // Usar path.join para mayor seguridad
        webPreferences: {
            nodeIntegration: true,
        },
    });

    win.loadURL('file://' + __dirname + '/index.html'); // Cargar tu archivo HTML
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
