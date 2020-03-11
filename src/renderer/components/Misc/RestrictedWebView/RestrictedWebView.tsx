import React from "react";
import './RestrictedWebView.scss';
import { remote } from 'electron';
import path from 'path';

export type RestrictedWebViewProps = {
    url: string | null | undefined
    className?:string
    style?:React.CSSProperties
}

const webviewCSS = `
    
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


export default class RestrictedWebView extends React.Component<RestrictedWebViewProps>{

    private webviewRef: HTMLWebViewElement | null = null;

    onWebViewRef(ref: HTMLWebViewElement) {
        if (ref && !this.webviewRef) {
            this.webviewRef = ref;
            ref.addEventListener('dom-ready', (e) => {
                // @ts-ignore TS dont recognise webview API
                ref.insertCSS(webviewCSS)
                // @ts-ignore TS dont recognise webview API
                // ref.openDevTools({mode:'bottom'});
            })

            ref.addEventListener('console-message', (e: any) => {
                //console.log('[webview] :', e.message)
            })

            ref.addEventListener('ipc-message', (e: any) => {

                if (e.channel == 'webview-event-trap') {
                    const event = e.args[0];
                    const bounds = ref.getBoundingClientRect()
                    const mouseEvent = new MouseEvent(event.type, {
                        clientX: bounds.x + event.clientX,
                        clientY: bounds.y + event.clientY,
                    });
                    document.dispatchEvent(mouseEvent)
                }
            })
        }
    }

    render() {
        const preloadPath = path.join(remote.app.getAppPath(),'webview-preload.js');
        return <webview ref={this.onWebViewRef.bind(this)} preload={preloadPath} webpreferences="javascript=no, contextIsolation" style={this.props.style} className={this.props.className} src={this.props.url || undefined} ></webview>
    }
}