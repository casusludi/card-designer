import React from "react";
import './WYSIWYGEditor.scss';
import TabNav, { TabNavItem } from "../../Misc/TabNav/TabNav";


export enum CardTypeBoxType {
    Text = "text",
    Image = "image"
}

export enum FontWeight {
    Normal = "normal",
    Bold = "bold",
    Bolder = "bolder",
    Lighter = "lighter",
}

export enum FontStyle {
    Normal = "normal",
    Italic = "italic",
    Oblique = "oblique",
}

export enum TextAlign {
    Center = "center",
    Left = "left",
    Right = "right",
}

export type CardTypeBoxText = {
    color:string
    weight:FontWeight|number
    style:FontStyle
    align:TextAlign
    size:number
}


export type CardTypeBox = {
    ref:string // variable name
    type:CardTypeBoxType
    top?:number|null
    left?:number|null
    bottom?:number|null
    right?:number|null
    width?:number|null
    height?:number|null
    data:CardTypeBoxText
}

export type CardTypeData = {
    width:number
    height:number
    boxes:Array<CardTypeBox>
}

export type WYSIWYGEditorProps = {

}

export type WYSIWYGEditorState = {
    cardTypeData:CardTypeData
    boxIndexSelected:number
    currentTab:number
}

type CardTypeBoxViewProps = {
    data:CardTypeBox
    selected:boolean
    onSelect:(box:CardTypeBox) => void
    onChange:(box:CardTypeBox) => void
}

function cssAbsPos(value:number|undefined|null):string{
    if(!value) return "auto";
    return `${value}mm`;
}



class CardTypeBoxView extends React.Component<CardTypeBoxViewProps> {

    createBoxViewCSS(){
        const styles = {
            top: cssAbsPos(this.props.data.top),
            bottom: cssAbsPos(this.props.data.bottom),
            left: cssAbsPos(this.props.data.left),
            right: cssAbsPos(this.props.data.right),
            width: cssAbsPos(this.props.data.width),
            height: cssAbsPos(this.props.data.height),

        }

        switch(this.props.data.type){
            case CardTypeBoxType.Text: return {
                ...styles,
                color: this.props.data.data.color,
                fontSize: `${this.props.data.data.size}pt`,
                fontStyle: this.props.data.data.style,
                fontWeight: this.props.data.data.weight,
                textAlign: this.props.data.data.align,
            }
        }

        return styles;
    }

    render(){
        return (
            <div className={"CardTypeBoxView"+(this.props.selected?' CardTypeBoxView_selected':'')} style={this.createBoxViewCSS()} onClick={() => this.props.onSelect(this.props.data)}>
                {this.props.data.ref}
            </div>
        )
    }
    
}

export default class WYSIWYGEditor extends React.Component<WYSIWYGEditorProps,WYSIWYGEditorState>{

    state = {
        boxIndexSelected:-1,
        currentTab:0,
        cardTypeData: {
            width: 63,
            height: 87.5,
            boxes:[
                {
                    ref:"pouet",
                    type: CardTypeBoxType.Text,
                    top:5,
                    left:5,
                    width: 20,
                    height: 10,
                    data: {
                        color:"red",
                        size: 12,
                        weight: FontWeight.Bold,
                        style: FontStyle.Normal,
                        align: TextAlign.Center
                    }
                }
            ]
        }
    }

    onBoxChange(index:number,box:CardTypeBox){

    }

    onBoxSelect(index:number,box:CardTypeBox){
        this.setState({
            currentTab:1,
            boxIndexSelected:index
        })
    }

    onTabChange(index:number){
        this.setState({
            currentTab: index
        })
    }

    render(){
        return (
            <div className="WYSIWYGEditor full-space">
                <div className="WYSIWYGEditor__Canvas">
                    <div className="WYSIWYGEditor__Card" style={{
                        width: `${this.state.cardTypeData.width}mm`,
                        height: `${this.state.cardTypeData.height}mm`
                    }}>
                        {this.state.cardTypeData.boxes.map( (box,i) => <CardTypeBoxView data={box} key={i} selected={i == this.state.boxIndexSelected} onChange={(newBox) => this.onBoxChange(i,newBox)} onSelect={(selectedBox) => this.onBoxSelect(i,selectedBox) } />)}
                    </div>
                </div>
                <div>
                <TabNav className="WYSIWYGEditor__Tabs" currentTab={this.state.currentTab} onTabChange={this.onTabChange.bind(this)} >
                        <TabNavItem label="Card Settings">
                            <input className="input-field" type="number" defaultValue={this.state.cardTypeData.width}  />
                            <input className="input-field" type="number" defaultValue={this.state.cardTypeData.height} />
                        </TabNavItem>
                        <TabNavItem label="Boxes">
                            
                        </TabNavItem>

                    </TabNav>
                </div>
            </div>
        )
    }
 
}