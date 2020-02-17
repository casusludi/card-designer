import './Select.scss'
import React from 'react'
import _ from 'lodash'

export type SelectOptionsArrayItem = { label: string, value: any }
export type SelectOptionsArray = Array<SelectOptionsArrayItem>

export type SelectProps = {
    id: string
    label?: string
    defaultValue?: any
    options: SelectOptionsArray
    onChange?: (value: any) => void
}

export default function Select(props: SelectProps) {

    return (
        <div className="Select Select_labeltop">
            {props.label && <label className="Select__label" htmlFor={props.id}>{props.label} : </label>}
            <div className="Select__wrapper" >
                <select id={props.id} defaultValue={_.findKey(props.options, (o: SelectOptionsArrayItem) => o.value == props.defaultValue)}
                    onChange={e => {
                        if (props.onChange) {
                            const key: number = parseInt(e.target.value);
                            const value: SelectOptionsArrayItem = props.options[key];
                            props.onChange(value.value);
                        }
                    }}
                >
                    {_.map(props.options, (o: SelectOptionsArrayItem, k) => {

                        return <option value={k} key={k}>{o.label}</option>
                    })}
                </select>
            </div>
        </div>
    )
}