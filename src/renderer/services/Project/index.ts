import { remote } from 'electron';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import _ from 'lodash';
import {Validator} from 'jsonschema';
import projectSchema from './project.schema.json';
import { EnumDictionary } from '../../../types';
import { ProjectSourceType } from './Sources';

const fsreadFile = promisify(fs.readFile);

const CARDMAKER_CONFIG_FILE = 'cardmaker.json';
const LAST_PROJECT_PATH_STORAGE_KEY = 'project:last:path';

export const PROJECT_CACHE_FOLDER = '.cache';


export type ProjectConfigTemplate = {
    hbs:string
    styles:string
}

export type ProjectConfig = {
    templates: { [key: string]: ProjectConfigTemplate }
    layouts: { [key: string]: ProjectConfigTemplate }
    sources: {
        gsheets?: {
            sheetId: string
        }
    }
}

export type ProjectFile = {
    path:string,
    content:string
}

export type ProjectSourceData = {
    type:ProjectSourceType
    cacheFilePath:string
    data:any
}

export type ProjectTemplate = {
    id:string
    hbs:string
    styles:string
}

export type Project = {
    path: string,
    config: ProjectConfig,
    templates: { [key: string]: ProjectTemplate }
    layouts: { [key: string]: ProjectTemplate }
    files:{[key:string]:ProjectFile}
    sources:EnumDictionary<ProjectSourceType,ProjectSourceData>
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

export async function loadProjectFromConfig(config:ProjectConfig,projectPath:string){
    const files = {};
    const templates = await Promise.all(_.map(config.templates, (o,k) => loadTemplate(projectPath,k,o,files)))
    const layouts = await Promise.all(_.map(config.layouts, (o,k) => loadTemplate(projectPath,k,o,files)))
    const project: Project = {
        path: projectPath,
        config,
        templates: _.keyBy(templates, o => o.id),
        layouts: _.keyBy(layouts, o => o.id),
        files,
        sources:{}
    }
    return project
}