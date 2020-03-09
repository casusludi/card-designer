import React from 'react';
import { ProjectFiles, ProjectLayout } from '../../../services/Project';
import TabNav, { TabNavItem, TabNavHeaderPosition } from '../../Misc/TabNav/TabNav';
import CodeEditor from '../CodeEditor/CodeEditor';

import './LayoutEditor.scss';

export type LayoutEditorProps = {
    // currently ProjectTemplate and ProjectLayout are identic. This change later
    layout: ProjectLayout | null | undefined,
    files: ProjectFiles
    width: number,
    onFileChanged: (fileId: string, conte: string) => void
}

export default function LayoutEditor(props: LayoutEditorProps) {
    /*if(props.template){
    console.log("LayoutEditor::render => ",props.template,props.files[props.template.hbs].content)
    }*/
    const templateFile = props.layout && props.layout.template ? props.files[props.layout.template] : null;
    const styleFile = props.layout && props.layout.styles ? props.files[props.layout.styles] : null;

    function onConfigChange(rawConfig: string) {

        //props.dispatch(projectRawConfigChanged({ rawConfig }));
    }

    return (
        <React.Fragment>
            {props.layout ?
                <div className="LayoutEditor full-space">
                    <div className="LayoutEditor__header"><span className="LayoutEditor__header-label">{props.layout.id}</span></div>
                    <TabNav className="LayoutEditor__Tabs" headerPosition={TabNavHeaderPosition.TOP} >
                        <TabNavItem label="Config">
                            <CodeEditor className="full-space" width={props.width} mode="json" onValidChange={onConfigChange} code={props.layout.rawConfig} instanceId={props.layout.configPath} path={props.layout.configPath} />
                        </TabNavItem>
                        {templateFile && <TabNavItem label="Template"><CodeEditor width={props.width} className="full-space" mode="html" onChange={(code) => props.layout && props.layout.template && props.onFileChanged(props.layout.template, code)} code={templateFile.content} instanceId={templateFile.instanceId} path={props.layout.template || ''} /></TabNavItem>}
                        {styleFile && <TabNavItem label="Styles"><CodeEditor width={props.width} className="full-space" mode="css" onChange={(code) => props.layout && props.layout.styles && props.onFileChanged(props.layout.styles, code)} code={styleFile.content} instanceId={styleFile.instanceId} path={props.layout.styles || ''} /></TabNavItem>}
                    </TabNav>
                </div> :
                <div>No Template</div>
            }
        </React.Fragment>
    )
}

