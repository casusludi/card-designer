import React from "react";
import "./Popover.scss"

export type PopoverProps = {
    children:any,
    opener:(open:(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void) => any
}

export type PopoverStats = {
    isOpened:boolean,
    top:number,
    left:number
}


export default class Popover extends React.Component<PopoverProps,PopoverStats>{

    state:PopoverStats = {
        isOpened:false,
        top:0,
        left:0
    }

    private content:HTMLElement | null = null;
    private openerElement:HTMLElement | null = null;

    openPopover(e:React.MouseEvent<HTMLButtonElement, MouseEvent>){
        this.openerElement = e.currentTarget;
        this.updateContentPosition()
        this.setState({
            isOpened:true
        })
    }

    updateContentPosition(){
        if(this.content && this.openerElement){
            const openerBounds = this.openerElement.getBoundingClientRect()
            const globalBounds = window.document.body.getBoundingClientRect();
            const contentBounds = this.content.getBoundingClientRect();

            // by default place the content under the opener align to left
            let top = openerBounds.top+openerBounds.height;
            let left = openerBounds.left;
            // if the content box overflow on the right
            if(contentBounds.width+left > globalBounds.width){
                // align to the right
                left = openerBounds.left+openerBounds.width-contentBounds.width
            }

            // if the content box overflow on the bottom
            if(contentBounds.height+top > globalBounds.height){
                // align to the top
                top = openerBounds.top-contentBounds.height
            }

            // If no change, no update call (skip too many recursive call)
            if(top != this.state.top || left != this.state.left){
                this.setState({
                    top,
                    left
                })
            }
        }
        
    }

    close(){
        this.setState({isOpened:false}) 
    }

    updateRefContent(ref:HTMLElement | null){
        this.content = ref;
        this.updateContentPosition()
    }

    render(){

        return (
            <React.Fragment>
                {this.props.opener(this.openPopover.bind(this))}
                {this.state.isOpened  && <div className={"Popover"}>
                    <div className="Popover__Background" onClick={()=> this.close()}></div>
                    <div className="Popover__Content" ref={this.updateRefContent.bind(this)} style={{
                        top:`${this.state.top}px`,
                        left:`${this.state.left}px`
                    }}>
                        {this.props.children}
                    </div>
                </div>}
            </React.Fragment>
        )
    }
}