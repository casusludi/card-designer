import path from 'path';

import _ from 'lodash';
import {Validator} from 'jsonschema';
import projectSchema from './schemas/project.schema.json';
import { EnumDictionary } from '../../../types';
import { ProjectSourceType, getCachedData, createDataFile, getAvailableSources } from './Sources';
import { showOpenDialog, convertHtmlToPdf, writeFile, showSaveDialog } from '../../utils';
import { renderNJKToHtml} from './render';
import fse from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

export const CARDMAKER_CONFIG_FILE = 'config.json';
const LAST_PROJECT_PATH_STORAGE_KEY = 'project:last:path';

export const PROJECT_CACHE_FOLDER = '.cache';
export const PROJECT_DEFAULT_TEMPLATE_PATH = 'templates/mtg-standard';

export enum RenderFilter {
    NONE,
    PDF,
    HTML,
    ALL
}

export type ProjectConfigCardType = {
    template:string
    styles:string
    base:string
}

export type ProjectConfigLayout = {
    cardsPerPage:number
    template:string
    styles:string
    base:string
}

export type ProjectDataItem = {
    id: string,
    cards: Array<any>
}

export type ProjectConfig = {
    version:string,
    //cardTypes: { [key: string]: ProjectConfigCardType }
    //layouts: { [key: string]: ProjectConfigLayout }
    cardTypes: { [key: string]: string }
    layouts: { [key: string]: string }
    sources: {
        gsheets?: {
            sheetId: string
        },
        json?: {
            path: string|null
        },
        mockup?:Array<ProjectDataItem>
    }
}

export type ProjectFile = {
    instanceId:string
    path:string,
    content:string
}

export type ProjectSourceData = {
    type:ProjectSourceType
    cacheFilePath:string|null
    data:Array<ProjectDataItem>
}

export type ProjectCardType = {
    id:string
    base:string
    config:ProjectConfigCardType
    rawConfig:string
    configPath:string
    template:string|null
    styles:string|null
}

export type ProjectLayout = {
    id:string
    base:string
    config:ProjectConfigLayout
    rawConfig:string
    configPath:string
    template:string|null
    styles:string|null
    cardsPerPage:number
}

export interface ProjectConfigTemplate {
    template:string
    styles:string
    base:string
}

export interface ProjectTemplate {
    id:string
    template:string|null
    styles:string|null
    base:string
}

export enum ProjectExportStatus {
    NONE = "none",
    INIT = "init",
    PROGRESS = "progress",
    COMPLETE = "complete"
}

export type ProjectExportState = {
    status:ProjectExportStatus
    rate:number
}

export type ProjectFiles = {[key:string]:ProjectFile}

export type Project = {
    name:string,
    isNew:boolean,
    modified:boolean,
    path: string,
    config: ProjectConfig,
    rawConfig: string,
    cardTypes: { [key: string]: ProjectCardType }
    layouts: { [key: string]: ProjectLayout }
    files:ProjectFiles
    availablesSources: Array<ProjectSourceType>
    data:EnumDictionary<ProjectSourceType,ProjectSourceData>
}

export type ProjectPageSelection = Array<number>;

export type ProjectSelection = {
    cardType:ProjectCardType|undefined|null,
    layout:ProjectLayout|undefined|null,
    data:ProjectDataItem|undefined|null
    pages:ProjectPageSelection

}

const schemaValidator = new Validator();



async function loadCardTypeFromFile(projectPath:string,configPath:string,id:string,files:{[key:string]:ProjectFile}):Promise<ProjectCardType>{
    const rawConfig = fse.readFileSync(path.join(projectPath,configPath)).toString();
 
    return loadCardType(projectPath, rawConfig, configPath,id,files);
}


