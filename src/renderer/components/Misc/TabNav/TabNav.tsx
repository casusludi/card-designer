import React, { useState, ReactNode } from "react"
import './TabNav.scss';

export enum TabNavHeaderPosition {
    TOP,
    BOTTOM
}

export type HeaderButtonProps = {
    index:number
    children:any
    selected: boolean
    onSelect?: (value: number, event?: any) => void;
}

const HeaderButton = (props:HeaderButtonProps) => {
    return <button className={"TabNavItem__header "+(props.selected?'selected':'')} onClick={e => props.onSelect && props.onSelect(props.index,e)}>{props.children}</button>
}


export type TabNavItemProps  = {
    label:string
    children: ReactNode
}

export class TabNavItem extends React.Component<TabNavItemProps> {

    render(){
        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
    
        )
    }
}

export type TabNavProps  = {
    className:string
    currentTab:number
    headerPosition: TabNavHeaderPosition
    children: Array<any>
}

export default function TabNav(props:TabNavProps){
    const [state,setState] = useState({
        currentTab:props.currentTab
    });

    return (
        <div className={"TabNav "+(props.className?props.className:'')+(props.headerPosition == TabNavHeaderPosition.BOTTOM?' TabNav_header-bottom':'')}>
            <div className="TabNav__headers">
                {props.children.map( (t,i) => (<HeaderButton key={i} index={i} onSelect={(index) => setState({currentTab:index})}  selected={state.currentTab == i}>{t.props.label}</HeaderButton>))}
            </div>
            <div className="TabNav__contents">
                {props.children.map( (t,i) => <div className="TabNavItem__content" key={i} style={state.currentTab != i?{visibility:'hidden'}:{}} >{t}</div>)}
            </div>
        </div>

    )
}

TabNav.defaultProps = {
    className:"",
    headerPosition: TabNavHeaderPosition.TOP,
    currentTab: 0
}

