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
    pattern?:string
    defaultValue?:string|number
    value?:string|number
    activated?:boolean
    defaultActivatedValue?:string|number
    desactivatedValue?:string|number|null
    onChange?:(value:string|number|null) => void
}

type ActivableInputState =  {
    id:string
    activated:boolean
    activatedValue:string|number|null|undefined
    value:string|number
}

export default class ActivableInput extends React.Component<ActivableInputProps,ActivableInputState>{

    state = {
        id:this.props.id || uuid(),
        activatedValue:this.props.activated?(this.props.defaultValue || this.props.value):null,
        value:this.props.activated?(this.props.defaultValue || this.props.value || this.props.defaultActivatedValue || ''):this.props.desactivatedValue || '',
        activated: this.props.activated!==undefined?this.props.activated:true
    }

    componentDidUpdate(prevProps:ActivableInputProps){
        if(prevProps.activated != this.props.activated){
            this.setState({
                activated:!!this.props.activated
            })
        }
    }

    onInputChange(value:string|number){
        if(this.props.onChange){
            this.props.onChange(value);
        }
        this.setState({
            value,
            activatedValue:value
        })
    }

    onCheckboxChange(value:boolean){

        let newValue:string|number;
        if(!value){
            newValue = this.props.desactivatedValue?this.props.desactivatedValue:''
        }else{
            newValue = this.state.activatedValue || (this.props.defaultActivatedValue===undefined?'':this.props.defaultActivatedValue);
        }
        
        if(this.props.onChange)this.props.onChange(newValue);
        this.setState({
            activated:value,
            value:newValue
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
                        value={this.state.value}
                        pattern={this.props.pattern}
                        disabled={this.props.disabled || !this.state.activated}
                        onChange={this.onInputChange.bind(this)}
                    />
                    <Checkbox onChange={this.onCheckboxChange.bind(this)} checked={this.state.activated} />
                </div>
            </div>
        )
    }
}
