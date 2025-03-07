import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL("http://localhost:5173");

  // Manejo del cierre de la ventana principal
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

// Escuchar el evento para abrir la ventana flotante
ipcMain.on("abrir-turno", () => {
  if (!mainWindow) return; // Evita errores si la ventana principal está cerrada

  const turnoWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow, // Solo si mainWindow existe
    modal: true, // Bloquea la interacción con la principal
    alwaysOnTop: true, // Se mantiene en primer plano
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  turnoWindow.loadURL("http://localhost:5173/#/abrir-turno");
  turnoWindow.once("ready-to-show", () => turnoWindow.show());
});
