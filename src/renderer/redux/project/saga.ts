import { call, put, takeLatest, all, takeEvery, select, delay, throttle } from 'redux-saga/effects';
import { openProjectFromDialog, ProjectSourceData, saveProject, Project, renderSelectionAsHtml, ProjectSelection, RenderFilter, loadProjectFromConfig, ProjectExportStatus, exportProjectStrip, loadProjectFromPath, createNewProjectFromTemplate, saveProjectAs, loadCardTypeFromRawConfig, loadLayoutFromRawConfig, ProjectCardTypeLoadResult, ProjectLayoutLoadResult} from '../../services/Project';

import { fetchData, getSourceAuthType, ProjectSourceType } from '../../services/Project/Sources';
import AppGlobal from '../../AppGlobal';
import { authUserChanged } from '../auth';
import { projectOpenSucceeded, projectOpenCancelled, projectOpenFailed, projectOpenFromDialog, projectDataChanged, projectFetchDataFailed, projectFetchData, projectSavingFailed, projectSaving, projectSaved, projectRender, projectFileChanged, projectRawConfigChanged, projectReloadSucceeded, projectReloadFailed, projectExport, projectExportStateChanged, projectExportFailed, projectFetchDataSucceeded, projectOpenFromPath, projectCreateFromTemplateFailed, projectCreateFromTemplate, projectRenderFailed, projectRendered, projectClosing, projectReady, projectSavingAs, projectConfigChanged, cardTypeChanged, cardTypeChangeFailed, projectLayoutChangeFailed, projectLayoutChanged, cardTypeRawConfigChanged, projectLayoutRawConfigChanged, projectFilesUpdated, cardTypeCanvasChanged } from '.';
import { uiPreviewHtmlUrlChanged, uiPreviewPdfChanged, uiEditorSelectedLayoutChanged, uiEditorSelectedPagesChanged, uiEditorSelectedSourceTypeChanged } from '../ui';
import { convertHtmlToPdf, serveHtml, pathToURL } from '../../utils';
import { ApplicationState } from '../..';
import { ServeOverrides } from '../../../main/serve';
import { AnyAction } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';
import { EditorPreferences } from '../../services/Preferences';

const selectProject = (state: ApplicationState) => state.project;
const selectEditorPreferences = (state: ApplicationState) => state.preferences.editor;

function* saga_projectCreateFromTemplate(action:PayloadAction<{templatePath:string}>){
    try {
        const oldProject: Project = yield select(selectProject);
        const project = yield call(createNewProjectFromTemplate, action.payload.templatePath);
        if (project) {
            if(oldProject){
                yield (put(projectClosing({project:oldProject})))
            }
            yield put(projectOpenSucceeded({ project: project }))
        } else {
            yield put(projectOpenCancelled())
        }
    } catch (e) {
        yield put(projectCreateFromTemplateFailed(e,action))
    }
}

function* saga_openProjectFromDialog(action: any) {
    try {
        const oldProject: Project = yield select(selectProject);
        const project = yield call(openProjectFromDialog);
        if (project) {
            if(oldProject){
                yield (put(projectClosing({project:oldProject})))
            }
            yield put(projectOpenSucceeded({ project: project }))
        } else {
            yield put(projectOpenCancelled())
        }
    } catch (e) {
        yield put(projectOpenFailed(e,action))
    }
}

function* saga_openProjectFromPath(action:PayloadAction<{path:string}>){
    try {
        const oldProject: Project = yield select(selectProject);
        const project = yield call(loadProjectFromPath, action.payload.path);
        if (project) {
            if(oldProject){
                yield (put(projectClosing({project:oldProject})))
            }
            yield put(projectOpenSucceeded({ project: project }))
        } else {
            yield put(projectOpenFailed(new Error(`No project found at ${action.payload.path}`),action))
        }
    } catch (e) {
        yield put(projectOpenFailed(e,action))
    }
}

function* saga_reloadProjectWhenConfigChanged(action:PayloadAction<{noReload:boolean}>){
    if(action.payload.noReload) return;
    try {
        const oldProject: Project = yield select(selectProject);

        const newProject = yield call(loadProjectFromConfig, oldProject.rawConfig,oldProject.path,oldProject.isNew);
        if (newProject) {
            newProject.modified = true;
            yield put(projectReloadSucceeded({ project: newProject }))
        } else {
            yield put(projectReloadFailed(new Error('Project not found')))
        }
        
    } catch (e) {
        yield projectReloadFailed(e,action);
    }
}


