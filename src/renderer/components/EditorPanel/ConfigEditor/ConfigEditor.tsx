import React from "react";
import CodeEditor from "../CodeEditor/CodeEditor"
import "./ConfigEditor.scss";
import { ProjectConfig } from "../../../services/Project";

export type ConfigEditorProps = {
    config:ProjectConfig
    onValidChange?:(config:ProjectConfig) => void
    width?:number
}

export type ConfigEditorState = {
    config:ProjectConfig
}

export default function ConfigEditor(props:ConfigEditorProps) {
  
    function onValidChange(code:string){
        if(props.onValidChange){
            const config:ProjectConfig = JSON.parse(code);
            props.onValidChange(config)
        }
    }

    return (
        <div className="ConfigEditor full-space">
            <CodeEditor id="config-editor" className="full-space" width={props.width} mode="json" onValidChange={onValidChange}  code={JSON.stringify(props.config,null,4)} />
        </div>
    )
    
}