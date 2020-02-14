
import React from "react";

export type HTMLViewerProps = {
    url:string
}


const mouseEventTrapScript = `
    const { ipcRenderer } = require('electron');

    function eventDistachToHost(event){
        ipcRenderer.sendToHost('webview-event-trap',{
            type: event.type,
            clientX:event.clientX,
            clientY:event.clientY,
        });
    }

    document.addEventListener('click', eventDistachToHost);
    document.addEventListener('mouseup', eventDistachToHost);
    document.addEventListener('mousedown', eventDistachToHost);
    document.addEventListener('mousemove', eventDistachToHost);

`;

const webviewCSS = `
    body{
        background-color: white;
    }
    
    /* scrollbar css : @see /styles/scrollbars.scss */
    ::-webkit-scrollbar {
        width: 8px; 
        height: 8px;
        background-color: rgb(29, 26, 26);
    }

    ::-webkit-scrollbar:hover {
        background-color: #2C2828;
    }

    ::-webkit-scrollbar-thumb {
        background: #bfb1b1;
        -webkit-border-radius: 100px;
    }
    ::-webkit-scrollbar-thumb:active {
        -webkit-border-radius: 100px;
    }

    ::-webkit-scrollbar-corner {
        background-color: rgb(29, 26, 26);
    }
`;


export class HTMLViewer extends React.Component<HTMLViewerProps>{

    private webviewRef:HTMLWebViewElement|null = null;

    onWebViewRef(ref:HTMLWebViewElement){
        if(ref && !this.webviewRef){
            this.webviewRef = ref;
            ref.addEventListener('dom-ready',(e) => {
                // @ts-ignore TS dont recognise webview API
                ref.insertCSS(webviewCSS)
                // @ts-ignore TS dont recognise webview API
                ref.executeJavaScript(mouseEventTrapScript);
            })

            ref.addEventListener('console-message', (e:any) => {
                console.log('[webview] :', e.message)
            })

            ref.addEventListener('ipc-message', (e:any) => {

                if(e.channel == 'webview-event-trap'){
                    const event = e.args[0];
                    const mouseEvent =  new MouseEvent(event.type,{
                        clientX:event.clientX,
                        clientY:event.clientY,
                    });
                    document.dispatchEvent(mouseEvent)
                }
            })
        }
    }

    webviewComp(){
        // create a specific webviewComp function to add a @ts-ignore
        // Electron want a string value to "nodeintegration" and TS want a boolean|undefind value
        // @ts-ignore
        return <webview ref={this.onWebViewRef.bind(this)} nodeintegration="true" className="HTMLViewer_webview full-space" src={this.props.url} ></webview> 
    }

    render(){
        return (
            <div className="HTMLViewer full-space">
                {this.webviewComp()}
            </div>
            
        )
    }
}