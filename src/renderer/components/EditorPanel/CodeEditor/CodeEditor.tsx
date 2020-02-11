import React from "react";
import "ace-builds";
import 'ace-builds/webpack-resolver';
import AceEditor, { IEditorProps, IAnnotation } from "react-ace";

import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-handlebars";
import "ace-builds/src-noconflict/theme-pastel_on_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import { UndoManager } from "ace-builds";
import _ from "lodash";
import './CodeEditor.scss';

export type CodeEditorProps = {
    code: string
    mode: string
    id: string
    className?: string
    onValidChange?: (code: string) => void
    debouncedValidationTime: number
    width?:number
}

export type CodeEditorState = {
    code: string
    validCode: string | null
}

export default class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState>{

    static defaultProps = {
        debouncedValidationTime: 500
    }

    state = {
        code: this.props.code,
        validCode: null
    }

    private editor: IEditorProps | null = null;

    private onValidChangeDebounced: ((code: string) => void) | null = null

    resize(){
        if(this.editor){
            this.editor.resize();
            this.editor.renderer.updateFull();
        }
    }

    onChange(newValue: any, e: any) {
        //console.log('onChange', e);
        this.setState({ code: newValue })
    }

    onValidate(annotations: IAnnotation[]) {
        if (this.editor) {
            if (annotations.length == 0) {
                const code = this.editor.getSession().getValue();
                if (code != this.state.validCode) {
                    this.setState({ validCode: code });
                    if (this.onValidChangeDebounced) {
                        this.onValidChangeDebounced(code);
                    }
                }
            }
        }
    }

    componentDidUpdate(prevProps: CodeEditorProps) {
        
        if (prevProps.code != this.props.code && this.editor != null) {
            this.editor.getSession().setUndoManager(new UndoManager());
        }
        if ((
            prevProps.onValidChange != this.props.onValidChange
            || prevProps.debouncedValidationTime != this.props.debouncedValidationTime
            || !this.onValidChangeDebounced
        )
            && this.props.onValidChange) {
            this.onValidChangeDebounced = _.debounce(this.props.onValidChange, this.props.debouncedValidationTime);
        }
        if(this.props.width != prevProps.width){
            this.resize();
        }
    }

    backGroundOnClick() {
        if (this.editor) {
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
                        wrapEnabled={true}
                        width={''}
                        maxLines={Infinity}
                        editorProps={{ $blockScrolling: Infinity }}
                        value={this.state.code}
                        onChange={this.onChange.bind(this)}
                        onValidate={this.onValidate.bind(this)}
                        name={this.props.id}
                    />
            </div>
        );
    }
}