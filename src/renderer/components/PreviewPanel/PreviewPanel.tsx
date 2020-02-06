import React from "react";
import PDFViewer from "../PDFViewer/PDFViewer";
import TabNav, { TabNavItem, TabNavHeaderPosition } from "../Misc/TabNav/TabNav";
import { PDFSource } from "../PDFViewer/PDFDocument";

export type PreviewPanelProps = {
    finalPreview:PDFSource
}

export default class PreviewPanel extends React.Component<PreviewPanelProps> {
    
    render(){
        return (
            <TabNav className="full-space" headerPosition={TabNavHeaderPosition.BOTTOM}>
                <TabNavItem label="Final Preview">
                    <PDFViewer src={this.props.finalPreview} />
                </TabNavItem>
                <TabNavItem label="HTML Preview">
                    To Implement
                </TabNavItem>
            </TabNav>
      
        )
    }
}