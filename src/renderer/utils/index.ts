import { ipcRenderer, remote } from 'electron'
import fs from 'fs';
import { promisify } from "util";

export function getSharedVar(name:string) : any{
    return remote.getGlobal('sharedVars')[name]
}

export async function convertHtmlToPdf(id:string,html:string,base:string):Promise<Buffer>{
    return ipcRenderer.invoke("html-to-pdf",id,html,base);
}

export const fsreadFile = promisify(fs.readFile);
export const fswriteFile = promisify(fs.writeFile);

export function firstKeyOfObject(obj:Object|undefined|null):any {
    if(!obj) return null;
    return Object.keys(obj)
      .sort() 
      .slice(0, 1)[0]
}
