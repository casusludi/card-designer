import React from "react";
import "ace-builds";
import 'ace-builds/webpack-resolver';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-handlebars";
import "ace-builds/src-noconflict/theme-pastel_on_dark";

export type CodeEditorProps = {
    code: string
    mode: string
    id:string
}

export type CodeEditorState = {
    code: string
}

export default class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState>{


    state = {
        code: this.props.code
    }

    onChange(newValue: any, e: any) {
        console.log('onChange', newValue, e);
        this.setState({code: newValue})
    }

    render() {
        return (
            <AceEditor
                mode={this.props.mode}
                theme="pastel_on_dark"
                enableBasicAutocompletion={true}
                enableLiveAutocompletion={true}
                width='100%'
                maxLines={Infinity}
                editorProps={{$blockScrolling: Infinity}}
                value={this.state.code}
                onChange={this.onChange.bind(this)}
                name={this.props.id}
            />

        );
    }
}