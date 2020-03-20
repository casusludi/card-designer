import './ConfigFontListEditor.scss';
import React from 'react';
//@ts-ignore
import fontList from 'font-list';
import { connect } from 'react-redux';
import { ProjectConfig } from '../../../../services/Project';
import _ from 'lodash';
import Select from '../../../Misc/Select';
import Input, { InputSize } from '../../../Misc/Input/Input';
import { createClassName } from '../../../../utils';
import Panel from '../../../Misc/Panel';
import { Dispatch } from 'redux';
import { projectConfigChanged } from '../../../../redux/project';




export type ConfigFontListEditorProps = {
    config: ProjectConfig
    className?: string
    dispatch: Dispatch
}

export type ConfigFontListEditorStats = {
    systemFontList: string[],
    selectedSystemFont: string
    selectedWebFont: string
}

export class ConfigFontListEditor extends React.Component<ConfigFontListEditorProps, ConfigFontListEditorStats> {

    state: ConfigFontListEditorStats = {
        systemFontList: [],
        selectedSystemFont: "",
        selectedWebFont: ""
    }

    async loadSystemFontList() {
        const list:string[] = (await fontList.getFonts()).map((o:string) => o.replace(/"/g,""));
        this.setState({
            systemFontList: list,
            selectedSystemFont: _.isEmpty(this.state.selectedSystemFont)?(list[0] || ""):this.state.selectedSystemFont
        })
    }

    componentDidMount() {
        this.loadSystemFontList();
    }

    

    updateConfigFonts(fonts:string[]){
        fonts = fonts.sort();
        if (!_.isEqual(this.props.config.fonts, fonts)) {
            const config: ProjectConfig = {
                ...this.props.config,
                fonts
            }
            this.props.dispatch(projectConfigChanged({ config, noReload: true }))
        }
    }

    addSystemFontToProject() {
        if (_.isEmpty(this.state.selectedSystemFont)) return;
        const fonts = _.uniq([...this.props.config.fonts, this.state.selectedSystemFont]);
        this.updateConfigFonts(fonts);
    }

    addWebFontToProject() {
        if (_.isEmpty(this.state.selectedWebFont)) return;
        const fonts = _.uniq([...this.props.config.fonts, this.state.selectedWebFont]);
        this.updateConfigFonts(fonts);
        this.setState({
            selectedWebFont:""
        })
    }

    removeFontFromProject(font: string) {
        const fonts = _.reject(this.props.config.fonts, o => o == font);
        this.updateConfigFonts(fonts);
    }

    fontIsInProject(font:string):boolean{
        return this.props.config.fonts.indexOf(font) >= 0;
    }

    render() {
        const projectFontList = _.uniq(this.props.config.fonts) || [];
        const { systemFontList } = this.state;
        //console.log(projectFontList)
        return (
            <div className={createClassName("ConfigFontListEditor", {}, [this.props.className])}>
                <Panel className="ConfigFontListEditor__projectFontBox" label="Project's Fonts">
                    <div className="ConfigFontListEditor__projectFontList">
                        {projectFontList.map(font =>
                            <div key={font} className="ConfigFontListEditor_projectFontItem">
                                <span>{font}</span> <button className="button button-frameless" onClick={() => this.removeFontFromProject(font)}><i className="fas fa-times"></i></button>
                            </div>
                        )}
                    </div>
                </Panel>
                <div className="ConfigFontListEditor__Sources">
                    <Panel label="System Fonts">
                        <div className="ConfigFontListEditor__SourceSystem">
                            <button type="button" className="button" onClick={this.loadSystemFontList.bind(this)} ><i className="fas fa-sync"></i></button>
                            <Select size={InputSize.Large} value={this.state.selectedSystemFont} options={_.map(systemFontList, (o, k) => ({ label: o, value: o }))} onChange={value => this.setState({ selectedSystemFont: value })} />
                            <button type="button" className="button" onClick={this.addSystemFontToProject.bind(this)} disabled={this.fontIsInProject(this.state.selectedSystemFont)} >Add to project</button>
                        </div>
                    </Panel>
                    <Panel label="Web Fonts (User defined)">
                        <div className="ConfigFontListEditor__SourceSystem">
                            <Input size={InputSize.Large} type="text" value={this.state.selectedWebFont} onChange={value => this.setState({ selectedWebFont: value.toString() })} />
                            <button type="button" className="button" onClick={this.addWebFontToProject.bind(this)} disabled={this.fontIsInProject(this.state.selectedWebFont)} >Add to project</button>
                        </div>
                    </Panel>
                </div>
            </div>
        )
    }
}

export default connect()(ConfigFontListEditor);