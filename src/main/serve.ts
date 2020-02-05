import { BrowserWindow } from 'electron'
import http from 'http';
import uuidv1 from 'uuid/v1';
import fs from 'fs';
import * as path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'

export type Serve = {
    serve : (id:string,html:string,base:string) => void
    unserve : (id:string) => void
    convertToPdf : (id:string,html:string,base:string) => Promise<Buffer>
    close : () => void
}

export default async function makeServe(port:number): Promise<Serve>{

    const mapping:{ [id: string] : {html:string,base:string} }  = {};
    const showWindow = false;

    const pdfWindow = new BrowserWindow({
        show: showWindow
    });
    if(isDevelopment && showWindow)pdfWindow.webContents.openDevTools();

    
    
    const requestListener = function (req:any, res:any) {
        let id = req.url.substring(1);
        const encoding = 'utf-8';
        let contentType = 'text/html';
        if(mapping[id]){
            res.writeHead(200,{ 'Content-Type': contentType, 'Set-Cookie':id });
            res.end(mapping[id].html,encoding);
            return;
        }
        id = req.headers.cookie;

        //@ts-ignore
        let base = __static;
        if(mapping[id]){
            base = mapping[id].base
        }
        const filePath = path.normalize(base + req.url);
        const extName = path.extname(filePath);

        switch (extName) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;      
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
        }
        if(fs.existsSync(filePath)){

            fs.readFile(filePath, function (err,data) {
                if (err) {
                    res.writeHead(404,{ 'Content-Type': contentType });
                    res.end('File not found');
                  return;
                }
                res.writeHead(200,{ 'Content-Type': contentType });
                res.end(data,encoding);
              });
        }else{
            res.writeHead(404,{ 'Content-Type': contentType });
            res.end('File not found');
        }
    }

    const server = http.createServer(requestListener);
    server.listen(port);
    console.log(`server listen at ${port}`);

    return {
        serve(id:string,html:string,base:string){
            mapping[id] = {
                html,
                base
            }
        },
        unserve(id:string){
            delete mapping[id];
        },
        async convertToPdf(html:string,base:string){

            const id = uuidv1();
            mapping[id] = {
                html,
                base
            }
            await pdfWindow.loadURL(`http://localhost:${port}/${id}`);
            const data =  await pdfWindow.webContents.printToPDF({printBackground:true});
            delete mapping[id];
            return data

        },
        close(){
            server.close();
            pdfWindow.close();
        }
    }
}