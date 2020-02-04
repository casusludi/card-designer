import { remote } from 'electron'


export default function makeConverter(){

    const pdfWindow = new remote.BrowserWindow({
        show: false
    });
    return {
        async convert(html:string){
           await pdfWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
           const data =  await pdfWindow.webContents.printToPDF({});
           return data
        }
    }
}