import { Project } from "../../../services/Project";
import React from "react";
import './ExportEditor.scss';
import Select from "../../Misc/Select/Select";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ApplicationState } from "../../..";
import { ProjectSourceType } from "../../../services/Project/Sources";
import { ExportPreferences, prefProjectExportChanged } from "../../../redux/preferences";
import _ from "lodash";
import FolderInput from "../../Misc/FolderInput/FolderInput";
import { replacer } from "../../../utils";

export type ExportEditorProps = {
    project:Project | null
    preferences:ExportPreferences
    dispatch:Dispatch
} 



function ExportEditor(props:ExportEditorProps){

    function selectedLayoutChanged(value:any) {
        if (props.project) {
            const preferences = {
                ...props.preferences,
                selectedLayoutId : value.id
            }

            props.dispatch(prefProjectExportChanged({
                projectPath:props.project.path,
                preferences
            }))
        }
    }

    function selectedSourceTypeChanged(value: string) {

        if (props.project) {
            const preferences = {
                ...props.preferences,
                selectedSourceType : value as ProjectSourceType
            }

            props.dispatch(prefProjectExportChanged({
                projectPath:props.project.path,
                preferences
            }))
        }

    }

    function exportFolderPathChanged(value: string) {

        if (props.project) {
            const preferences = {
                ...props.preferences,
                exportFolderPath : value
            }

            props.dispatch(prefProjectExportChanged({
                projectPath:props.project.path,
                preferences
            }))
        }

    }

    function exportButtonOnClick(){

    }

    function openFolderButtonOnclick(){

    }

    const pathVariables = {
        '${projectPath}': props.project?.path || '${projectPath}'
    }

    function valueToName(path:string){
        const ret =  replacer(path,_.invert(pathVariables))
        return ret;
    }

    return (
        <div className="ExportEditor full-space">
            <Select id="ExportEditor__LayoutSelect-select" label="layout" labelOnTop={true} defaultValue={props.preferences?.selectedLayoutId && props.project?.layouts[props.preferences.selectedLayoutId]} onChange={selectedLayoutChanged} options={_.map(props.project?.layouts,(o,k)=>({label:k,value:o}))} />
            <Select id="ExportEditor__SourceSelect-select" label="Source" labelOnTop={true} defaultValue={props.preferences?.selectedSourceType} onChange={selectedSourceTypeChanged} options={_.map(ProjectSourceType,(o,k)=>({label:o,value:o}))} />
            <FolderInput path={valueToName(props.preferences.exportFolderPath)} onChange={exportFolderPathChanged} />
            <button type="button" className="button" onClick={exportButtonOnClick}>Export</button>
            <button type="button" className="button" onClick={openFolderButtonOnclick}><i className="icon far fa-folder-open"></i><span>Open Export Folder In Explorer</span></button>
           
        </div>
    )
}

function mapStateToProps(state: ApplicationState) {
    let preferences = state.project?.path ? state.preferences.export[state.project.path]:null;
    if(!preferences){
        preferences = {
            selectedLayoutId:null,
            selectedSourceType: ProjectSourceType.NONE,
            exportFolderPath: state.project?.path || ""
        }
    }
    return {
        project: state.project,
        preferences
    }

}

export default connect(mapStateToProps)(ExportEditor)