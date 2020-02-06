import React from "react";
import CodeEditor from "./CodeEditor/CodeEditor"

export default class Editor extends React.Component {
    

    render(){

        return (
            <div>
                <CodeEditor id="template-editor" mode="handlebars"  code="<div>html editor</div>" />
            </div>
        )
    }
}