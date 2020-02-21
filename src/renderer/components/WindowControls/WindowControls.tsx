import React, { useState, useEffect, useCallback } from "react";
import './WindowControls.scss';
import { remote } from "electron";


export default function WindowControls(){

    //const currentWindow = remote.getCurrentWindow();
    const currentWindow = remote.BrowserWindow.getFocusedWindow();
    const [state,setState] = useState({isMaximized:currentWindow?.isMaximized()});

    const handleWindowMaximizedEvent = useCallback( () => {
        setState({isMaximized:true})
    },[])

    const handleWindowUnMaximizedEvent = useCallback( () => {
        setState({isMaximized:false})
    },[])

    useEffect(()=>{
        // declare local variable to close with the same window as start
        // see return () => {}
        const curr = currentWindow;
        if(curr){
            curr.on('maximize',handleWindowMaximizedEvent)
            curr.on('unmaximize',handleWindowUnMaximizedEvent)
        }
        return () => {
            curr?.removeListener('maximize',handleWindowMaximizedEvent)
            curr?.removeListener('unmaximize',handleWindowUnMaximizedEvent)
        }
    });

    return (
        <div className="WindowControls">
            <button className="WindowControls__button" onClick={() => currentWindow?.minimize()} ><i className="codicon codicon-chrome-minimize"></i></button>
            {state.isMaximized && <button className="WindowControls__button" onClick={() => currentWindow?.unmaximize()} ><i className="codicon codicon-chrome-restore"></i></button>}
            {!state.isMaximized && <button className="WindowControls__button" onClick={() => currentWindow?.maximize()}><i className="codicon codicon-chrome-maximize"></i></button>}
            <button className="WindowControls__button" onClick={() => currentWindow?.close()}><i className="codicon codicon-chrome-close"></i></button>
        </div>
    )
}