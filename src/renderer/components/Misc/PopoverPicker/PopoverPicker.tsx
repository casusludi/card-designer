import React from "react";
import Popover from "../Popover";
import { SelectOptionsArray, SelectOptionsArrayItem } from "../Select/Select";
import Checkbox from "../Checkbox";
import './PopoverPicker.scss'


export type PopoverPickerProps = {
    options:SelectOptionsArray
    values:Array<string|number>
    onChange?:(values:Array<string|number>) => void
}

export default class PopoverPicker extends React.Component<PopoverPickerProps>{

    onCheckChange(option:SelectOptionsArrayItem,checked:boolean){

    }

    render(){
        return (
            <Popover opener={(show) => <button type="button" className="button button-about button-frameless" onClick={(e) => show(e)}><i className="fas fa-pencil-alt"></i></button>} >
                <div className="PopoverPicker">
                    {this.props.options.map( (o,i) => <Checkbox key={i} label={o.label} defaultChecked={this.props.values.indexOf(o.value) >= 0} onChange={(checked) => this.onCheckChange(o,checked)} />)}
                </div>
            </Popover>
        )
    }
}