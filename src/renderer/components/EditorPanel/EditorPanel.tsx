import React from "react";
import TabNav, { TabNavItem } from "../Misc/TabNav/TabNav";
import "./EditorPanel.scss";
import { Project, ProjectConfig, RenderFilter, ProjectSelection } from "../../services/Project";
import ConfigEditor from "./ConfigEditor/ConfigEditor";
import { connect } from "react-redux";
import { ApplicationState } from "../..";
import { Dispatch } from "redux";
import { projectConfigChanged, projectFileChanged, projectRender } from "../../redux/project";
import _ from "lodash";

import { uiEditorSelectedTemplateChanged, uiEditorSelectedLayoutChanged, uiEditorSelectedSourceTypeChanged } from "../../redux/ui";
import TemplateEditor from "./TemplateEditor/TemplateEditor";
import { ProjectSourceType } from "../../services/Project/Sources";
import { prefAutoRenderFilterChanged } from "../../redux/preferences";
import Select from "../Misc/Select/Select";
import ExportEditor from "./ExportEditor/ExportEditor";
import Checkbox from "../Misc/Checkbox/Checkbox";
import { EditorPreferences } from "../../services/Preferences";


export type EditorPanelProps = {
    project: Project | null
    width: number
    dispatch: Dispatch,
    ui: AppUIEditor,
    editorPreferences: EditorPreferences
}


export type AppUIEditor = {
	selectedSourceType:ProjectSourceType
	selection:ProjectSelection|undefined|null
}


function EditorPanel(props: EditorPanelProps) {

    function onConfigValidChange(config: ProjectConfig) {
        props.dispatch(projectConfigChanged({ config }));
    }

    function selectedTemplateChanged(value:any) {
        console.log("selectedTemplateChanged",value)
        if (props.project) {
            props.dispatch(uiEditorSelectedTemplateChanged({ template: value }))
        }
    }

    function selectedLayoutChanged(value:any) {
        if (props.project) {
            props.dispatch(uiEditorSelectedLayoutChanged({ layout: value }))
        }
    }

    function selectedSourceTypeChanged(value: string) {

        props.dispatch(uiEditorSelectedSourceTypeChanged({ sourceType: value as ProjectSourceType }))

    }

    function onFileChanged(fileId: string, content: string) {
        props.dispatch(projectFileChanged({ fileId, content }));
    }

    function onProjectRender() {
        if (props.ui.selection) {
            props.dispatch(projectRender({ selection: props.ui.selection, filter: RenderFilter.ALL }));
        }
    }

    function onAutoRenderChanged(value:boolean) {
        const filter = value ? RenderFilter.ALL : RenderFilter.NONE;
        props.dispatch(prefAutoRenderFilterChanged({ autoRenderFilter: filter }))
    }

    return (
        <div className="EditorPanel full-space">
            {props.project ?
                <React.Fragment>
                    <TabNav className="EditorPanel__Tabs" >
                        <TabNavItem label="Config">
                            <ConfigEditor width={props.width} config={props.project.config} onValidChange={onConfigValidChange} />
                        </TabNavItem>
                        <TabNavItem label="Template">
                            <TemplateEditor width={props.width} template={props.ui.selection?.template} files={props.project.files} onFileChanged={onFileChanged} />
                        </TabNavItem>
                        <TabNavItem label="Layout">
                            <TemplateEditor width={props.width} template={props.ui.selection?.layout} files={props.project.files} onFileChanged={onFileChanged} />
                        </TabNavItem>
                        <TabNavItem label="Export">
                           <ExportEditor />
                        </TabNavItem>

                    </TabNav>
                    <div className="EditorPanel__ActionBar">
                        {props.ui.selection && !props.ui.selection.data &&
                            <div className="MessagerAlert__error">
                                No data found in source <b>{props.ui.selectedSourceType}</b> for template <b>{props.ui.selection.template?.id}</b>
                            </div>}
                        <div className="EditorPanel__ActionBar-line">
                            <Select id="ActionBar__TemplateSelect-select" label="Template" labelOnTop={true} defaultValue={props.ui.selection?.template} onChange={selectedTemplateChanged} options={_.map(props.project.templates,(o,k)=>({label:k,value:o}))} />
                            <Select id="ActionBar__LayoutSelect-select" label="layout" labelOnTop={true} defaultValue={props.ui.selection?.layout} onChange={selectedLayoutChanged} options={_.map(props.project.layouts,(o,k)=>({label:k,value:o}))} />
                            <Select id="ActionBar__SourceSelect-select" label="Source" labelOnTop={true} defaultValue={props.ui.selectedSourceType} onChange={selectedSourceTypeChanged} options={_.map(props.project.availablesSources,(o,k)=>({label:o,value:o}))} />
               
                            <div className="ActionBar__RenderingBox button-bar">
                                <button type="button" className="button" onClick={onProjectRender}><i className="icon far fa-eye"></i><span>Render</span></button>
                                <Checkbox id="EditorPanelAutoRenderCheckBox" buttonStyle={true} label="Auto" defaultChecked={props.editorPreferences.autoRenderFilter == RenderFilter.ALL} onChange={onAutoRenderChanged} />
                            </div>
                        </div>
                    </div>
                </React.Fragment>
                : <div className="EditorPanel_projectNotFound">
                    No Project Found
            </div>}
        </div>
    )
}

function mapStateToProps(state: ApplicationState) {
    return {
        project: state.project,
        ui: state.ui.editor,
        editorPreferences: state.preferences.editor
    }

}

export default connect(
    mapStateToProps
)(EditorPanel)