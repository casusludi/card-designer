import { createAction, createReducer, combineReducers, PayloadAction } from "@reduxjs/toolkit";
import { RenderFilter } from "../../services/Project";
import { Preferences, ExportPreferences, LayoutPreferences, EditorPreferences, AllExportPreferences } from "../../services/Preferences";

export const prefAutoRenderFilterChanged = createAction<{ autoRenderFilter: RenderFilter }>('pref/AutoRenderFilterChanged');
export const prefEditorWidthChanged = createAction<{ editorWidth: number }>('pref/editorWidthChanged');
export const prefLoadFromLocalStorage = createAction('pref/loadFromLocalStorage');
export const prefLoaded = createAction<{ preferences: Preferences }>('pref/loaded');
export const prefProjectExportChanged= createAction<{ projectPath:string,preferences: ExportPreferences }>('pref/projectExportChanged');

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
    autoRenderFilter: RenderFilter.ALL,
}, {
    [prefLoaded.type]: (state,action:PayloadAction<{  preferences: Preferences }>) => action.payload.preferences.editor,
    [prefAutoRenderFilterChanged.type]: (state,action:PayloadAction<{ autoRenderFilter: RenderFilter }>) => ({
        ...state,
        autoRenderFilter: action.payload.autoRenderFilter
    })

})

const exportPrefReducer = createReducer<AllExportPreferences>({}, {
    [prefLoaded.type]: (state,action:PayloadAction<{  preferences: Preferences }>) => action.payload.preferences.export,
    [prefProjectExportChanged.type] : (state,action:PayloadAction<{ projectPath:string,preferences: ExportPreferences }>) => ({
        ...state,
        [action.payload.projectPath]:action.payload.preferences
    })
})

export const prefReducer = combineReducers<Preferences>({
    editor: editorPrefReducer,
    layout: layoutPrefReducer,
    export:exportPrefReducer
})