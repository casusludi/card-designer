import { ipcRenderer } from 'electron'


export async function convertHtmlToPdf(id:string,html:string,base:string):Promise<Buffer>{
    return ipcRenderer.invoke("html-to-pdf",id,html,base);
}