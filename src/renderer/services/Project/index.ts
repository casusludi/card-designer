import { remote } from 'electron';
import path from 'path';

import _ from 'lodash';
import {Validator} from 'jsonschema';
import projectSchema from './project.schema.json';
import { EnumDictionary } from '../../../types';
import { ProjectSourceType, getCachedData, createDataFile } from './Sources';
import { fsreadFile, fswriteFile } from '../../utils';
import {renderHtml} from './render';

const CARDMAKER_CONFIG_FILE = 'cardmaker.json';
const LAST_PROJECT_PATH_STORAGE_KEY = 'project:last:path';

export const PROJECT_CACHE_FOLDER = '.cache';


export type ProjectConfigTemplate = {
    hbs:string
    styles:string
}

export type ProjectDataItem = {
    id: string,
    cards: Array<any>
}

export type ProjectConfig = {
    templates: { [key: string]: ProjectConfigTemplate }
    layouts: { [key: string]: ProjectConfigTemplate }
    sources: {
        gsheets?: {
            sheetId: string
        },
        mockup?:Array<ProjectDataItem>
    }
}

export type ProjectFile = {
    path:string,
    content:string
}

export type ProjectSourceData = {
    type:ProjectSourceType
    cacheFilePath:string|null
    data:Array<ProjectDataItem>
}

export type ProjectTemplate = {
    id:string
    hbs:string
    styles:string
}

// currently the same thing as ProjectTemplate but ProjectTemplate evoluate later
export type ProjectLayout = {
    id:string
    hbs:string
    styles:string
}

export type ProjectFiles = {[key:string]:ProjectFile}

export type Project = {
    name:string,
    modified:boolean,
    path: string,
    config: ProjectConfig,
    templates: { [key: string]: ProjectTemplate }
    layouts: { [key: string]: ProjectLayout }
    files:ProjectFiles
    data:EnumDictionary<ProjectSourceType,ProjectSourceData>
}

export type ProjectSelection = {
    template:ProjectTemplate|undefined|null,
    layout:ProjectLayout|undefined|null,
    data:ProjectDataItem|undefined|null
}

const schemaValidator = new Validator();

async function loadTemplate(projectPath:string,id:string,template:ProjectConfigTemplate,files:{[key:string]:ProjectFile}):Promise<ProjectTemplate>{
   
    if(!files[template.hbs]){
        const hbsPath = path.join(projectPath, template.hbs);
        const hbsRawData =  await fsreadFile(hbsPath).catch(() => { throw new Error(`${template.hbs} missing.`) }); 
        files[template.hbs] = {
            path:hbsPath,
            content:hbsRawData.toString()
        }
    }
    if(!files[template.styles]){
        const stylesPath = path.join(projectPath, template.styles);
        const stylesRawData =  await fsreadFile(stylesPath).catch(() => { throw new Error(`${template.styles} missing.`) });
        files[template.styles] = {
            path:stylesPath,
            content:stylesRawData.toString()
        }
    }
    
    return {
        id,
        hbs:template.hbs,
        styles:template.styles
    }
}

export async function openProjectFromDialog(): Promise<Project | null> {

    const result = await remote.dialog.showOpenDialog({
        title: 'Open Cardmaker Studio Project',
        properties: ["openDirectory"]

    });
    if (!result.canceled && result.filePaths.length > 0) {
        const projectPath = result.filePaths[0];
        return loadProjectFromPath(projectPath);
    }

    return null;
}

export async function openLastProject():Promise<Project|null>{
    const projectPath = window.localStorage.getItem(LAST_PROJECT_PATH_STORAGE_KEY);
    if(projectPath){
        return loadProjectFromPath(projectPath);
    }
    return null;
}

export async function loadProjectFromPath(projectPath:string){
    const configFilePath = path.join(projectPath, CARDMAKER_CONFIG_FILE);
    const rawData =  await fsreadFile(configFilePath).catch(() => { throw new Error(`${CARDMAKER_CONFIG_FILE} missing.`) });
    const config: ProjectConfig = JSON.parse(rawData.toString());
    const validationResult = schemaValidator.validate(config,projectSchema);
    if(validationResult.errors.length > 0){
        const messages = _.chain(validationResult.errors)
            .map(e => '• '+e.message)
            .join(`\n`)
            .value();
            throw new Error(`${CARDMAKER_CONFIG_FILE} validation failed : \n${messages}`)
    }
    return await loadProjectFromConfig(config,projectPath).then( project => {
        window.localStorage.setItem(LAST_PROJECT_PATH_STORAGE_KEY,projectPath);
        return project;
    });
}

export async function loadProjectFromConfig(config:ProjectConfig,projectPath:string, files:{[key:string]:ProjectFile} = {}){
    const templates = await Promise.all(_.map(config.templates, (o,k) => loadTemplate(projectPath,k,o,files)))
    const layouts = await Promise.all(_.map(config.layouts, (o,k) => loadTemplate(projectPath,k,o,files)))
   
    const name = _.upperFirst(path.basename(projectPath));
    const project: Project = {
        modified: false,
        name,
        path: projectPath,
        config,
        templates: _.keyBy(templates, o => o.id),
        layouts: _.keyBy(layouts, o => o.id),
        files,
        data:{}
    }
    const rawCacheData = await Promise.all(_.map(config.sources, (o,k) => getCachedData(project,k)))
    project.data = _.chain(rawCacheData).reject(o => !o).keyBy(o => o?o.type:"UNDEFINED").value();
    return project
}

export async function saveProject(project:Project){
    const projectPath = project.path;
    const configFilePath = path.join(projectPath, CARDMAKER_CONFIG_FILE);
    const configRawData = JSON.stringify(project.config,null,4);
    const filesToSave = _.map(project.files, f => fswriteFile(f.path,f.content))
    filesToSave.push(fswriteFile(configFilePath,configRawData))
    _.forIn(ProjectSourceType,(sourceType) => {
        const file = createDataFile(project,sourceType);
        if(file){
            filesToSave.push(fswriteFile(file.path,file.content));
        }
    });
    return Promise.all(filesToSave)
}

export async function buildProject(project:Project,layoutName:string){

}

export const renderSelectionAsHtml = renderHtml
