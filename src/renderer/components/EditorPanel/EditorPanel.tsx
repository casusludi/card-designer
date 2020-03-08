import React from "react";
import TabNav, { TabNavItem } from "../Misc/TabNav/TabNav";
import "./EditorPanel.scss";
import { Project, ProjectConfig, RenderFilter, ProjectSelection, ProjectPageSelection } from "../../services/Project";
import ConfigEditor from "./ConfigEditor/ConfigEditor";
import { connect } from "react-redux";
import { ApplicationState } from "../..";
import { Dispatch } from "redux";
import { projectConfigChanged, projectFileChanged, projectRender } from "../../redux/project";
import _ from "lodash";

import { uiEditorSelectedTemplateChanged, uiEditorSelectedLayoutChanged, uiEditorSelectedSourceTypeChanged, uiEditorSelectedPagesChanged } from "../../redux/ui";
import TemplateEditor from "./TemplateEditor/TemplateEditor";
import { ProjectSourceType, countCards } from "../../services/Project/Sources";
import { prefAutoRenderFilterChanged } from "../../redux/preferences";
import Select from "../Misc/Select/Select";
import ExportEditor from "./ExportEditor/ExportEditor";
import Checkbox from "../Misc/Checkbox/Checkbox";
import { EditorPreferences } from "../../services/Preferences";
import PageNav from "../Misc/PageNav/PageNav";

export type EditorPanelProps = {
    project: Project | null
    width: number
    dispatch: Dispatch,
    ui: AppUIEditor,
    editorPreferences: EditorPreferences
}


export type AppUIEditor = {
    selectedSourceType: ProjectSourceType
    selection: ProjectSelection | undefined | null
    lastError: Error | null | undefined
}


function EditorPanel(props: EditorPanelProps) {

    function onConfigValidChange(config: ProjectConfig) {
        props.dispatch(projectConfigChanged({ config }));
    }

    function selectedTemplateChanged(value: any) {
        console.log("selectedTemplateChanged", value)
        if (props.project) {
            props.dispatch(uiEditorSelectedTemplateChanged({ template: value }))
        }
    }

    function selectedLayoutChanged(value: any) {
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

    function onAutoRenderChanged(value: boolean) {
        const filter = value ? RenderFilter.ALL : RenderFilter.NONE;
        props.dispatch(prefAutoRenderFilterChanged({ autoRenderFilter: filter }))
    }

    function onPageNavChanged(selection: ProjectPageSelection) {
        
        props.dispatch(uiEditorSelectedPagesChanged({ pages:selection }))
    }

    function getTotalPages(selection:ProjectSelection|null|undefined){
        if(!selection) return 0;
        if(!selection.layout) return 0;
        if(!selection.data) return 0;
        const cardPerPages = selection.layout.cardsPerPage;
        const cardLength = countCards(selection.data);
        return Math.ceil(cardLength/cardPerPages);
    }

    return (
        <div className="EditorPanel full-space">
            {props.project ?
                <React.Fragment>
                    <TabNav className="EditorPanel__Tabs" >
                        <TabNavItem label="Config">
                            <ConfigEditor width={props.width} config={props.project.config} onValidChange={onConfigValidChange} instanceId={props.project.path} />
                        </TabNavItem>
                        <TabNavItem label="Card Type">
                            <TemplateEditor width={props.width} template={props.ui.selection?.cardType} files={props.project.files} onFileChanged={onFileChanged} />
                        </TabNavItem>
                        <TabNavItem label="Layout">
                            <TemplateEditor width={props.width} template={props.ui.selection?.layout} files={props.project.files} onFileChanged={onFileChanged} />
                        </TabNavItem>
                        <TabNavItem label="Export">
                            <ExportEditor />
                        </TabNavItem>

                    </TabNav>
                    <div className="EditorPanel__ActionBar ContentWithLine">
                        {props.ui.lastError &&
                            <div className="MessagerAlert__error">
                                {props.ui.lastError.message}
                            </div>}
                        {props.ui.selection && !props.ui.selection.data &&
                            <div className="MessagerAlert__error">
                                No data found in source <b>{props.ui.selectedSourceType}</b> for template <b>{props.ui.selection.cardType?.id}</b>
                            </div>}
                        {props.ui.selection && <div className="ContentWithLine__Line">
                            <Select id="ActionBar__TemplateSelect-select" label="Card Type" labelOnTop={true} value={props.ui.selection?.cardType} onChange={selectedTemplateChanged} options={_.map(props.project.cardTypes, (o, k) => ({ label: k, value: o }))} />
                            <Select id="ActionBar__LayoutSelect-select" label="Layout" labelOnTop={true} value={props.ui.selection?.layout} onChange={selectedLayoutChanged} options={_.map(props.project.layouts, (o, k) => ({ label: k, value: o }))} />
                            <Select id="ActionBar__SourceSelect-select" label="Source" labelOnTop={true} value={props.ui.selectedSourceType} onChange={selectedSourceTypeChanged} options={_.map(props.project.availablesSources, (o, k) => ({ label: o, value: o }))} />
                            <div className="ActionBar__RenderingBox button-bar">
                                <button type="button" className="button" onClick={onProjectRender}><i className="icon far fa-eye"></i><span>Render</span></button>
                                <Checkbox id="EditorPanelAutoRenderCheckBox" buttonStyle={true} label="Auto" defaultChecked={props.editorPreferences.autoRenderFilter == RenderFilter.ALL} onChange={onAutoRenderChanged} />
                            </div>
                            
                        </div>}
                        {props.ui.selection && <div className="ContentWithLine__Line ContentWithLine__Line_center">
                            <PageNav onChange={onPageNavChanged} selection={props.ui.selection?.pages || []} total={getTotalPages(props.ui.selection)} />
                        </div>}
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