import { remote } from 'electron'
const http = require('http');
import fs from 'fs';
import * as path from 'path'

export default async function makeConverter(){

    const pdfWindow = new remote.BrowserWindow({
        show: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    pdfWindow.webContents.openDevTools();

    let getHTMLContent = () => "";

    //@ts-ignore
    const base = __static;
    
    const requestListener = function (req:any, res:any) {
        const file = path.normalize(base + req.url);
        console.log(file);
        if(fs.existsSync(file)){
            console.log("passe")
            fs.readFile(file, function (err,data) {
                if (err) {
                    res.writeHead(200);
                    res.end(getHTMLContent());
                  return;
                }
                res.writeHead(200);
                res.end(data);
              });
        }else{
            res.writeHead(200);
            res.end(getHTMLContent());
        }
    }

    const server = http.createServer(requestListener);


    return {
        async convert(html:string,base:string){

            getHTMLContent = () => html;

            server.listen(1983);
            await pdfWindow.loadURL("http://localhost:1983");
           

            //const url = "data:text/html;charset=utf-8," + encodeURI(html);
            //await pdfWindow.loadURL(url,{baseURLForDataURL:base});
       
            const data =  await pdfWindow.webContents.printToPDF({printBackground:true});
            server.close();
            return data

        }
    }
}