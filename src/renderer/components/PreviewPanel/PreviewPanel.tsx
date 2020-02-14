import React from "react";
import PDFViewer from "./PDFViewer/PDFViewer";
import TabNav, { TabNavItem, TabNavHeaderPosition } from "../Misc/TabNav/TabNav";
import { AppUIPreview } from "../App/App";
import { HTMLViewer } from "./HTMLViewer/HTMLViewer";
import { Project } from "../../services/Project";

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
                <TabNavItem label="Final Preview">
                    <PDFViewer src={this.props.ui.pdf} />
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