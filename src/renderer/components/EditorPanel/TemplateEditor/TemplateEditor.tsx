import React from 'react';
import { ProjectTemplate, ProjectFiles } from '../../../services/Project';
import TabNav, { TabNavItem, TabNavHeaderPosition } from '../../Misc/TabNav/TabNav';
import CodeEditor from '../CodeEditor/CodeEditor';

import './TemplateEditor.scss';
import WYSIWYGEditor from '../WYSIWYGEditor';
import Checkbox from '../../Misc/Checkbox';


export type TemplateEditorProps = {
    // currently ProjectTemplate and ProjectLayout are identic. This change later
    template: ProjectTemplate | null | undefined,
    files: ProjectFiles
    width: number,
    onFileChanged: (fileId: string, conte: string) => void
}

export default function TemplateEditor(props: TemplateEditorProps) {
    /*if(props.template){
    console.log("TemplateEditor::render => ",props.template,props.files[props.template.hbs].content)
    }*/
    const templateFile = props.template?props.files[props.template.template]:null;
    const styleFile = props.template?props.files[props.template.styles]:null;
    return (
        <React.Fragment>
            {props.template && templateFile && styleFile ?
                <div className="TemplateEditor full-space">
                    <div className="TemplateEditor__header"><span className="TemplateEditor__header-label">{props.template.id}</span><Checkbox label="Advanced" /></div>
                    <TabNav className="TemplateEditor__Tabs" headerPosition={TabNavHeaderPosition.TOP} >
                        <TabNavItem label="Template"><CodeEditor width={props.width} className="full-space" mode="html" onChange={(code) => props.template && props.onFileChanged(props.template.template, code)} code={templateFile.content} instanceId={templateFile.instanceId} path={props.template.template} /></TabNavItem>
                        <TabNavItem label="Styles"><CodeEditor width={props.width} className="full-space" mode="css" onChange={(code) => props.template && props.onFileChanged(props.template.styles, code)} code={styleFile.content} instanceId={styleFile.instanceId} path={props.template.styles} /></TabNavItem>
                        <TabNavItem label="Canvas"><WYSIWYGEditor /></TabNavItem>
                    </TabNav>
                </div> :
                <div>No Template</div>
            }
        </React.Fragment>
    )
}

