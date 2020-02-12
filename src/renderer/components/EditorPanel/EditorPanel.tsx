import React from "react";
import CodeEditor from "./CodeEditor/CodeEditor"
import TabNav, { TabNavItem, TabNavHeaderPosition } from "../Misc/TabNav/TabNav";
import "./EditorPanel.scss";
import { Project, ProjectConfig } from "../../services/Project";
import ConfigEditor from "./ConfigEditor/ConfigEditor";
import { connect } from "react-redux";
import { ApplicationState } from "../..";
import { Dispatch } from "redux";
import { projectConfigChanged, projectFileChanged } from "../../redux/project";
import _ from "lodash";
import { AppUIEditor } from "../App/App";
import { uiEditorSelectedTemplateChanged, uiEditorSelectedLayoutChanged, uiEditorSelectedSourceTypeChanged } from "../../redux/ui";
import TemplateEditor from "./TemplateEditor/TemplateEditor";
import { ProjectSourceType } from "../../services/Project/Sources";

export type EditorPanelProps = {
    project: Project | null
    width: number
    dispatch: Dispatch,
    ui:AppUIEditor
}

function EditorPanel(props: EditorPanelProps) {

    function onConfigValidChange(config: ProjectConfig) {
        props.dispatch(projectConfigChanged({ config }));
    }

    function selectedTemplateChanged(e:React.ChangeEvent<HTMLSelectElement>){
        if(props.project){
            props.dispatch(uiEditorSelectedTemplateChanged({template:props.project.templates[e.target.value]}))
        }
    }

    function selectedLayoutChanged(e:React.ChangeEvent<HTMLSelectElement>){
        if(props.project){
            props.dispatch(uiEditorSelectedLayoutChanged({layout:props.project.layouts[e.target.value]}))
        }
    }

    function selectedSourceTypeChanged(e:React.ChangeEvent<HTMLSelectElement>){
        if(props.project){
            props.dispatch(uiEditorSelectedSourceTypeChanged({sourceType:e.target.value as ProjectSourceType}))
        }
    }

    function onFileChanged(fileId:string,content:string){
        props.dispatch(projectFileChanged({fileId,content}));
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
                            <TemplateEditor width={props.width} template={props.ui.selectedTemplate} files={props.project.files} onFileChanged={onFileChanged}/>
                        </TabNavItem>
                        <TabNavItem label="Layout">
                            <TemplateEditor width={props.width} template={props.ui.selectedLayout} files={props.project.files} onFileChanged={onFileChanged}/>
                        </TabNavItem>
                       
                    </TabNav>
                    <div className="EditorPanel__ActionBar">

                        <div className="ActionBar__TemplateSelect">
                            <label htmlFor="ActionBar__TemplateSelect">Template : </label>
                            <select id="ActionBar__TemplateSelect-select" defaultValue={props.ui.selectedTemplate?.id} onChange={selectedTemplateChanged}>
                                {_.map(props.project.templates, (t, k) => <option value={t.id}  key={t.id}>{t.id}</option>)}
                            </select>
                        </div>
                        <div className="ActionBar__LayoutSelect">
                            <label htmlFor="ActionBar__LayoutSelect-select">Layout : </label>
                            <select id="ActionBar__LayoutSelect-select" defaultValue={props.ui.selectedLayout?.id} onChange={selectedLayoutChanged}>
                                {_.map(props.project.layouts, (l, k) => <option value={l.id} key={l.id}>{l.id}</option>)}
                            </select>
                        </div>
                        <div className="ActionBar__SourceSelect">
                            <label htmlFor="ActionBar__SourceSelect-select">Source : </label>
                            <select id="ActionBar__SourceSelect-select" defaultValue={props.ui.selectedSourceType} onChange={selectedSourceTypeChanged}>
                                {_.map(ProjectSourceType, (l, k) => <option value={l} key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="ActionBar__RenderingBox">
                            <button type="button" className="button">Render</button>
                            <div className="EditorPanelAutoRenderCheckBox">
                                <label htmlFor="EditorPanelAutoRenderCheckBox">
                                    Auto Rendering:
                                </label>
                                <input type="checkbox" id="EditorPanelAutoRenderCheckBox" name="EditorPanelAutoRenderCheckBox" />
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
        ui: state.ui.editor
    }

}

export default connect(
    mapStateToProps
)(EditorPanel)