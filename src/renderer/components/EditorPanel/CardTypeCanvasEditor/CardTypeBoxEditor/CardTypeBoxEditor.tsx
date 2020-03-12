import React from "react"
import { CardTypeBox, Dimension } from "../../../../services/Project"
import ActivableInput from "../../../Misc/ActivableInput"
import "./CardTypeBoxEditor.scss";

type CSSDimensionViewProps = {
    name: string
    value: Dimension
    onChange: (name: string, value: Dimension) => void
}

function CSSDimensionView(props: CSSDimensionViewProps) {
    return (
        <ActivableInput type="text" pattern="/[.0-9]*|auto/" defaultActivatedValue={0} desactivatedValue="auto" label={props.name + " : "} units={props.value != "auto" ? "mm" : ""} labelOnTop={true} defaultValue={props.value} activated={props.value != "auto"} onChange={(value) => props.onChange(props.name, value as Dimension)} />
    )
}

export type CardTypeBoxEditorProps = {
    box:CardTypeBox
    className?:string
    onDimensionChange: (name: string, value: Dimension) => void
}

export default function CardTypeBoxEditor(props:CardTypeBoxEditorProps){

    const {box} = props;
    return (
        <div className={"CardTypeBoxEditor"+(props.className?" "+props.className:"")}>
        {box ? <div className="ContentWithColumn">
            <div className="ContentWithColumn__Col">
                <CSSDimensionView name="top" value={box.top} onChange={props.onDimensionChange} />
                <CSSDimensionView name="left" value={box.left} onChange={props.onDimensionChange} />
                <CSSDimensionView name="width" value={box.width} onChange={props.onDimensionChange} />
            </div>
            <div className="ContentWithColumn__Col">
                <CSSDimensionView name="bottom" value={box.bottom} onChange={props.onDimensionChange} />
                <CSSDimensionView name="right" value={box.right} onChange={props.onDimensionChange} />
                <CSSDimensionView name="height" value={box.height} onChange={props.onDimensionChange} />
            </div>
        </div> : <div className="CardTypeBoxEditor__NoBox">No Box Selected</div>}
        </div>
    )
}