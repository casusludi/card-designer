import { ipcRenderer, remote, OpenDialogOptions, SaveDialogOptions } from 'electron'

import fse from 'fs-extra';
import path from 'path';
import _ from 'lodash';

export type ServeOverrides = {[key:string]:string}


export function getSharedVar(name: string): any {
    return remote.getGlobal('sharedVars')[name]
}

export async function convertHtmlToPdf( html: string, base: string,overrides?:ServeOverrides): Promise<Buffer> {
    return ipcRenderer.invoke("html-to-pdf", html, base,overrides);
}

export async function serveHtml(id:string,html:string, base:string,overrides?:ServeOverrides): Promise<string>{
    return ipcRenderer.invoke("serve",id,html,base,overrides)//.then(() => `http://localhost:${getSharedVar('servePort')}/${id}?rnd=${Date.now()}`);
}

export function openDevTools(){
    return ipcRenderer.invoke("open-dev-tools");
}

export function showOpenDialog(options:OpenDialogOptions){
    return ipcRenderer.invoke("show-open-dialog",options)
}

export function showSaveDialog(options:SaveDialogOptions){
    return ipcRenderer.invoke("show-save-dialog",options)
}

export function cssDimensionValue(value: number | undefined | null | string,unit:string='mm'): string {
    if (value === undefined || value === null || value === "auto") return "auto";
    return `${value}${unit}`;
}

export function cssZIndexValue(value: number | undefined | null | "auto",unit:string='mm'): number | "auto" {
    if (value === undefined || value === null || value === "auto") return "auto";
    return value;
}

//export const fsreadFile = promisify(fs.readFile);
//export const fsaccess = promisify(fs.access);



export async function writeFile(p: string, content: any) {
    await fse.mkdirp(path.dirname(p));
    return await fse.writeFile(p, content);
}

export function firstKeyOfObject(obj: Object | undefined | null): any {
    if (!obj) return null;
    return Object.keys(obj)
        .sort()
        .slice(0, 1)[0]
}

export function replacer(text:string, data:{[key:string]:string}) {
    if(!text) return null;
    for(var key in data){
        text = text.replace(key, data[key])
    }
    return text;
}

export function pathToURL(filePath:string):string {
    if (filePath[0] != '/') filePath = '/' + filePath;
    return filePath.replace(/\\\\/g,'/').replace(/\\/g,'/')
}

export function createClassName(staticClasses:string,condClasses:{[key:string]:boolean}={},filteredClasses:Array<string|undefined|null>=[]):string{
    let ret = staticClasses;
    if(!_.isEmpty(condClasses)){
        ret = _.reduce(condClasses,(str,o,k) => {
            if(o && k){
                str += " "+k;
            }
            return str
        },ret)
    }
    if(!_.isEmpty(filteredClasses)){
        ret += " "+_.reject(filteredClasses, o => !o).join(" ");
    }
    return ret;
}
