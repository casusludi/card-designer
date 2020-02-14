import { createAction, createReducer, combineReducers, PayloadAction } from "@reduxjs/toolkit";
import { RenderFilter } from "../../services/Project";

export type LayoutPreferences = {
    editorWidth:number
}

export type EditorPreferences = {
    autoRenderFilter:RenderFilter
}

export type Preferences = {
    layout:LayoutPreferences,
    editor:EditorPreferences
}

export const prefAutoRenderFilterChanged = createAction<{ autoRenderFilter: RenderFilter }>('pref/AutoRenderFilterChanged');
export const prefEditorWidthChanged = createAction<{ editorWidth: number }>('pref/editorWidthChanged');
export const prefLoadFromLocalStorage = createAction('pref/loadFromLocalStorage');
export const prefLoaded = createAction<{ preferences: Preferences }>('pref/loaded');

const layoutPrefReducer = createReducer<LayoutPreferences>({
    editorWidth: 500
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

export const prefReducer = combineReducers<Preferences>({
    editor: editorPrefReducer,
    layout: layoutPrefReducer
})