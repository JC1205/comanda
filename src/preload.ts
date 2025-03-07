import { contextBridge, ipcRenderer } from "electron";

console.log("✅ Preload cargado correctamente");

contextBridge.exposeInMainWorld("electron", {
  abrirTurno: () => {
    console.log("📢 Se llamó a abrirTurno desde Vue");
    ipcRenderer.send("abrir-turno");
  },
});
