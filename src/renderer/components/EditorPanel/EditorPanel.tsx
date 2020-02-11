import React from "react";
import CodeEditor from "./CodeEditor/CodeEditor"
import TabNav, { TabNavItem } from "../Misc/TabNav/TabNav";
import "./EditorPanel.scss";
import { Project, ProjectConfig } from "../../services/Project";
import ConfigEditor from "./ConfigEditor/ConfigEditor";
import { connect } from "react-redux";
import { ApplicationState } from "../..";
import { Dispatch } from "redux";
import { projectConfigChanged } from "../../redux/project";

export type EditorPanelProps = {
    project:Project|null
    width:number,
    dispatch: Dispatch
}

function EditorPanel(props:EditorPanelProps){

    function onConfigValidChange(config:ProjectConfig){
        props.dispatch(projectConfigChanged({config}));
    }

    return (
        <div className="EditorPanel full-space">
            {props.project?
            <React.Fragment>
                <TabNav className="EditorPanel__Tabs" >
                    <TabNavItem label="Config"><ConfigEditor width={props.width} config={props.project.config} onValidChange={onConfigValidChange} /></TabNavItem>
                    <TabNavItem label="Templates"><CodeEditor id="template-editor" width={props.width} className="full-space" mode="handlebars"  code="<div>Templates editor</div>" /></TabNavItem>
                    <TabNavItem label="Layouts"><CodeEditor id="layout-editor" width={props.width} className="full-space" mode="handlebars"  code="<div>Layouts editor</div>" /></TabNavItem>
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

function mapStateToProps(state: ApplicationState) {
	console.log("EditorPanel::mapStateToProps", state);
	return {
		project: state.project
	}

}

export default connect(
	mapStateToProps
)(EditorPanel)