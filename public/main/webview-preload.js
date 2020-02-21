const { ipcRenderer } = require('electron');

function eventDistachToHost(event){
    ipcRenderer.sendToHost('webview-event-trap',{
        type: event.type,
        clientX:event.clientX,
        clientY:event.clientY,
    });
}

document.addEventListener('click', eventDistachToHost);
document.addEventListener('mouseup', eventDistachToHost);
document.addEventListener('mousedown', eventDistachToHost);
document.addEventListener('mousemove', eventDistachToHost);