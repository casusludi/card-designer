import React from "react";
import CodeEditor from "../CodeEditor/CodeEditor"
import "./ConfigEditor.scss";
import { ProjectConfig, CARDMAKER_CONFIG_FILE } from "../../../services/Project";
import TabNav, { TabNavHeaderPosition, TabNavItem } from "../../Misc/TabNav";
import ConfigFontListEditor from "./ConfigFontListEditor";

export type ConfigEditorProps = {
    instanceId: string
    config: ProjectConfig
    rawConfig: string
    //onValidChange?:(config:ProjectConfig) => void
    onValidChange?: (config: string) => void
    width?: number
}


export default function ConfigEditor(props: ConfigEditorProps) {

    function onValidChange(code: string) {
        if (props.onValidChange) {
            //const config:ProjectConfig = JSON.parse(code);
            props.onValidChange(code)
        }
    }

    return (
        <div className="ConfigEditor full-space">
            <TabNav className="ConfigEditor__Tabs full-space" headerPosition={TabNavHeaderPosition.TOP} >
                <TabNavItem label="Fonts">
                    <ConfigFontListEditor className="full-space" config={props.config} />
                </TabNavItem>
                <TabNavItem label="Raw">
                    <CodeEditor className="full-space" width={props.width} mode="json" onValidChange={onValidChange} code={props.rawConfig} instanceId={props.instanceId} path={CARDMAKER_CONFIG_FILE} />
                </TabNavItem>
            </TabNav>

        </div>
    )

}