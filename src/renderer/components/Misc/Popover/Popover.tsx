import React from "react";
import "./Popover.scss"

export type PopoverProps = {
    children:any,
    opener:(open:(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void) => any
}

export type PopoverStats = {
    isOpened:boolean,
    clientX:number,
    clientY:number
}


export default class Popover extends React.Component<PopoverProps,PopoverStats>{

    state = {
        isOpened:false,
        clientX:0,
        clientY:0
    }

    openPopover(e:React.MouseEvent<HTMLButtonElement, MouseEvent>){

        this.setState({
            isOpened:true,
            clientX:e.clientX,
            clientY:e.clientY
        })
    }



    render(){

        return (
            <React.Fragment>
                {this.props.opener(this.openPopover.bind(this))}
                {this.state.isOpened  && <div className={"Popover"}>
                    <div className="Popover__Background" onClick={()=> this.setState({isOpened:false})}></div>
                    <div className="Popover__Content" style={{
                        top:`${this.state.clientY}px`,
                        left:`${this.state.clientX}px`
                    }}>
                        {this.props.children}
                    </div>
                </div>}
            </React.Fragment>
        )
    }
}