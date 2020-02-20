import React, { useState, useEffect } from "react";
import './WindowControls.scss';
import { remote, ipcRenderer } from "electron";


export default function WindowControls(){

    const currentWindow = remote.getCurrentWindow();
    const [state,setState] = useState({isMaximized:false});

 
    useEffect(()=>{
        ipcRenderer.invoke('main-window-isMaximized').then((isMaximized) => {
            console.log("isMaximized: ",isMaximized)
            if(state.isMaximized != isMaximized){
                setState({isMaximized})
            }
        });
    })
    

    return (
        <div className="WindowControls">
            currentWindow.isNormal() : {currentWindow?.isNormal()?"true":"false"} |
            currentWindow.isMaximized() : {currentWindow?.isMaximized()?"true":"false"}|
            currentWindow.isMinimized() : {currentWindow?.isMinimized()?"true":"false"} |
            state.isMaximized : {state.isMaximized?"true":"false"} |
            <button className="WindowControls__button" onClick={() => currentWindow?.minimize()} ><i className="codicon codicon-chrome-minimize"></i></button>
            <button className="WindowControls__button" onClick={() => currentWindow?.unmaximize()} ><i className="codicon codicon-chrome-restore"></i></button>
            <button className="WindowControls__button" onClick={() => currentWindow?.maximize()}><i className="codicon codicon-chrome-maximize"></i></button>
            <button className="WindowControls__button" onClick={() => currentWindow?.close()}><i className="codicon codicon-chrome-close"></i></button>
        </div>
    )
}