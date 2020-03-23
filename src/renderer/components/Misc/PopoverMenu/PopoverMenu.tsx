import React from "react";
import Popover from "../Popover";

import './PopoverMenu.scss'

export type PopoverMenuItem = { label: string, value: any, disabled?:boolean }
export type PopoverMenuItemList = Array<PopoverMenuItem>

export type PopoverMenuProps = {
    items:PopoverMenuItemList
    opener:(open:(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void) => any
    onSelect?:(item:any) => void
}

export type PopoverMenuState = {

}

export default class PopoverMenu extends React.Component<PopoverMenuProps,PopoverMenuState>{

    state:PopoverMenuState = {

    }

    private popover:Popover |null = null;

    onMenuItemSelected(o:PopoverMenuItem){
        if(this.popover){
            this.popover.close();
        }
        if(this.props.onSelect){
            this.props.onSelect(o.value)
        }
    }


    render(){
        return (
            <Popover ref={ ref => this.popover = ref} opener={this.props.opener} >
                <ul className="PopoverMenu">
                    {this.props.items.map( (o:PopoverMenuItem,i) => <li className="PopoverMenu__Item" key={i} onClick={() => this.onMenuItemSelected(o)}>{o.label}</li>)}
                </ul>
            </Popover>
        )
    }
}