function* saga_reloadCardTypeWhenConfigChanged(action:PayloadAction<{id:string,rawConfig:string}>){
    try {
        const project: Project = yield select(selectProject);
        const oldCardType = project.cardTypes[action.payload.id];
        if(!oldCardType){
            yield put(cardTypeChangeFailed(new Error(`Card Type '${action.payload.id}' not found`)))
            return;
        } 

        const result:ProjectCardTypeLoadResult = yield call(loadCardTypeFromRawConfig,project.path, action.payload.rawConfig,oldCardType.configPath,oldCardType.id);

        if (result) {
            const newFiles = _.reduce(result.files,(ret:any,o,k:string) => {
                if(!project.files[k]){
                    ret[k] = o;
                }
                return ret;
            },{})
            if(!_.isEmpty(newFiles))yield put(projectFilesUpdated({ files: newFiles }))
            yield put(cardTypeChanged({ cardType: result.cardType }))
        } else {
           yield put(cardTypeChangeFailed(new Error(`Card Type reloaded'${action.payload.id}' not found`)))
        }
        
    } catch (e) {
        yield cardTypeChangeFailed(e,action);
    }
}

function* saga_reloadLayoutWhenConfigChanged(action:PayloadAction<{id:string,rawConfig:string}>){
    try {
        const project: Project = yield select(selectProject);
        const oldLayout = project.layouts[action.payload.id];
        if(!oldLayout) return;

        const result:ProjectLayoutLoadResult = yield call(loadLayoutFromRawConfig,project.path, action.payload.rawConfig,oldLayout.configPath,oldLayout.id);
        if (result) {
            const newFiles = _.reduce(result.files,(ret:any,o,k:string) => {
                if(!project.files[k]){
                    ret[k] = o;
                }
                return ret;
            },{})
            if(!_.isEmpty(newFiles))yield put(projectFilesUpdated({ files: newFiles }))
            yield put(projectLayoutChanged({ layout: result.layout }))
        } else {
           yield put(projectLayoutChangeFailed(new Error(`Layout '${action.payload.id}' not found`)))
        }
        
    } catch (e) {
        yield projectLayoutChangeFailed(e,action);
    }
}

function* saga_fetchData(action: any) {
    try {
        let user = action.payload.user;
        const authType = getSourceAuthType(action.payload.sourceType);
        if (authType) {
            const auth = AppGlobal.getAuth(authType)
            if (auth) {
                const refreshedUser = yield call(auth.refreshToken);
                user = refreshedUser;
                yield put(authUserChanged({ authType, user: refreshedUser }));
            }
        }

        const data: ProjectSourceData = yield call(fetchData, action.payload.project, action.payload.sourceType, user)
        yield put(projectFetchDataSucceeded({ sourceType: action.payload.sourceType, data }));
        //yield put(projectDataChanged({ sourceType: action.payload.sourceType, data }));

    } catch (e) {
        yield put(projectFetchDataFailed(e,action))
    }
}

function* saga_projectFetchDataSucceeded(action:any){
    yield yield put(projectDataChanged(action.payload));
}

function* saga_saveProject(action: any) {
    try {
        const project: Project = yield select(selectProject);
        if (project.modified || project.isNew) {
            const savedProject = yield call(saveProject, project);
            yield put(projectSaved({project:savedProject}));
        }
    } catch (e) {
        yield projectSavingFailed(e);
    }
}

function* saga_saveProjectAs(action: any) {
    try {
        const project: Project = yield select(selectProject);
        const savedProject = yield call(saveProjectAs, project);
        yield put(projectSaved({project:savedProject}));
        
    } catch (e) {
        yield projectSavingFailed(e);
    }
}


function* saga_renderProjectSelection(action: any) {
    try {
        const selection: ProjectSelection = action.payload.selection;
        const project: Project = yield select(selectProject);
        const filter:RenderFilter = action.payload.filter;
        if (filter != RenderFilter.NONE) {
            const html = yield call(renderSelectionAsHtml,project, action.payload.selection)
            if (html && project && selection && selection.cardTypeId && selection.layoutId) {
                const cardType = project.cardTypes[selection.cardTypeId];
                const layout = project.layouts[selection.layoutId];

                if(cardType && cardType.styles && layout && layout.styles){
                    let templateStylesPath = pathToURL(cardType.styles);
                    let layoutStylesPath = pathToURL(layout.styles);
                    //if (templateStylesPath[0] != '/') templateStylesPath = '/' + templateStylesPath;
                    //if (layoutStylesPath[0] != '/') layoutStylesPath = '/' + layoutStylesPath;

                    console.log(templateStylesPath)
                    const overrides: ServeOverrides = {
                        [templateStylesPath]: project.files[cardType.styles].content,
                        [layoutStylesPath]: project.files[layout.styles].content
                    }
                    const htmlUrl = yield call(serveHtml, "html-preview", html, project.path, overrides)
                    if(filter == RenderFilter.ALL || filter == RenderFilter.HTML){
                        yield put(uiPreviewHtmlUrlChanged({ htmlUrl }));
                    }
                    if(filter == RenderFilter.ALL || filter == RenderFilter.PDF){

                        const t = Date.now();
                        const pdf = yield call(convertHtmlToPdf, html, project.path, overrides)
                        yield put(uiPreviewPdfChanged({ pdf, renderTime:Date.now()-t }))
                    }
                    yield put(projectRendered())
                }
            }
        }
    } catch (e) {
        yield put(projectRenderFailed(e));
    }
}
const editorSelectionSelect = (state: ApplicationState) => state.ui.editor.selection;