export async function loadCardType(projectPath:string, rawConfig:string,configPath:string,id:string,files:{[key:string]:ProjectFile}):Promise<ProjectCardType>{

    const config:ProjectConfigCardType = JSON.parse(rawConfig)
    config.base = path.dirname(configPath);
    
    return {
        id,
        ...await loadTemplate(projectPath,config,id,files),
        config,
        rawConfig,
        configPath
    }
}


async function loadLayoutFromFile(projectPath:string,configPath:string,id:string,files:{[key:string]:ProjectFile}):Promise<ProjectLayout>{
    const rawConfig = fse.readFileSync(path.join(projectPath,configPath)).toString();
 
    return loadLayout(projectPath, rawConfig, configPath,id,files);
}


export async function loadLayout(projectPath:string, rawConfig:string,configPath:string,id:string,files:{[key:string]:ProjectFile}):Promise<ProjectLayout>{

    const config:ProjectConfigLayout = JSON.parse(rawConfig)
    config.base = path.dirname(configPath);
    
    return {
        id,
        ...await loadTemplate(projectPath,config,id,files),
        cardsPerPage:config.cardsPerPage,
        config,
        rawConfig,
        configPath
    }
}

async function loadTemplate(projectPath:string,config:ProjectConfigTemplate,id:string,files:{[key:string]:ProjectFile}):Promise<ProjectTemplate>{

    let templatePathFromProject = null;
    let stylesPathFromProject = null;
    if(!files[config.template]){
        const tplPath = path.join(projectPath,config.base, config.template);
        const tplRawData =  await fse.readFile(tplPath).catch(() => { throw new Error(`${config.template} missing.`) }); 
        templatePathFromProject = path.join(config.base,config.template);
        files[templatePathFromProject] = {
            instanceId: uuidv4(),
            path:templatePathFromProject,
            content:tplRawData.toString()
        }
    }
    if(!files[config.styles]){
        const stylesPath = path.join(projectPath,config.base, config.styles);
        const stylesRawData =  await fse.readFile(stylesPath).catch(() => { throw new Error(`${config.styles} missing.`) });
        stylesPathFromProject = path.join(config.base,config.styles);
        files[stylesPathFromProject] = {
            instanceId: uuidv4(),
            path:stylesPathFromProject,
            content:stylesRawData.toString()
        }
    }

    return {
        id,
        template:templatePathFromProject,
        styles:stylesPathFromProject,
        base: config.base
    }
}

export async function openProjectFromDialog(): Promise<Project | null> {

    const result = await showOpenDialog({
        title: 'Open Card Designer Project',
        properties: ["openDirectory"]

    });
    if (!result.canceled && result.filePaths.length > 0) {
        const projectPath = result.filePaths[0];
        return loadProjectFromPath(projectPath,false);
    }

    return null;
}

export async function openLastProject():Promise<Project|null>{
    const projectPath = window.localStorage.getItem(LAST_PROJECT_PATH_STORAGE_KEY);
    if(projectPath){
        return loadProjectFromPath(projectPath,false);
    }
    return null;
}


export async function loadProjectFromPath(projectPath:string,isNew:boolean=false){
    try{
        await fse.access(projectPath,fse.constants.W_OK | fse.constants.R_OK);
    }catch(e){
        console.log(e)
    }

    const configFilePath = path.join(projectPath, CARDMAKER_CONFIG_FILE);
    const rawData =  await fse.readFile(configFilePath).catch(() => { throw new Error(`${CARDMAKER_CONFIG_FILE} missing.`) });
    const rawConfig = rawData.toString();
   
    return await loadProjectFromConfig(rawConfig,projectPath,isNew).then( project => {
        window.localStorage.setItem(LAST_PROJECT_PATH_STORAGE_KEY,projectPath);
        return project;
    });
}

