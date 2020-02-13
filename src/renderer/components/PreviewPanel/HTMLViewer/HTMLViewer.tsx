
import React from "react";

export type HTMLViewerProps = {
    url:string
}



export function HTMLViewer(props:HTMLViewerProps){

    return (
        <div className="HTMLViewer full-space">
            <webview className="HTMLViewer_webview full-space" src={props.url} ></webview> 
        </div>
        
    )
}