function* saga_renderProjectSelectionFromEditor(filter:RenderFilter=RenderFilter.ALL) {
    const selection = yield select(editorSelectionSelect);
    if(selection){
        yield put(projectRender({ selection, filter }));
    }
}

function* saga_autoRenderProjectSelectionFromEditor(action: AnyAction) {
    const preferences: EditorPreferences = yield select(selectEditorPreferences);
    yield saga_renderProjectSelectionFromEditor(preferences.autoRenderFilter);
}

function* saga_renderProjectAtOpening() {
    const selection = yield select(editorSelectionSelect);
    if(selection){
        yield put(projectRender({ selection, filter:RenderFilter.ALL }));
    }
}

function* saga_exportProject(action:PayloadAction<{layoutId:string, sourceType:ProjectSourceType, exportFolderPath:string, cardTypes:Array<string>}>){
    try{
        const project: Project = yield select(selectProject);
        
        yield put(projectExportStateChanged({
            state: {
                status: ProjectExportStatus.INIT,
                rate:0
            }
        }))

        const templateNames = _.chain(project.cardTypes).keys().intersection(action.payload.cardTypes).value();
        for(let i = 0,c = templateNames.length;i<c;i++){
            yield call(exportProjectStrip,project,templateNames[i], action.payload.layoutId, action.payload.sourceType, action.payload.exportFolderPath)
            const rate = ((i+1)/c)*0.9;

            yield put(projectExportStateChanged({
                state: {
                    status: ProjectExportStatus.PROGRESS,
                    rate
                }
            }))
        }

        yield put(projectExportStateChanged({
            state: {
                status: ProjectExportStatus.COMPLETE,
                rate:1
            }
        }))

        yield delay(100);

        yield put(projectExportStateChanged({
            state: {
                status: ProjectExportStatus.NONE,
                rate:0
            }
        }))

   
    }catch(e){
        yield put(projectExportFailed(e));
        yield put(projectExportStateChanged({
            state: {
                status: ProjectExportStatus.NONE,
                rate:0
            }
        }))
    }
}

export default function* projectSaga() {
    yield all([
        yield takeLatest(projectCreateFromTemplate.type, saga_projectCreateFromTemplate),
        yield takeLatest(projectOpenFromDialog.type, saga_openProjectFromDialog),
        yield takeLatest(projectOpenFromPath.type, saga_openProjectFromPath),
        yield takeEvery(projectFetchData.type, saga_fetchData),
        yield takeEvery(projectFetchDataSucceeded.type, saga_projectFetchDataSucceeded),
        yield takeLatest(projectSaving.type, saga_saveProject),
        yield takeLatest(projectSavingAs.type, saga_saveProjectAs),
        yield takeLatest(projectRender.type, saga_renderProjectSelection),
        yield takeLatest(projectReady.type, saga_renderProjectAtOpening),
        yield throttle(1000,[
            projectFileChanged.type,
            projectDataChanged.type,
            cardTypeCanvasChanged.type,
            cardTypeChanged.type,
            uiEditorSelectedLayoutChanged.type,
            uiEditorSelectedSourceTypeChanged.type,
            uiEditorSelectedPagesChanged.type,
        ], saga_autoRenderProjectSelectionFromEditor),
        yield takeLatest([
            projectRawConfigChanged.type,
            projectConfigChanged.type,
        ], saga_reloadProjectWhenConfigChanged),
        yield takeLatest([
            cardTypeRawConfigChanged.type,
        ], saga_reloadCardTypeWhenConfigChanged),
        yield takeLatest([
            projectLayoutRawConfigChanged.type,
        ], saga_reloadLayoutWhenConfigChanged),
        yield takeLatest(projectExport.type, saga_exportProject)
    ])
}