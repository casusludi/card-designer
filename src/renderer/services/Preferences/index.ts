import { RenderFilter, Project } from "../Project"
import { ProjectSourceType } from "../Project/Sources"
import { firstKeyOfObject } from "../../utils";
import path from 'path';
import _ from "lodash";

const PREF_KEY = 'preferences';

export type LayoutPreferences = {
    editorWidth:number
}

export type ExportPreferences = {
    selectedLayoutId:string|null|undefined
    selectedSourceType:ProjectSourceType
    selectedCardTypes:Array<string>
    exportFolderPath:string|null|undefined
}

export type AllExportPreferences = {
    [projectPath:string]:ExportPreferences
}

export type EditorPreferences = {
    autoRenderFilter:RenderFilter
}

export type Preferences = {
    layout:LayoutPreferences,
    editor:EditorPreferences,
    export:AllExportPreferences
}


export function savePrefInLocalStorage(preferences:Preferences) {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(preferences));
}

export function loadPrefFromLocalStorage() {
    const prefRaw = window.localStorage.getItem(PREF_KEY);
    if (prefRaw) {
        return JSON.parse(prefRaw);
    }
    return null
}

export function createDefaultExportPreferences(project:Project):ExportPreferences{
     return {
         selectedLayoutId: firstKeyOfObject(project.layouts),
         exportFolderPath: project.path?path.join(project.path,'export'):null,
         selectedSourceType: ProjectSourceType.NONE,
         selectedCardTypes: _.keys(project.cardTypes)
     }
}