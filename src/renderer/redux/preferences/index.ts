import { createAction, createReducer, combineReducers, PayloadAction } from "@reduxjs/toolkit";
import { RenderFilter, ProjectSelection } from "../../services/Project";
import { Preferences, ProjectExportPreferences, LayoutPreferences, EditorPreferences, AllProjectPreferences } from "../../services/Preferences";


export const prefAutoRenderFilterChanged = createAction<{ autoRenderFilter: RenderFilter }>('pref/AutoRenderFilterChanged');
export const prefEditorWidthChanged = createAction<{ editorWidth: number }>('pref/editorWidthChanged');
export const prefLoadFromLocalStorage = createAction('pref/loadFromLocalStorage');
export const prefLoaded = createAction<{ preferences: Preferences }>('pref/loaded');
export const prefProjectExportChanged= createAction<{ projectPath:string,preferences: ProjectExportPreferences }>('pref/projectExportChanged');
export const prefProjectSelectionChanged= createAction<{ projectPath:string,selection : ProjectSelection }>('pref/projectSelectionChanged');

const layoutPrefReducer = createReducer<LayoutPreferences>({
    editorWidth: 600
}, {
    [prefLoaded.type]: (state,action:PayloadAction<{  preferences: Preferences }>) => action.payload.preferences.layout,
    [prefEditorWidthChanged.type]: (state,action:PayloadAction<{ editorWidth: number }>) => ({
        ...state,
        editorWidth: action.payload.editorWidth
    })
})

const editorPrefReducer = createReducer<EditorPreferences>({
    autoRenderFilter: RenderFilter.ALL
}, {
    [prefLoaded.type]: (state,action:PayloadAction<{  preferences: Preferences }>) => action.payload.preferences.editor,
    [prefAutoRenderFilterChanged.type]: (state,action:PayloadAction<{ autoRenderFilter: RenderFilter }>) => ({
        ...state,
        autoRenderFilter: action.payload.autoRenderFilter
    })
})

const projectPrefReducer = createReducer<AllProjectPreferences>({}, {
    [prefLoaded.type]: (state,action:PayloadAction<{  preferences: Preferences }>) => action.payload.preferences.projects,
    [prefProjectExportChanged.type] : (state,action:PayloadAction<{ projectPath:string,preferences: ProjectExportPreferences }>) => ({
        ...state,
        [action.payload.projectPath]:{
            ...state[action.payload.projectPath],
            export:action.payload.preferences
        }
    }),
    [prefProjectSelectionChanged.type] : (state,action:PayloadAction<{ projectPath:string,selection : ProjectSelection }>) => ({
        ...state,
        [action.payload.projectPath]:{
            ...state[action.payload.projectPath],
            selection:action.payload.selection
        }
    })
})

export const prefReducer = combineReducers<Preferences>({
    editor: editorPrefReducer,
    layout: layoutPrefReducer,
    projects:projectPrefReducer
})