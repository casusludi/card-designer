import React from "react";
import PDFViewer from "./PDFViewer";
import TabNav, { TabNavItem, TabNavHeaderPosition } from "../Misc/TabNav/TabNav";
import HTMLViewer from "./HTMLViewer";
import { Project } from "../../services/Project";
import { AppUIPreview } from ".";

export type PreviewPanelProps = {
    ui:AppUIPreview
    project:Project|null
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
                    <HTMLViewer url={this.props.ui.htmlUrl} />
                </TabNavItem>
            </TabNav>
      
        )
    }
}