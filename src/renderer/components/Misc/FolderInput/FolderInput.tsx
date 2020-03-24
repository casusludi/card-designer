import React from "react";
import './FolderInput.scss'
import { showOpenDialog } from "../../../utils";
import Button from "../Button";


export type FolderInputProps = {
    id?:string,
    label?:string
    labelOnTop?:boolean
    path:string|null
    className?:string
    onChange: (path:string) => void
}

export default function FolderInput(props:FolderInputProps){

    async function openExplorer(){
        const result = await showOpenDialog({
            title:"Select Folder",
            properties: ['openDirectory','createDirectory','promptToCreate']
        })
        if (!result.canceled && result.filePaths.length > 0) {
            const folderPath = result.filePaths[0];
            props.onChange(folderPath);
        }
    
    }

    return (
        <div className={"FolderInput"+(props.className?" "+props.className:"")+(props.labelOnTop?" FolderInput_labeltop":"")}>
            {props.label && <label className="FolderInput__label" htmlFor={props.id} >{props.label}</label>}
            <div className="FolderInput__content">
            <input className="FolderInput__input" id={props.id} type="string" value={props.path || ""} onChange={(e)=>props.onChange(e.target.value)} />
            <Button fontIcon="far fa-folder-open" className="FolderInput__button" onClick={openExplorer} />
            </div>
        </div>
    )
}