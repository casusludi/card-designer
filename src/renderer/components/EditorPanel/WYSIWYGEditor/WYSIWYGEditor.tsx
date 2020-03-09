import React from "react";
import './WYSIWYGEditor.scss';
import TabNav, { TabNavItem } from "../../Misc/TabNav/TabNav";
import Input from "../../Misc/Input";
import Checkbox from "../../Misc/Checkbox/Checkbox";
import ActivableInput from "../../Misc/ActivableInput";
import { CardTypeData, CardTypeBoxType, FontWeight, FontStyle, TextAlign, Dimension, CardTypeBox } from "./types";
import CardTypeBoxView from "./CardTypeBoxView";

type CSSDimensionView = {
    name:string,
    value:Dimension,
    onChange:(name:string,value:Dimension)=>void
}

function CSSDimensionView(props:CSSDimensionView){
    return (
        <ActivableInput type="text" pattern="/[.0-9]*|auto/" defaultActivatedValue={0} desactivatedValue="auto" label={props.name+" : "} units={props.value != "auto"?"mm":""} labelOnTop={true} defaultValue={props.value} activated={props.value != "auto"} onChange={(value) => props.onChange(props.name,value as Dimension)} />
    )
}

export type WYSIWYGEditorProps = {

}

export type WYSIWYGEditorState = {
    cardTypeData: CardTypeData
    selectedBox: CardTypeBox|null
    selectedBoxRectoIndex: number
    selectedBoxVersoIndex: number
    currentTab: number
}

export default class WYSIWYGEditor extends React.Component<WYSIWYGEditorProps, WYSIWYGEditorState>{

    state = {
        selectedBox: null,
        selectedBoxRectoIndex:-1,
        selectedBoxVersoIndex:-1,
        currentTab: 0,
        cardTypeData: {
            width: 63,
            height: 87.5,
            haveVerso: true,
            rectoBoxes: [
                {
                    ref: "title",
                    type: CardTypeBoxType.Text,
                    top: 30,
                    left: 40,
                    width: 20,
                    height: 10,
                    right:"auto" as Dimension,
                    bottom:"auto" as Dimension,
                    data: {
                        color: "red",
                        size: 12,
                        weight: FontWeight.Bold,
                        style: FontStyle.Normal,
                        align: TextAlign.Center
                    }
                },
                {
                    ref: "desc",
                    type: CardTypeBoxType.Text,
                    top: "auto" as Dimension,
                    left: "auto" as Dimension,
                    width: 20,
                    height: 10,
                    right: 5,
                    bottom: 5,
                    data: {
                        color: "red",
                        size: 12,
                        weight: FontWeight.Bold,
                        style: FontStyle.Normal,
                        align: TextAlign.Center
                    }
                }
            ],
            versoBoxes: [
                {
                    ref: "verso_title",
                    type: CardTypeBoxType.Text,
                    top: "auto" as Dimension,
                    left: "auto" as Dimension,
                    width: 20,
                    height: 10,
                    right: 5,
                    bottom: 5,
                    data: {
                        color: "red",
                        size: 12,
                        weight: FontWeight.Bold,
                        style: FontStyle.Normal,
                        align: TextAlign.Center
                    }
                }

            ]
        }
    }

    onBoxChange(index: number, box: CardTypeBox) {

    }

    onBoxSelect(index: number, box: CardTypeBox,isRecto:boolean) {
        this.setState({
            currentTab: 1,
            selectedBox: box,
            selectedBoxRectoIndex:isRecto?index:-1,
            selectedBoxVersoIndex:!isRecto?index:-1
        })
    }

    onTabChange(index: number) {
        this.setState({
            currentTab: index
        })
    }

    onCSSDimensionChange(name:string,value:Dimension){
        if(this.state.selectedBox){
            // @ts-ignore
            // if we use selectedBox:CardTypeBox|null, TS define this.state.selectedBox only on null never in CardTypeBox
            // => Trigger TS errors later
            // It's not the good way to solve it. But it's currently the only I found
            const selectedBox = {...this.state.selectedBox,[name]:value};
            if(this.state.selectedBoxRectoIndex>=0){
                const rectoBoxes = [...this.state.cardTypeData.rectoBoxes];
                rectoBoxes[this.state.selectedBoxRectoIndex] = selectedBox;
                this.setState({
                    selectedBox,
                    cardTypeData:{
                        ...this.state.cardTypeData,
                        rectoBoxes
                    }
                })
            }
            if(this.state.selectedBoxVersoIndex>=0){
                const versoBoxes = [...this.state.cardTypeData.versoBoxes];
                versoBoxes[this.state.selectedBoxVersoIndex] = selectedBox;
                this.setState({
                    selectedBox,
                    cardTypeData:{
                        ...this.state.cardTypeData,
                        versoBoxes
                    }
                })
            }
            
        }
    }

