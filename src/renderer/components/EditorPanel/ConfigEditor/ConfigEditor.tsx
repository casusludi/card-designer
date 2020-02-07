import React from "react";
import CodeEditor from "../CodeEditor/CodeEditor"
import "./ConfigEditor.scss";
import { ProjectConfig } from "../../../services/Project";

export type ConfigEditorProps = {
    config:ProjectConfig
    onValidChange?:(config:ProjectConfig) => void
}

export type ConfigEditorState = {
    config:ProjectConfig
}

export default class ConfigEditor extends React.Component<ConfigEditorProps,ConfigEditorState> {
    
    state = {
        config: this.props.config
    }

    onValidChange(code:string){
        if(this.props.onValidChange){
            const config:ProjectConfig = JSON.parse(code);
            this.props.onValidChange(config)
        }
    }

    render(){

        return (
            <div className="ConfigEditor full-space">
                <CodeEditor id="config-editor" className="full-space" mode="json" onValidChange={this.onValidChange.bind(this)}  code={JSON.stringify(this.state.config,null,4)} />
            </div>
        )
    }
}