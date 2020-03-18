import './Select.scss'
import React from 'react'
import _ from 'lodash'
import uuid from 'uuid/v4'
import { InputSize } from '../Input/Input'

export type SelectOptionsArrayItem = { label: string, value: any, disabled?:boolean }
export type SelectOptionsArray = Array<SelectOptionsArrayItem>

export type SelectProps = {
    id?: string
    label?: string
    className?: string
    size?:InputSize
    labelOnTop?: boolean
    value?: any
    options: SelectOptionsArray
    disabled?: boolean
    emptyOption?: SelectOptionsArrayItem
    onChange?: (value: any) => void
}

export type SelectState = {
    id: string
}

export default class Select extends React.Component<SelectProps,SelectState> {

    state = {
        id:this.props.id?this.props.id:uuid()
    }

    render() {
        return (
            <div className={"Select " + (this.props.labelOnTop ? " Select_labeltop" : "") + (this.props.disabled ? " Select_disabled" : "")+ (this.props.size ? " Select_size_"+this.props.size : "")+ (this.props.className ? " "+this.props.className : "")}>
                {this.props.label && <label className="Select__label" htmlFor={this.state.id}>{this.props.label} : </label>}
                <div className="Select__wrapper" >
                    <select id={this.state.id} disabled={this.props.disabled} value={_.findKey(this.props.options, (o: SelectOptionsArrayItem) => o.value == this.props.value) || this.props.emptyOption?.value}
                        onChange={e => {
                            if (this.props.onChange) {
                                const key: number = parseInt(e.target.value);
                                const value: SelectOptionsArrayItem = this.props.options[key];
                                this.props.onChange(value?value.value:this.props.emptyOption?.value);
                                
                            }
                        }}
                    >
                        {this.props.emptyOption && <option disabled={this.props.emptyOption.disabled} value={this.props.emptyOption.value}>{this.props.emptyOption.label}</option>}
                        {_.map(this.props.options, (o: SelectOptionsArrayItem, k) => {

                            return <option disabled={o.disabled} value={k} key={k}>{o.label}</option>
                        })}
                    </select>
                </div>
            </div>
        )
    }
}