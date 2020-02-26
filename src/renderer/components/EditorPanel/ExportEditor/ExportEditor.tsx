import { Project, ProjectExportStatus, ProjectExportState } from "../../../services/Project";
import React from "react";
import './ExportEditor.scss';
import Select from "../../Misc/Select/Select";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ApplicationState } from "../../..";
import { ProjectSourceType } from "../../../services/Project/Sources";
import { prefProjectExportChanged } from "../../../redux/preferences";
import _ from "lodash";
import FolderInput from "../../Misc/FolderInput/FolderInput";
import { replacer } from "../../../utils";
import { remote } from "electron";
import ProgressBar from "../../Misc/ProgressBar/ProgressBar";
import { projectExport } from "../../../redux/project";
import { ProjectExportPreferences, createDefaultExportPreferences } from "../../../services/Preferences";
import Checkbox from "../../Misc/Checkbox/Checkbox";

export type ExportEditorProps = {
    project: Project | null
    preferences: ProjectExportPreferences | null
    dispatch: Dispatch
    ui: AppUIExport
}

export type AppUIExport = {
    exportProgress: ProjectExportState
}


function ExportEditor(props: ExportEditorProps) {

    function selectedLayoutChanged(value: any) {
        if (props.project && props.preferences) {
            const preferences = {
                ...props.preferences,
                selectedLayoutId: value.id
            }

            props.dispatch(prefProjectExportChanged({
                projectPath: props.project.path,
                preferences
            }))
        }
    }

    function selectedSourceTypeChanged(value: string) {

        if (props.project && props.preferences) {
            const preferences = {
                ...props.preferences,
                selectedSourceType: value as ProjectSourceType
            }

            props.dispatch(prefProjectExportChanged({
                projectPath: props.project.path,
                preferences
            }))
        }

    }

    function exportFolderPathChanged(value: string) {

        if (props.project && props.preferences) {
            const preferences = {
                ...props.preferences,
                exportFolderPath: value
            }

            props.dispatch(prefProjectExportChanged({
                projectPath: props.project.path,
                preferences
            }))
        }

    }

    function cardTypeIsSelected(id:string){
        if(!props.preferences) return false;
        return props.preferences?.selectedCardTypes.indexOf(id) >= 0
    }
    
    function onCardTypeCheckChange(id:string,checked:boolean){
        if (props.project && props.preferences) {

            const selectedCardTypes = [...props.preferences.selectedCardTypes];
            if(checked){
                if(selectedCardTypes.indexOf(id) < 0){
                    selectedCardTypes.push(id);
                }
            }else{
                _.remove(selectedCardTypes,o => o == id);
            }
            const preferences = {
                ...props.preferences,
                selectedCardTypes
            }

            props.dispatch(prefProjectExportChanged({
                projectPath: props.project.path,
                preferences
            }))
        }
    }

    function exportButtonOnClick() {
        if (!props.preferences) return;
        if (!props.preferences.selectedLayoutId) return;
        if (!props.preferences.selectedSourceType) return;
        if (!props.preferences.exportFolderPath) return;
        props.dispatch(projectExport({
            layoutId: props.preferences.selectedLayoutId,
            sourceType: props.preferences.selectedSourceType,
            exportFolderPath: props.preferences.exportFolderPath,
            cardTypes: props.preferences.selectedCardTypes
        }))
    }

    function canExport() {
        if(!props.project || props.project.isNew) return false;
        if (!props.preferences) return false;
        if (!props.preferences.selectedLayoutId) return false;
        if (!props.preferences.selectedSourceType) return false;
        if (props.preferences.selectedSourceType == ProjectSourceType.NONE) return false;
        if (_.isEmpty(props.preferences.exportFolderPath)) return false;
        if (props.preferences.selectedCardTypes.length == 0) return false;
        return props.ui.exportProgress.status == ProjectExportStatus.NONE;
    }

    function openFolderButtonOnclick() {
        if (props.preferences && props.preferences.exportFolderPath) {
            remote.shell.openItem(props.preferences.exportFolderPath);
        }
    }

    const pathVariables = {
        '${projectPath}': props.project?.path || '${projectPath}'
    }

    function valueToName(path: string | null | undefined) {
        if (_.isEmpty(path) || !path) return null;
        const ret = replacer(path, _.invert(pathVariables))
        return ret;
    }

    

    return (
        <div className="ExportEditor full-space">
            {props.project && props.preferences &&
                <React.Fragment>
                    <div className="ExportEditor__line">
                        <Select id="ExportEditor__LayoutSelect-select" label="Layout" labelOnTop={true} value={props.preferences?.selectedLayoutId && props.project?.layouts[props.preferences.selectedLayoutId]} onChange={selectedLayoutChanged} options={_.map(props.project?.layouts, (o, k) => ({ label: k, value: o }))} />
                        <Select id="ExportEditor__SourceSelect-select" label="Source" labelOnTop={true} value={props.preferences?.selectedSourceType} onChange={selectedSourceTypeChanged} options={_.map(props.project.availablesSources, (o, k) => ({ label: o, value: o }))} />
                        <FolderInput className="ExportEditor__FolderInput" label="Export Folder : " labelOnTop={true} path={valueToName(props.preferences.exportFolderPath)} onChange={exportFolderPathChanged} />
                    </div>
                    <div className="ExportEditor__line">
                        Card Types : 
                       {_.map(props.project.cardTypes,(o,k) => (
                           <Checkbox key={k} id={`ExportEditor__CardType_${k}`} defaultChecked={cardTypeIsSelected(k)} label={k} onChange={(v) => onCardTypeCheckChange(k,v)} />
                       ))}
                       
                    </div>
                    <div className="ExportEditor__line">
                        <button type="button" className="button" onClick={exportButtonOnClick} disabled={!canExport()}>Export</button>
                        <ProgressBar className="ExportEditor__ProgressBar" rate={props.ui.exportProgress.rate} spinner={props.ui.exportProgress.status != ProjectExportStatus.NONE} disabled={props.ui.exportProgress.status == ProjectExportStatus.NONE} />
                    </div>
                    <div className="ExportEditor__line ExportEditor__line_end">
                        <button type="button" className="button" onClick={openFolderButtonOnclick} disabled={_.isEmpty(props.preferences.exportFolderPath)}><i className="icon far fa-folder-open"></i><span>Open Export Folder In Explorer</span></button>
                    </div>
                </React.Fragment>
            }
        </div>
    )
}

function mapStateToProps(state: ApplicationState) {
    let preferences = null;
    if (state.project) {
        preferences = state.preferences.projects[state.project.path]?.export;
        if (!preferences) {
            preferences = createDefaultExportPreferences(state.project);
        }
    }

    return {
        project: state.project,
        preferences,
        ui: state.ui.export
    }

}

export default connect(mapStateToProps)(ExportEditor)