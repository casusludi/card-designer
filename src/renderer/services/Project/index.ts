import path from 'path';

import _ from 'lodash';
import {Validator} from 'jsonschema';
import projectSchema from './project.schema.json';
import { EnumDictionary } from '../../../types';
import { ProjectSourceType, getCachedData, createDataFile, getAvailableSources } from './Sources';
import { showOpenDialog, convertHtmlToPdf, writeFile, showSaveDialog } from '../../utils';
import { renderNJKToHtml} from './render';
import fse from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

const CARDMAKER_CONFIG_FILE = 'cardmaker.json';
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
}

export type ProjectConfigLayout = {
    cardsPerPage:number
    template:string
    styles:string
}

export type ProjectDataItem = {
    id: string,
    cards: Array<any>
}

export type ProjectConfig = {
    version:string,
    cardTypes: { [key: string]: ProjectConfigCardType }
    layouts: { [key: string]: ProjectConfigLayout }
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

export type ProjectTemplate = {
    id:string
    template:string
    styles:string
}

export type ProjectLayout = ProjectTemplate & {
    cardsPerPage:number
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
    cardTypes: { [key: string]: ProjectTemplate }
    layouts: { [key: string]: ProjectLayout }
    files:ProjectFiles
    availablesSources: Array<ProjectSourceType>
    data:EnumDictionary<ProjectSourceType,ProjectSourceData>
}

export type ProjectSelection = {
    cardType:ProjectTemplate|undefined|null,
    layout:ProjectTemplate|undefined|null,
    data:ProjectDataItem|undefined|null
}

const schemaValidator = new Validator();

async function loadTemplate(projectPath:string,id:string,template:ProjectConfigCardType,files:{[key:string]:ProjectFile}):Promise<ProjectTemplate>{
   
    if(!files[template.template]){
        const hbsPath = path.join(projectPath, template.template);
        const hbsRawData =  await fse.readFile(hbsPath).catch(() => { throw new Error(`${template.template} missing.`) }); 
        files[template.template] = {
            instanceId: uuidv4(),
            path:template.template,
            content:hbsRawData.toString()
        }
    }
    if(!files[template.styles]){
        const stylesPath = path.join(projectPath, template.styles);
        const stylesRawData =  await fse.readFile(stylesPath).catch(() => { throw new Error(`${template.styles} missing.`) });
        files[template.styles] = {
            instanceId: uuidv4(),
            path:template.styles,
            content:stylesRawData.toString()
        }
    }
    
    return {
        id,
        template:template.template,
        styles:template.styles
    }
}

export async function openProjectFromDialog(): Promise<Project | null> {

    const result = await showOpenDialog({
        title: 'Open Cardmaker Studio Project',
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
    const config: ProjectConfig = JSON.parse(rawData.toString());
    const validationResult = schemaValidator.validate(config,projectSchema);
    if(validationResult.errors.length > 0){
        const messages = _.chain(validationResult.errors)
            .map(e => '• '+e.message)
            .join(`\n`)
            .value();
            throw new Error(`${CARDMAKER_CONFIG_FILE} validation failed : \n${messages}`)
    }
    return await loadProjectFromConfig(config,projectPath,isNew).then( project => {
        window.localStorage.setItem(LAST_PROJECT_PATH_STORAGE_KEY,projectPath);
        return project;
    });
}

export async function loadProjectFromConfig(config:ProjectConfig,projectPath:string,isNew:boolean=false, files:{[key:string]:ProjectFile} = {}){
    const templates = await Promise.all(_.map(config.cardTypes, (o,k) => loadTemplate(projectPath,k,o,files)))
    const layouts = await Promise.all(_.map(config.layouts, (o,k) => loadTemplate(projectPath,k,o,files)))
   
    const name = _.upperFirst(path.basename(projectPath));
    const project: Project = {
        modified: false,
        name,
        isNew,
        path: projectPath,
        config,
        cardTypes: _.keyBy(templates, o => o.id),
        layouts: _.chain(layouts).map(o => ({...o,cardsPerPage:config.layouts[o.id].cardsPerPage})).keyBy(o => o.id).value(),
        files,
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
        title: 'Open Cardmaker Studio Project'
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
        data: data
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
