import React from "react";
import './FolderInput.scss'

export type FolderInputProps = {

}

export default function FolderInput(props:FolderInputProps){

    return (
        <div className="FolderInput">
            <input type="string" />
            <button type="button" className="button" onClick={()=>{}}><i className="far fa-folder-open"></i></button>
        </div>
    )
}