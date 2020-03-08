import Input from "../Input"
import React from "react"
import Checkbox from "../Checkbox"
import uuid from "uuid/v4"
import './ActivableInput.scss';

type ActivableInputProps =  {
    type:string
    id?:string
    className?:string
    disabled?:boolean
    label?:string
    labelOnTop?:boolean
    units?:string
    defaultValue?:string|number
    value?:string|number
    activated?:boolean
    onChange?:(value:string|number|null) => void
}

type ActivableInputState =  {
    id:string
    activated:boolean
}

export default class ActivableInput extends React.Component<ActivableInputProps,ActivableInputState>{

    state = {
        id:this.props.id || uuid(),
        activated: this.props.activated!==undefined?this.props.activated:true
    }

    onInputChange(value:string|number|null){
        if(this.props.onChange){
            this.props.onChange(value);
        }
    }

    onCheckboxChange(value:boolean){
        if(this.props.onChange && !value){
            this.props.onChange(null);
        }
        this.setState({
            activated:value
        })
    }
    
    render(){

        return (
            <div className={"ActivableInput"+(this.props.className?' '+this.props.className:'')+(this.props.disabled?' ActivableInput_disabled':'')+(!this.state.activated?' ActivableInput_desactivated':'')+(this.props.labelOnTop?" Input_labeltop":"")}>
                {this.props.label && <label className="ActivableInput__label" htmlFor={this.state.id}>{this.props.label}</label>}
                <div className="ActivableInput__wrapper">
                    <Input 
                        id={this.state.id}  
                        type={this.props.type} 
                        units={this.props.units}
                        defaultValue={this.props.defaultValue}
                        value={this.props.value}
                        disabled={this.props.disabled || !this.state.activated}
                        onChange={this.onInputChange.bind(this)}
                    />
                    <Checkbox onChange={this.onCheckboxChange.bind(this)} defaultChecked={this.state.activated} />
                </div>
            </div>
        )
    }
}
