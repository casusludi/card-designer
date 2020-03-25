import React from "react";
import './PathInput.scss'
import { showOpenDialog } from "../../../utils";
import Button from "../Button";
import { PathInputType } from ".";
import { FileFilter } from "electron";

export type PathInputProps = {
    id?:string,
    label?:string
    labelOnTop?:boolean
    type:PathInputType
    defaultPath?:string
    filters?:FileFilter[]
    path:string|null
    className?:string
    onChange: (path:string) => void
}

export default function PathInput(props:PathInputProps){

    function getDialogProperties():any{
        switch(props.type){
            default:
            case PathInputType.Folder: return ['openDirectory','createDirectory','promptToCreate'];
            case PathInputType.File: return ['openFile ','promptToCreate'];
        }
    }

    async function openExplorer(){

        const result = await showOpenDialog({
            title:"Select Folder",
            defaultPath: props.defaultPath,
            filters: props.filters,
            properties: getDialogProperties()
        })
        if (!result.canceled && result.filePaths.length > 0) {
            const folderPath = result.filePaths[0];
            props.onChange(folderPath);
        }
    
    }

    return (
        <div className={"PathInput"+(props.className?" "+props.className:"")+(props.labelOnTop?" PathInput_labeltop":"")}>
            {props.label && <label className="PathInput__label" htmlFor={props.id} >{props.label}</label>}
            <div className="PathInput__content">
            <input className="PathInput__input" id={props.id} type="string" value={props.path || ""} onChange={(e)=>props.onChange(e.target.value)} />
            <Button fontIcon="far fa-folder-open" className="PathInput__button" onClick={openExplorer} />
            </div>
        </div>
    )
}