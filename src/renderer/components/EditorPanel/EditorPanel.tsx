import React from "react";
import CodeEditor from "./CodeEditor/CodeEditor"
import TabNav, { TabNavItem } from "../Misc/TabNav/TabNav";
import "./EditorPanel.scss";

export default class EditorPanel extends React.Component {
    

    render(){

        return (
            <div className="EditorPanel full-space">

                <TabNav className="EditorPanel__Tabs" >
                    <TabNavItem label="html"><CodeEditor id="template-editor" className="full-space" mode="handlebars"  code="<div>html editor</div>" /></TabNavItem>
                    <TabNavItem label="Settings"><CodeEditor id="template-editor" className="full-space" mode="handlebars"  code="<div>Settings editor</div>" /></TabNavItem>
                </TabNav>
                <div className="EditorPanel__ActionBar">
                    <button type="button" className="button">Render</button>
                    <div className="EditorPanelAutoRenderCheckBox">
                        <label htmlFor="EditorPanelAutoRenderCheckBox">
                            Auto Rendering: 
                        </label>
                        <input type="checkbox" id="EditorPanelAutoRenderCheckBox" name="EditorPanelAutoRenderCheckBox" />
                    </div>
                </div>
            </div>
        )
    }
}