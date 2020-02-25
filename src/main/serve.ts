import { BrowserWindow } from 'electron'
import http from 'http';
import uuidv1 from 'uuid/v1';
import fs from 'fs';
import * as path from 'path'
import Cookies from 'cookies';

export type ServeOverrides = { [key: string]: string }

export type Serve = {
    serve: (id: string, html: string, base: string, overrides?: ServeOverrides) => void
    unserve: (id: string) => void
    convertToPdf: (html: string, base: string, overrides?: ServeOverrides) => Promise<Buffer>
    close: () => void
}

const COOKIE_NAME = 'cardmaker-id'

export default async function makeServe(port: number): Promise<Serve> {

    const mapping: { [id: string]: { html: string, base: string, overrides: ServeOverrides } } = {};

    const cookieNames = [COOKIE_NAME]

    const requestListener = function (req: any, res: any) {
        var cookies = new Cookies(req, res, { keys: cookieNames })

        let id = req.url.substring(1).split('?')[0];
        const encoding = 'utf-8';
        let contentType = 'text/html';
        if (mapping[id]) {
            cookies.set(COOKIE_NAME, id)
            res.writeHead(200, { 'Content-Type': contentType });

            res.end(mapping[id].html, encoding);
            return;
        }
        id = cookies.get(COOKIE_NAME);

        if (mapping[id]) {
            const base = mapping[id].base
            const overrides = mapping[id].overrides
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

            if (overrides[req.url]) {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(overrides[req.url], encoding);
            } else if (fs.existsSync(filePath)) {
                fs.readFile(filePath, function (err, data) {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': contentType });
                        res.end('File not found');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data, encoding);
                });
            } else {
                res.writeHead(404, { 'Content-Type': contentType });
                res.end('File not found');
            }
        } else {
            res.writeHead(404, { 'Content-Type': contentType });
            res.end('File not found');
        }
    }

    const server = http.createServer(requestListener);
    server.listen(port);
    console.log(`server listen at ${port}`);

    return {
        serve(id: string, html: string, base: string, overrides?: ServeOverrides) {
            console.log("serve");
            mapping[id] = {
                html,
                base,
                overrides: overrides || {}
            }
        },
        unserve(id: string) {
            delete mapping[id];
        },
        async convertToPdf(html: string, base: string, overrides?: ServeOverrides) {

            const pdfWin = new BrowserWindow({
                show: false,
                webPreferences:{
                    javascript: false
                }
            });
            const id = uuidv1();
            mapping[id] = {
                html,
                base,
                overrides: overrides || {}
            }
            await pdfWin.loadURL(`http://localhost:${port}/${id}`);
            const data = await pdfWin.webContents.printToPDF({ printBackground: true, marginsType:1 });
            delete mapping[id];
            pdfWin.close();
            return data

        },
        close() {
            server.close();
        }
    }
}