    render() {
        // @ts-ignore
        // if we use selectedBox:CardTypeBox|null, TS define this.state.selectedBox only on null never in CardTypeBox
        // => Trigger TS errors later
        // It's not the good way to solve it. But it's currently the only I found
        const selectedBox:CardTypeBox = this.state.selectedBox;
        const selectedBoxKey = `${this.state.selectedBoxRectoIndex};${this.state.selectedBoxVersoIndex}`;
        return (
            <div className="WYSIWYGEditor full-space">
                <div className="WYSIWYGEditor__Canvas">
                    <div className="WYSIWYGEditor__CardBox">
                        <div className="WYSIWYGEditor__Card WYSIWYGEditor__CardRecto" style={{
                            width: `${this.state.cardTypeData.width}mm`,
                            height: `${this.state.cardTypeData.height}mm`
                        }}>
                            {this.state.cardTypeData.rectoBoxes.map((box, i) => <CardTypeBoxView data={box} key={i} selected={box == this.state.selectedBox} onChange={(newBox) => this.onBoxChange(i, newBox)} onSelect={(selectedBox) => this.onBoxSelect(i, selectedBox,true)} />)}
                        </div>
                        <div className="WYSIWYGEditor__CardBoxLabel">Recto</div>
                    </div>
                    {this.state.cardTypeData.haveVerso &&
                        <div className="WYSIWYGEditor__CardBox">
                            <div className="WYSIWYGEditor__Card WYSIWYGEditor__CardVerso" style={{
                                width: `${this.state.cardTypeData.width}mm`,
                                height: `${this.state.cardTypeData.height}mm`
                            }}>
                                {this.state.cardTypeData.versoBoxes.map((box, i) => <CardTypeBoxView data={box} key={i} selected={box == this.state.selectedBox} onChange={(newBox) => this.onBoxChange(i, newBox)} onSelect={(selectedBox) => this.onBoxSelect(i, selectedBox,false)} />)}
                            </div>
                            <div className="WYSIWYGEditor__CardBoxLabel">Verso</div>
                        </div>
                    }
                </div>
                <div>
                    <TabNav className="WYSIWYGEditor__Tabs" currentTab={this.state.currentTab} onTabChange={this.onTabChange.bind(this)} >
                        <TabNavItem label="Card Settings">
                            <div className="ContentWithLine">
                                <div className="ContentWithLine__Line">
                                    <Input label="width : " labelOnTop={true} type="number" defaultValue={this.state.cardTypeData.width} units="mm" />
                                    <Input label="height : " labelOnTop={true} type="number" defaultValue={this.state.cardTypeData.height} units="mm" />
                                    <Checkbox label="With Verso" defaultChecked={this.state.cardTypeData.haveVerso} />
                                </div>
                            </div>
                        </TabNavItem>
                        <TabNavItem label="Boxes">
                            {selectedBox && <div className="ContentWithColumn">
                                <div className="ContentWithColumn__Col">
                                    <CSSDimensionView name="top" value={selectedBox.top} key={"top:"+selectedBoxKey} onChange={this.onCSSDimensionChange.bind(this)}/>
                                    <CSSDimensionView name="left" value={selectedBox.left} key={"left:"+selectedBoxKey}  onChange={this.onCSSDimensionChange.bind(this)} />
                                    <CSSDimensionView name="bottom" value={selectedBox.bottom} key={"bottom:"+selectedBoxKey}  onChange={this.onCSSDimensionChange.bind(this)} />
                                    <CSSDimensionView name="right" value={selectedBox.right} key={"right:"+selectedBoxKey}  onChange={this.onCSSDimensionChange.bind(this)} />
                                   
                                </div>
                                <div className="ContentWithColumn__Col">
                                    <CSSDimensionView name="width" value={selectedBox.width} key={"width:"+selectedBoxKey}  onChange={this.onCSSDimensionChange.bind(this)} />
                                    <CSSDimensionView name="height" value={selectedBox.height} key={"height:"+selectedBoxKey}  onChange={this.onCSSDimensionChange.bind(this)} />
                                </div>
                            </div>}
                        </TabNavItem>

                    </TabNav>
                </div>
            </div>
        )
    }

}