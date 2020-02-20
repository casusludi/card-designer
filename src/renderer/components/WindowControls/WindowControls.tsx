import React, { useState, useEffect, useCallback } from "react";
import './WindowControls.scss';
import { remote } from "electron";


export default function WindowControls(){

    const currentWindow = remote.getCurrentWindow();
    const [state,setState] = useState({isMaximized:currentWindow.isMaximized()});

    const handleWindowMaximizedEvent = useCallback( () => {
        setState({isMaximized:true})
    },[])

    const handleWindowUnMaximizedEvent = useCallback( () => {
        setState({isMaximized:false})
    },[])

    useEffect(()=>{

        if(currentWindow){
          currentWindow.on('maximize',handleWindowMaximizedEvent)
          currentWindow.on('unmaximize',handleWindowUnMaximizedEvent)
        }

        return () => {
            currentWindow.removeListener('maximize',handleWindowMaximizedEvent)
            currentWindow.removeListener('unmaximize',handleWindowUnMaximizedEvent)
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