import { remote } from 'electron';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import _ from 'lodash';

const fsreadFile = promisify(fs.readFile);

const CARDMAKER_CONFIG_FILE = 'cardmaker.json'

export type ProjectConfigTemplate = {
    hbs:string
    styles:string
}

export type ProjectConfig = {
    templates: { [key: string]: ProjectConfigTemplate }
    layouts: { [key: string]: ProjectConfigTemplate }
    data: {
        gsheets?: {
            sheetId: string
        }
    }
}

export type ProjectFile = {
    path:string,
    content:string
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
}

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
        try {
            const projectPath = result.filePaths[0];
            const configFilePath = path.join(projectPath, CARDMAKER_CONFIG_FILE);
            const rawData =  await fsreadFile(configFilePath).catch(() => { throw new Error(`${CARDMAKER_CONFIG_FILE} missing.`) });
            const config: ProjectConfig = JSON.parse(rawData.toString());
            return await loadProjectFromConfig(config,projectPath);

        } catch (error) {
            remote.dialog.showErrorBox('Invalid Carmaker Project', error.message)
        }
    }

    return null;
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
        files
    }
    return project
}