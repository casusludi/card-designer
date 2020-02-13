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
import uuidv1 from "uuid/v1";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { projectSaving } from "../../../redux/project";

export type CodeEditorProps = {
    code: string
    mode: string
    className?: string
    onValidChange?: (code: string) => void
    onChange?: (code: string) => void
    debouncedChangeTime: number
    width?:number,
    dispatch: Dispatch
}

export type CodeEditorState = {
    code: string
    validCode: string | null,
    internalId:string
}

class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState>{

    static defaultProps = {
        debouncedChangeTime: 500
    }

    state = {
        code: this.props.code,
        validCode: null,
        internalId: uuidv1()
    }

    private editor: IEditorProps | null = null;

    private onValidChangeDebounced: ((code: string) => void) | null = null
    private onChangeDebounced: ((code: string) => void) | null = null

    resize(){
        if(this.editor){
            this.editor.resize();
            this.editor.renderer.updateFull();
        }
    }

    onChange(newValue: any) {
        this.setState({ code: newValue })
        if (this.onChangeDebounced) {
            this.onChangeDebounced(newValue);
        }
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

        if (prevProps.code != this.props.code && this.state.code != this.props.code) {
            this.setState({code:this.props.code})
            // hack to clear undo manager.
            // @TODO find a better way to clear undo without delay
            setTimeout(() => {
                if(this.editor){
                    this.editor.getSession().setUndoManager(new UndoManager());
                }
            },1)
            
        }
        
        if ((
            prevProps.onValidChange != this.props.onValidChange
            || prevProps.debouncedChangeTime != this.props.debouncedChangeTime
            || !this.onValidChangeDebounced
        )
            && this.props.onValidChange) {
            this.onValidChangeDebounced = _.debounce(this.props.onValidChange, this.props.debouncedChangeTime);
        }
        if ((
            prevProps.onChange != this.props.onChange
            || prevProps.debouncedChangeTime != this.props.debouncedChangeTime
            || !this.onChangeDebounced
        )
            && this.props.onChange) {
            this.onChangeDebounced = _.debounce(this.props.onChange, this.props.debouncedChangeTime);
        }
        if(this.props.width != prevProps.width){
            this.resize();
        }
    }

    editorOnLoad(editor:IEditorProps){
        this.editor = editor;

        // define project saving, because externals shortcuts dont trigger ine the code panel
        this.editor.commands.addCommand({
            name: 'save',
            bindKey: {win: "ctrl+s", mac: "cmd+s"},
            exec: () => {
                this.props.dispatch(projectSaving())
            }
        })

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
                        onLoad={this.editorOnLoad.bind(this)}
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
                        name={this.state.internalId}
                    />
            </div>
        );
    }
}

export default connect()(CodeEditor);