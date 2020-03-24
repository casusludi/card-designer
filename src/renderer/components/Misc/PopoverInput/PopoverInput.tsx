import React from "react";
import Popover from "../Popover";

import './PopoverInput.scss'
import _ from "lodash";
import Input from "../Input";


export type PopoverInputProps = {
    type:string
    opener:(open:(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void) => any
    pattern?:string
    defaultValue:string|number
    onValidate?:(values:string|number) => void
}

export type PopoverInputState = {
    value:string|number
}

export default class PopoverInput extends React.Component<PopoverInputProps,PopoverInputState>{

    state:PopoverInputState = {
        value : this.props.defaultValue
    }

    componentDidUpdate(prevProps:PopoverInputProps){
       /*if(!_.isEqual(this.props.values,prevProps.values)){
            this.setState({
                values: this.props.values
            })
        }*/
    }

    /*onCheckChange(option:SelectOptionsArrayItem,checked:boolean){
        const values = (checked?_.uniq([...this.state.values,option.value]):_.reject(this.state.values,o => o == option.value)) as Array<string|number>;
        this.setState({
            values  
        })
        if(this.props.onChange){
            this.props.onChange(values);
        }
    }*/

    render(){
        return (
            <Popover opener={this.props.opener} >
                <div className="PopoverInput">
                    <Input type={this.props.type} pattern={this.props.pattern} defaultValue={this.props.defaultValue}/>
                </div>
            </Popover>
        )
    }
}