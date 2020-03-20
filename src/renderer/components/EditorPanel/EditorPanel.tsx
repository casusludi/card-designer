import React from "react";
import TabNav, { TabNavItem } from "../Misc/TabNav/TabNav";
import "./EditorPanel.scss";
import { Project, RenderFilter, ProjectSelection, ProjectPageSelection, getDataBySourceTypeAndCardType } from "../../services/Project";
import ConfigEditor from "./ConfigEditor/ConfigEditor";
import { connect } from "react-redux";
import { ApplicationState } from "../..";
import { Dispatch } from "redux";
import { projectFileChanged, projectRender, projectRawConfigChanged } from "../../redux/project";
import _ from "lodash";

import { uiEditorSelectedCardTypeChanged, uiEditorSelectedLayoutChanged, uiEditorSelectedSourceTypeChanged, uiEditorSelectedPagesChanged } from "../../redux/ui";
import CardTypeEditor from "./CardTypeEditor";
import { ProjectSourceType, countCards } from "../../services/Project/Sources";
import { prefAutoRenderFilterChanged } from "../../redux/preferences";
import Select from "../Misc/Select/Select";
import ExportEditor from "./ExportEditor/ExportEditor";
import Checkbox from "../Misc/Checkbox/Checkbox";
import { EditorPreferences } from "../../services/Preferences";
import PageNav from "../Misc/PageNav/PageNav";
import LayoutEditor from "./LayoutEditor";

export type EditorPanelProps = {
    project: Project | null
    width: number
    dispatch: Dispatch,
    ui: AppUIEditor,
    editorPreferences: EditorPreferences
}


export type AppUIEditor = {
    selection: ProjectSelection | undefined | null
    lastError: Error | null | undefined
}


function EditorPanel(props: EditorPanelProps) {

    function onConfigValidChange(rawConfig: string) {
       // props.dispatch(projectConfigChanged({ config }));
        props.dispatch(projectRawConfigChanged({ rawConfig }));
    }

    function selectedTemplateChanged(value: any) {
        console.log("selectedTemplateChanged", value)
        if (props.project) {
            props.dispatch(uiEditorSelectedCardTypeChanged({ cardTypeId: value }))
        }
    }

    function selectedLayoutChanged(value: any) {
        if (props.project) {
            props.dispatch(uiEditorSelectedLayoutChanged({ layoutId: value }))
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
        if(!selection.layoutId) return 0;
        if(!selection.cardTypeId) return 0;
        if(!selection.sourceType) return 0;
        const {project} = props;
        if(project){
            const layout = project.layouts[selection.layoutId];
            const data = getDataBySourceTypeAndCardType(project,selection.sourceType,selection.cardTypeId);
            if(layout && data){
                const cardPerPages = layout.cardsPerPage;
                const cardLength = countCards(data);
                return Math.ceil(cardLength/cardPerPages);
            }
        }
        return 0
    }

    const data = props.project && props.ui.selection?.sourceType && props.ui.selection.cardTypeId?getDataBySourceTypeAndCardType(props.project,props.ui.selection.sourceType,props.ui.selection.cardTypeId):null;

    return (
        <div className="EditorPanel full-space">
            {props.project ?
                <React.Fragment>
                    <TabNav className="EditorPanel__Tabs" >
                        <TabNavItem label="Config">
                            <ConfigEditor width={props.width} config={props.project.config} rawConfig={props.project.rawConfig} onValidChange={onConfigValidChange} instanceId={props.project.path} />
                        </TabNavItem>
                        <TabNavItem label="Card Type">
                            <CardTypeEditor width={props.width} cardType={props.ui.selection?.cardTypeId?props.project.cardTypes[props.ui.selection?.cardTypeId]:null} files={props.project.files} onFileChanged={onFileChanged} project={props.project} />
                        </TabNavItem>
                        <TabNavItem label="Layout">
                            <LayoutEditor width={props.width} layout={props.ui.selection?.layoutId?props.project.layouts[props.ui.selection?.layoutId]:null} files={props.project.files} onFileChanged={onFileChanged} />
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
                        {props.ui.selection && _.isEmpty(data) &&
                            <div className="MessagerAlert__error">
                                No data found in source <b>{props.ui.selection.sourceType}</b> for Card Type <b>{props.ui.selection.cardTypeId}</b>
                            </div>}
                        {props.ui.selection && <div className="ContentWithLine__Line">
                            <Select id="ActionBar__TemplateSelect-select" label="Card Type" labelOnTop={true} value={props.ui.selection?.cardTypeId} onChange={selectedTemplateChanged} options={_.map(props.project.cardTypes, (o, k) => ({ label: o.config.name || k, value: k }))} />
                            <Select id="ActionBar__LayoutSelect-select" label="Layout" labelOnTop={true} value={props.ui.selection?.layoutId} onChange={selectedLayoutChanged} options={_.map(props.project.layouts, (o, k) => ({ label: o.config.name || k, value: k }))} />
                            <Select id="ActionBar__SourceSelect-select" label="Source" labelOnTop={true} value={props.ui.selection?.sourceType} onChange={selectedSourceTypeChanged} options={_.map(props.project.availablesSources, (o, k) => ({ label: o, value: o }))} />
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