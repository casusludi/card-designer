import React from "react";
import CodeEditor from "./CodeEditor/CodeEditor"
import TabNav, { TabNavItem } from "../Misc/TabNav/TabNav";
import "./EditorPanel.scss";
import { Project, ProjectConfig } from "../../services/Project";
import ConfigEditor from "./ConfigEditor/ConfigEditor";

export type EditorPanelProps = {
    project:Project|null
}

export type EditorPanelState = {
    project:Project|null
}

export default class EditorPanel extends React.Component<EditorPanelProps,EditorPanelState> {
    
    state = {
        project: this.props.project
    }

    componentDidUpdate(prevProps:EditorPanelProps){
        if(this.props.project != prevProps.project){
            this.setState({project:this.props.project});
        }
    }

    onConfigValidChange(config:ProjectConfig){
        console.log(config)
    }

    render(){
        return (
            <div className="EditorPanel full-space">
                {this.state.project?
                <React.Fragment>
                    <TabNav className="EditorPanel__Tabs" >
                        <TabNavItem label="Config"><ConfigEditor config={this.state.project.config} onValidChange={this.onConfigValidChange.bind(this)} /></TabNavItem>
                        <TabNavItem label="Templates"><CodeEditor id="template-editor" className="full-space" mode="handlebars"  code="<div>Templates editor</div>" /></TabNavItem>
                        <TabNavItem label="Layouts"><CodeEditor id="layout-editor" className="full-space" mode="handlebars"  code="<div>Layouts editor</div>" /></TabNavItem>
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
                </React.Fragment>
                :<div className="EditorPanel_projectNotFound">
                    No Project Found   
                </div>}
            </div>
        )
    }
}