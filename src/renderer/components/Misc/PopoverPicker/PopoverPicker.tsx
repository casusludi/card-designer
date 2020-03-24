import React from "react";
import Popover from "../Popover";
import { SelectOptionsArray, SelectOptionsArrayItem } from "../Select/Select";
import Checkbox from "../Checkbox";
import './PopoverPicker.scss'
import _ from "lodash";


export type PopoverPickerProps = {
    opener:(open:(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void) => any
    options:SelectOptionsArray
    values:Array<string|number>
    onChange?:(values:Array<string|number>) => void
}

export type PopoverPickerState = {
    values:Array<string|number>
}

export default class PopoverPicker extends React.Component<PopoverPickerProps,PopoverPickerState>{

    state:PopoverPickerState = {
        values : this.props.values
    }

    componentDidUpdate(prevProps:PopoverPickerProps){
        if(!_.isEqual(this.props.values,prevProps.values)){
            this.setState({
                values: this.props.values
            })
        }
    }

    onCheckChange(option:SelectOptionsArrayItem,checked:boolean){
        const values = (checked?_.uniq([...this.state.values,option.value]):_.reject(this.state.values,o => o == option.value)) as Array<string|number>;
        this.setState({
            values  
        })
        if(this.props.onChange){
            this.props.onChange(values);
        }
    }

    render(){
        return (
            <Popover opener={this.props.opener} >
                <div className="PopoverPicker">
                    {this.props.options.map( (o:SelectOptionsArrayItem,i) => <Checkbox key={i} label={o.label} checked={this.state.values.indexOf(o.value) >= 0} onChange={(checked) => this.onCheckChange(o,checked)} />)}
                </div>
            </Popover>
        )
    }
}