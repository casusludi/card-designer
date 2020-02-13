import { ipcRenderer, remote } from 'electron'
import fs from 'fs';
import mkdirp from 'mkdirp';
import { promisify } from "util";
import path from 'path';

export type ServeOverrides = {[key:string]:string}


export function getSharedVar(name: string): any {
    return remote.getGlobal('sharedVars')[name]
}

export async function convertHtmlToPdf( html: string, base: string,overrides?:ServeOverrides): Promise<Buffer> {
    return ipcRenderer.invoke("html-to-pdf", html, base,overrides);
}

export async function serveHtml(id:string,html:string, base:string,overrides?:ServeOverrides): Promise<string>{
    return ipcRenderer.invoke("serve",id,html,base,overrides).then(() => `http://localhost:${getSharedVar('servePort')}/${id}`);
}

export const fsreadFile = promisify(fs.readFile);

const _fswriteFile = promisify(fs.writeFile);

export async function fswriteFile(p: string, content: any) {
    await mkdirp(path.dirname(p));
    return await _fswriteFile(p, content);
}

export function firstKeyOfObject(obj: Object | undefined | null): any {
    if (!obj) return null;
    return Object.keys(obj)
        .sort()
        .slice(0, 1)[0]
}
