import './ConfigFontListEditor.scss';
import React from 'react';
//@ts-ignore
import fontList from 'font-list';
import { connect } from 'react-redux';
import { ProjectConfig } from '../../../../services/Project';
import _ from 'lodash';
import Select from '../../../Misc/Select';
import { InputSize } from '../../../Misc/Input/Input';
import { createClassName } from '../../../../utils';




export type ConfigFontListEditorProps = {
    config: ProjectConfig
    className?:string
}

export type ConfigFontListEditorStats = {
    systemFontList:string[],
    selectedSystemFont:string|null
}

export class ConfigFontListEditor extends React.Component<ConfigFontListEditorProps,ConfigFontListEditorStats> {

    state:ConfigFontListEditorStats = {
        systemFontList:[],
        selectedSystemFont:null
    }

    async loadSystemFontList(){
        const list = await fontList.getFonts();
        this.setState({
            systemFontList:list
        })
    }

    componentDidMount(){
        this.loadSystemFontList();
    }

    removeFont(font:string){
        const fonts = _.reject(this.props.config.fonts, o => o == font);

        //console.log(fonts)
    }



    render(){
        const projectFontList = _.uniq(this.props.config.fonts) || [];
        const {systemFontList} = this.state;
        //console.log(projectFontList)
        return (
            <div className={createClassName("ConfigFontListEditor",{},[this.props.className])}>
                <div className="ConfigFontListEditor__projectFontList">
                {projectFontList.map(font => 
                    <div key={font} className="ConfigFontListEditor_projectFontItem">
                        <span>{font}</span> <button className="button button-frameless" onClick={() => this.removeFont(font)}><i className="fas fa-times"></i></button>
                    </div>
                )}
                </div>
                <Select size={InputSize.Normal} label="System Fonts" labelOnTop={true} value={this.state.selectedSystemFont} options={_.map(systemFontList, (o, k) => ({ label: o, value: o }))} onChange={ value => this.setState({selectedSystemFont:value})} />
            </div>
        )
    }
}

export default connect()(ConfigFontListEditor);