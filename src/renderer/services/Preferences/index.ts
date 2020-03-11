import { RenderFilter, Project,  ProjectSelection } from "../Project"
import { ProjectSourceType } from "../Project/Sources"
import { firstKeyOfObject } from "../../utils";
import path from 'path';
import _ from "lodash";

const PREF_KEY = 'preferences';

export type LayoutPreferences = {
    editorWidth:number
}

export type ProjectExportPreferences = {
    selectedLayoutId:string|null|undefined
    selectedSourceType:ProjectSourceType
    selectedCardTypes:Array<string>
    exportFolderPath:string|null|undefined
}

export type AllExportPreferences = {
    [projectPath:string]:ProjectExportPreferences
}

/*
export type ProjectSelectionPreference = {
    cardTypeId:string|undefined|null
    layoutId:string|undefined|null
    sourceType:ProjectSourceType
    pages:ProjectPageSelection
}*/

export type EditorPreferences = {
    autoRenderFilter:RenderFilter
}

export type EditorProjectPreferences = {
    selection:ProjectSelection
}

export type ProjectPreferences = {
    selection:ProjectSelection
    export:ProjectExportPreferences
}

export type AllProjectPreferences = {
    [projectPath:string]:ProjectPreferences
}

export type Preferences = {
    layout:LayoutPreferences
    editor:EditorPreferences
    projects:AllProjectPreferences
}


export function savePrefInLocalStorage(preferences:Preferences) {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(preferences));
}

export function loadPrefFromLocalStorage() {
    const prefRaw = window.localStorage.getItem(PREF_KEY);
    if (prefRaw) {
        const pref =  JSON.parse(prefRaw);

        return pref;
    }
    return null
}

export function createDefaultExportPreferences(project:Project):ProjectExportPreferences{
     return {
         selectedLayoutId: firstKeyOfObject(project.layouts),
         exportFolderPath: project.path?path.join(project.path,'export'):null,
         selectedSourceType: ProjectSourceType.NONE,
         selectedCardTypes: _.keys(project.cardTypes)
     }
}