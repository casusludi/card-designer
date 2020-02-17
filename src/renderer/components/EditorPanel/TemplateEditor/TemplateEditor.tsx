import React from 'react';
import { ProjectTemplate, ProjectFiles, ProjectLayout } from '../../../services/Project';
import TabNav, { TabNavItem, TabNavHeaderPosition } from '../../Misc/TabNav/TabNav';
import CodeEditor from '../CodeEditor/CodeEditor';


export type TemplateEditorProps = {
    // currently ProjectTemplate and ProjectLayout are identic. This change later
    template: ProjectTemplate | ProjectLayout | null | undefined,
    files: ProjectFiles
    width: number,
    onFileChanged: (fileId: string, conte: string) => void
}

export default function TemplateEditor(props: TemplateEditorProps) {
    /*if(props.template){
    console.log("TemplateEditor::render => ",props.template,props.files[props.template.hbs].content)
    }*/
    return (
        <React.Fragment>
            {props.template ?
                <TabNav className="TemplateEditor__Tabs full-space" headerPosition={TabNavHeaderPosition.TOP} >
                    <TabNavItem label="HTML"><CodeEditor width={props.width} className="full-space" mode="handlebars" onChange={(code) => props.template && props.onFileChanged(props.template.hbs, code)} code={props.files[props.template.hbs].content} /></TabNavItem>
                    <TabNavItem label="Styles"><CodeEditor width={props.width} className="full-space" mode="css" onChange={(code) => props.template && props.onFileChanged(props.template.styles, code)} code={props.files[props.template.styles].content} /></TabNavItem>
                </TabNav> :
                <div>No Template</div>
            }
        </React.Fragment>
    )
}
