import React from "react";
import Popover from "../Popover";

import './PopoverInput.scss'
import _ from "lodash";
import Input from "../Input";
import Button from "../Button";


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

    private popover:Popover |null = null;

   
    onValueChange(value:string|number){
        this.setState({
            value
        })
    }

    onValidateButtonClick(){
        if(this.props.onValidate){
            this.props.onValidate(this.state.value);
            
        }
        if(this.popover){
            this.popover.close();
        }
    }

    render(){
        return (
            <Popover opener={this.props.opener} ref={ref => this.popover = ref} >
                <div className="PopoverInput">
                    <Input type={this.props.type} pattern={this.props.pattern} defaultValue={this.props.defaultValue} onChange={ this.onValueChange.bind(this) }/>
                    <Button className="PopoverInput__ValidateButton" fontIcon="fas fa-check" onClick={this.onValidateButtonClick.bind(this)} />
                </div>
            </Popover>
        )
    }
}