export async function loadProjectFromConfig(rawConfig:string,projectPath:string,isNew:boolean=false, files:{[key:string]:ProjectFile} = {}){

    const config: ProjectConfig = JSON.parse(rawConfig);

    const validationResult = schemaValidator.validate(config,projectSchema);
    if(validationResult.errors.length > 0){
        const messages = _.chain(validationResult.errors)
            .map(e => '• '+e.message)
            .join(`\n`)
            .value();
            throw new Error(`${CARDMAKER_CONFIG_FILE} validation failed : \n${messages}`)
    }

    const cardTypes = await Promise.all(_.map(config.cardTypes, (o,k) => loadCardTypeFromFile(projectPath,o,k,files)))
    const layouts = await Promise.all(_.map(config.layouts, (o,k) => loadLayoutFromFile(projectPath,o,k,files)))
   
    const name = _.upperFirst(path.basename(projectPath));
    const project: Project = {
        modified: false,
        name,
        isNew,
        path: projectPath,
        config,
        cardTypes: _.keyBy(cardTypes, o => o.id),
        layouts: _.keyBy(layouts, o => o.id),
        files,
        rawConfig:rawConfig,
        availablesSources: getAvailableSources(config),
        data:{}
    }
    const rawCacheData = await Promise.all(_.map(config.sources, (o,k) => getCachedData(project,k)))
    project.data = _.chain(rawCacheData).reject(o => !o).keyBy(o => o?o.type:"UNDEFINED").value();
    return project
}

export async function saveProject(project:Project):Promise<Project|null>{
    
    if(project.isNew){
        return saveProjectAs(project);
    }

    return saveProjectAt(project,project.path);
}

export async function copyProject(project:Project,pathToCopy:string):Promise<Project>{
    await fse.copy(project.path,pathToCopy);
    return await saveProjectAt(project,pathToCopy);
}

async function saveProjectAt(project:Project, projectPath:string):Promise<Project>{
        const configFilePath = path.join(projectPath, CARDMAKER_CONFIG_FILE);
        const configRawData = JSON.stringify(project.config,null,4);
        const filesToSave = _.map(project.files, f => writeFile(path.join(projectPath,f.path),f.content))
        filesToSave.push(writeFile(configFilePath,configRawData))
        _.forIn(ProjectSourceType,(sourceType) => {
            const file = createDataFile(project,sourceType);
            if(file){
                filesToSave.push(writeFile(file.path,file.content));
            }
        });
        await Promise.all(filesToSave);
        window.localStorage.setItem(LAST_PROJECT_PATH_STORAGE_KEY,projectPath);
        return {
            ...project,
            name: _.upperFirst(path.basename(projectPath)),
            path:projectPath,
            modified: false,
            isNew: false
        };
}


export async function saveProjectAs(project:Project):Promise<Project>{
    
    let projectPath = null;

    const result = await showSaveDialog({
        title: 'Open Card Designer Project'
    });

    if (!result.canceled && result.filePath != "") {
        projectPath = result.filePath;
        return copyProject(project,projectPath);
    }
    return project
}

export async function exportProjectStrip(project:Project,templateName:string,layoutId:string,sourceType:ProjectSourceType,exportFolderPath:string){
    const rawData = project.data[sourceType]
    if(!rawData) throw new Error(`No data found from source '${sourceType}'`)
    const data = _.find(rawData.data, o => o.id == templateName);
    if(!data) throw new Error(`No data found for '${templateName}' from source '${sourceType}'`)

    const selection:ProjectSelection = {
        cardType: project.cardTypes[templateName],
        layout: project.layouts[layoutId],
        data: data,
        pages:[]
    }
    const html = await renderSelectionAsHtml(project, selection);
    if(!html){
        throw new Error(`Build failed for template '${templateName}' with layout '${layoutId}'`)
    }
    const pdf = await convertHtmlToPdf(html,project.path);
    await writeFile(path.join(exportFolderPath,layoutId,`${templateName}.pdf`),pdf);
    return true
}

export async function createNewProjectFromTemplate(templatePath:string){
    const project = await loadProjectFromPath(templatePath,true);
    project.isNew = true;
    return project;
}

export const renderSelectionAsHtml = renderNJKToHtml
