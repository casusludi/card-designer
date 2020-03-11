
import React from "react";
import './HTMLViewer.scss';
import { remote, BrowserWindow } from 'electron';
import RestrictedWebView  from "../../Misc/RestrictedWebView";

export type HTMLViewerProps = {
    url: string | null | undefined
}

export class HTMLViewer extends React.Component<HTMLViewerProps>{


    private externalWindow:BrowserWindow | null = null;


    openViewInExternalbrowser() {
        if(this.props.url){
            if(!this.externalWindow){

                this.externalWindow = new remote.BrowserWindow({
                    title: 'CardmakerStudio - HTML Preview',
                    show: false,
                    webPreferences:{
                        javascript: false
                    }
                }) 
                this.externalWindow.on('close',() => {
                    this.externalWindow = null
                })               
            }
            this.externalWindow.loadURL(this.props.url);
            this.externalWindow.webContents.openDevTools();
            this.externalWindow.maximize();
            this.externalWindow.show();
        }
    }

    render() {
        return (
            <div className="HTMLViewer full-space">
                {this.props.url ?
                    <React.Fragment>
                        <div className="HTMLViewer__ActionBar">
                            <button className="button" onClick={this.openViewInExternalbrowser.bind(this)}><i className="fas fa-external-link-alt"></i></button>
                        </div>
                        <RestrictedWebView url={this.props.url} className="HTMLViewer_webview" />
                    </React.Fragment>
                    :
                    <div className="HTMLViewer__no">
                        No HTML to preview
                    </div>
                }

            </div>

        )
    }
}