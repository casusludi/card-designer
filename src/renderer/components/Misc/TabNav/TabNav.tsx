import React, { ReactNode } from "react"
import './TabNav.scss';
import _ from "lodash";

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
    return <button type="button" className={"TabNavItem__header "+(props.selected?'selected':'')} onClick={e => props.onSelect && props.onSelect(props.index,e)}>{props.children}</button>
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
    onTabChange?:(tab:number) => void
}

export type TabNavState  = {
    currentTab:number
}

export default class TabNav extends React.Component<TabNavProps,TabNavState>{

    static defaultProps = {
        className:"",
        headerPosition: TabNavHeaderPosition.TOP,
        currentTab: 0
    }

    state = {
        currentTab:this.props.currentTab
    }

    componentDidUpdate(prevProps:TabNavProps,prevState:TabNavState){
        if(prevProps.currentTab != this.props.currentTab){
            this.setState({
                currentTab: this.props.currentTab
            })
        }

        if(prevState.currentTab != this.state.currentTab){
           if(this.props.onTabChange){
               this.props.onTabChange(this.state.currentTab);
           }
        }
    }

    render(){
        const tabs = _.filter(this.props.children, o => o as TabNavItem);
        return (
            <div className={"TabNav "+(this.props.className?this.props.className:'')+(this.props.headerPosition == TabNavHeaderPosition.BOTTOM?' TabNav_header-bottom':'')}>
                <div className="TabNav__headers">
                    {tabs.map( (t,i) => (<HeaderButton key={i} index={i} onSelect={(index) => this.setState({currentTab:index})}  selected={this.state.currentTab == i}>{t.props.label}</HeaderButton>))}
                </div>
                <div className="TabNav__contents">
                    {tabs.map( (t,i) => <div className="TabNavItem__content" key={i} style={this.state.currentTab != i?{display:'none'}:{}} >{t}</div>)}
                </div>
            </div>
        )
    }
}



