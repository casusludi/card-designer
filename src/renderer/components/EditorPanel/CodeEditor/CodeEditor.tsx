import React from "react";
import "ace-builds";
import 'ace-builds/webpack-resolver';
import AceEditor, { IEditorProps } from "react-ace";

import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-handlebars";
import "ace-builds/src-noconflict/theme-pastel_on_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import { UndoManager } from "ace-builds";

export type CodeEditorProps = {
    code: string
    mode: string
    id: string
    className?: string
}

export type CodeEditorState = {
    code: string
}

export default class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState>{


    state = {
        code: this.props.code
    }

    private editor: IEditorProps | null = null;

    onChange(newValue: any, e: any) {
        console.log('onChange', newValue, e);
        this.setState({ code: newValue })
    }

    componentDidUpdate(prevProps: CodeEditorProps) {
        if (prevProps.code != this.props.code && this.editor != null) {
            this.editor.getSession().setUndoManager(new UndoManager());
        }
    }

    backGroundOnClick() {
        if(this.editor){
            this.editor.gotoLine(this.editor.session.getLength());
            this.editor.focus();
        }
    }

    render() {
        return (
            <div className={"CodeEditor" + (this.props.className ? ' ' + this.props.className : '')}>
                <div className="CodeEditor__background full-space" onClick={this.backGroundOnClick.bind(this)} ></div>
                <AceEditor

                    onLoad={(e => this.editor = e)}
                    mode={this.props.mode}
                    theme="pastel_on_dark"
                    enableBasicAutocompletion={true}
                    enableLiveAutocompletion={true}
                    width='100%'
                    maxLines={Infinity}
                    editorProps={{ $blockScrolling: Infinity }}
                    value={this.state.code}
                    onChange={this.onChange.bind(this)}
                    name={this.props.id}
                />
            </div>
        );
    }
}