import React from 'react';
import { ProjectFiles, ProjectCardType } from '../../../services/Project';
import TabNav, { TabNavItem, TabNavHeaderPosition } from '../../Misc/TabNav/TabNav';
import CodeEditor from '../CodeEditor/CodeEditor';

import './CardTypeEditor.scss';
import WYSIWYGEditor from '../WYSIWYGEditor';
import { projectCardTypeRawConfigChanged } from '../../../redux/project';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

export type CardTypeEditorProps = {
    // currently ProjectTemplate and ProjectLayout are identic. This change later
    cardType: ProjectCardType | null | undefined,
    files: ProjectFiles
    width: number,
    dispatch: Dispatch,
    onFileChanged: (fileId: string, conte: string) => void
}

function CardTypeEditor(props: CardTypeEditorProps) {

    const templateFile = props.cardType && props.cardType.template ? props.files[props.cardType.template] : null;
    const styleFile = props.cardType && props.cardType.styles ? props.files[props.cardType.styles] : null;

    function onConfigChange(rawConfig: string) {
        if (props.cardType) {
            props.dispatch(projectCardTypeRawConfigChanged({ id: props.cardType.id, rawConfig }));
        }
    }

    return (
        <React.Fragment>
            {props.cardType ?
                <div className="CardTypeEditor full-space">
                    <div className="CardTypeEditor__header"><span className="CardTypeEditor__header-label">{props.cardType.id}</span></div>
                    <TabNav className="CardTypeEditor__Tabs" headerPosition={TabNavHeaderPosition.TOP} >
                        <TabNavItem label="Config">
                            <CodeEditor className="full-space" width={props.width} mode="json" onValidChange={onConfigChange} code={props.cardType.rawConfig} instanceId={props.cardType.configPath} path={props.cardType.configPath} />
                        </TabNavItem>
                        {templateFile && <TabNavItem label="Template"><CodeEditor width={props.width} className="full-space" mode="html" onChange={(code) => props.cardType && props.cardType.template && props.onFileChanged(props.cardType.template, code)} code={templateFile.content} instanceId={templateFile.instanceId} path={props.cardType.template || ''} /></TabNavItem>}
                        {styleFile && <TabNavItem label="Styles"><CodeEditor width={props.width} className="full-space" mode="css" onChange={(code) => props.cardType && props.cardType.styles && props.onFileChanged(props.cardType.styles, code)} code={styleFile.content} instanceId={styleFile.instanceId} path={props.cardType.styles || ''} /></TabNavItem>}
                        <TabNavItem label="Canvas"><WYSIWYGEditor /></TabNavItem>
                    </TabNav>
                </div> :
                <div>No Template</div>
            }
        </React.Fragment>
    )
}

export default connect()(CardTypeEditor)

