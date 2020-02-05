import { ipcRenderer, remote } from 'electron'

export function getSharedVar(name:string) : any{
    return remote.getGlobal('sharedVars')[name]
}

export async function convertHtmlToPdf(id:string,html:string,base:string):Promise<Buffer>{
    return ipcRenderer.invoke("html-to-pdf",id,html,base);
}