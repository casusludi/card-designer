import React from "react";
import PDFViewer from "./PDFViewer/PDFViewer";
import TabNav, { TabNavItem, TabNavHeaderPosition } from "../Misc/TabNav/TabNav";
import { HTMLViewer } from "./HTMLViewer/HTMLViewer";
import { Project } from "../../services/Project";
import { PDFSource } from "./PDFViewer/PDFDocument";

export type PreviewPanelProps = {
    ui:AppUIPreview
    project:Project|null
}

export type AppUIPreview = {
    pdf:PDFSource
    pdfLastRenderTime: number | null
    htmlUrl:string|null
}


export default class PreviewPanel extends React.Component<PreviewPanelProps> {
    
    render(){

        //return (<PDFViewer src={this.props.ui.pdf} />)
        // HTML Preview is not ready yet
        return (
            <TabNav className="full-space" headerPosition={TabNavHeaderPosition.BOTTOM}>
                <TabNavItem label="PDF Preview">
                    <PDFViewer src={this.props.ui.pdf} lastRenderTime={this.props.ui.pdfLastRenderTime}/>
                </TabNavItem>
                <TabNavItem label="HTML Preview">
                    {
                        this.props.ui.htmlUrl && this.props.project ? <HTMLViewer url={this.props.ui.htmlUrl} />
                        : <div>No HTML to view</div>
                    }
                </TabNavItem>
            </TabNav>
      
        )
    }
}