import React from "react";
import './FolderInput.scss'
import { remote } from "electron";

export type FolderInputProps = {
    path:string,
    onChange: (path:string) => void
}

export default function FolderInput(props:FolderInputProps){

    async function openExplorer(){
        const result = await remote.dialog.showOpenDialog({
            title:"Select Folder",
            properties: ['openDirectory','createDirectory','promptToCreate']
        })
        if (!result.canceled && result.filePaths.length > 0) {
            const folderPath = result.filePaths[0];
            props.onChange(folderPath);
        }
    
    }

    return (
        <div className="FolderInput">
            <input type="string" value={props.path} onChange={(e)=>props.onChange(e.target.value)} />
            <button type="button" className="button" onClick={openExplorer}><i className="far fa-folder-open"></i></button>
        </div>
    )
}