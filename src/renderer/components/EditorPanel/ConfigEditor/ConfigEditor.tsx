import React from "react";
import CodeEditor from "../CodeEditor/CodeEditor"
import "./ConfigEditor.scss";
import { ProjectConfig } from "../../../services/Project";

export type ConfigEditorProps = {
    config:ProjectConfig
}

export type ConfigEditorState = {
    config:ProjectConfig
}

export default class ConfigEditor extends React.Component<ConfigEditorProps,ConfigEditorState> {
    
    state = {
        config: this.props.config
    }

    render(){

        return (
            <div className="ConfigEditor full-space">
                <CodeEditor id="config-editor" className="full-space" mode="json"  code={JSON.stringify(this.state.config,null,4)} />
            </div>
        )
    }
}