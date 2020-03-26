import React from "react"
import { CardTypeBox, Dimension, FontStyle, FontWeight, CardTypeBoxType, TextAlign, Overflow, ObjectFit } from "../../../../services/Project"
import ActivableInput from "../../../Misc/ActivableInput"
import "./CardTypeBoxEditor.scss";
import Input from "../../../Misc/Input";
import Checkbox from "../../../Misc/Checkbox";
import _ from "lodash";
import Select from "../../../Misc/Select";
import { InputSize } from "../../../Misc/Input/Input";
import { createClassName } from "../../../../utils";
import Panel from "../../../Misc/Panel";
import CodeEditor from "../../CodeEditor";
import PathInput, { PathInputType } from "../../../Misc/PathInput";
import path from 'path';

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
    box: CardTypeBox
    absCardTypePath:string
    fonts: string[]
    className?: string
    onChange?: (box: CardTypeBox, prevBox: CardTypeBox) => void
}

export default function CardTypeBoxEditor(props: CardTypeBoxEditorProps) {

    const { box } = props;

    function onMainValueChange(name: string, value: any) {
        if (props.onChange) {
            const updatedBox = { ...box, [name]: value };
            props.onChange(updatedBox, box);
        }
    }

    function onDataValueChange(name: string, value: any) {
        if (props.onChange) {
            const data = { ...box.data, [name]: value };
            const updatedBox: any = { ...box, data };
            props.onChange(updatedBox, box);

        }
    }

    /*function onDataPathValueChange(name: string, value: string) {
       console.log(props.absCardTypePath,value)
       console.log("starts with : ",value.startsWith(props.absCardTypePath))
        const relativePath = value.startsWith(props.absCardTypePath)? path.normalize(path.relative(props.absCardTypePath,value)).replace(/\\/g,"/"):value;
        console.log(relativePath)
        onDataValueChange(name, relativePath);
    }*/

    function filterPath(value:string){
        console.log(props.absCardTypePath,value)
        console.log("starts with : ",value.startsWith(props.absCardTypePath))
        const relativePath = value.startsWith(props.absCardTypePath)? path.normalize(path.relative(props.absCardTypePath,value)).replace(/\\/g,"/"):value;
        console.log(relativePath)
        return relativePath;
    }

    return (
        <div className={createClassName("CardTypeBoxEditor", {}, [props.className])}>
            {box ?
                <div className="ContentWithColumn CardTypeBoxEditor__Content">
                    <div className="ContentWithColumn CardTypeBoxEditor_FirstCol">
                        <div className="ContentWithColumn__Col">
                            <CSSDimensionView name="top" value={box.top} onChange={onMainValueChange} />
                            <CSSDimensionView name="left" value={box.left} onChange={onMainValueChange} />
                            <CSSDimensionView name="width" value={box.width} onChange={onMainValueChange} />
                            <Input className="ContentWithColumn__ColItem_bottom" size={InputSize.Small} label="Z-Index : " labelOnTop={true} type="text" pattern="/[.0-9]*|auto/" defaultValue={box.zIndex} onChange={value => onMainValueChange("zIndex", value)} />
                        </div>
                        <div className="ContentWithColumn__Col">
                            <CSSDimensionView name="bottom" value={box.bottom} onChange={onMainValueChange} />
                            <CSSDimensionView name="right" value={box.right} onChange={onMainValueChange} />
                            <CSSDimensionView name="height" value={box.height} onChange={onMainValueChange} />
                            <Checkbox className="ContentWithColumn__ColItem_bottom" label="On Verso" defaultChecked={box.face == "verso"} onChange={value => onMainValueChange("face", value ? "verso" : "recto")} />
                        </div>
                    </div>
                    <div className="ContentWithLine CardTypeBoxEditor__DataBox">

                        {box.type == CardTypeBoxType.Text && <React.Fragment>
                            <div className="ContentWithLine__Line">
                                <Input label="Ref" labelOnTop={true} type="text" defaultValue={box.data.ref} onChange={value => onDataValueChange("ref", value)} />

                                <Input size={InputSize.Small} label="Size : " labelOnTop={true} type="text" pattern="/[.0-9]*/" defaultValue={box.data.size} onChange={value => onDataValueChange("size", value)} />
                                <Select size={InputSize.Normal} label="Font" labelOnTop={true} value={box.data.font} options={_.map(["inherit", ...props.fonts], (o, k) => ({ label: o, value: o }))} onChange={value => onDataValueChange("font", value)} />
                            </div>
                            <div className="ContentWithLine__Line">
                                <Input size={InputSize.Small} label="Color : " labelOnTop={true} type="color" defaultValue={box.data.color} onChange={value => onDataValueChange("color", value)} />
                                <Input size={InputSize.Small} label="Line Height : " labelOnTop={true} type="text" pattern="/[.0-9]*/" defaultValue={box.data.lineHeight} onChange={value => onDataValueChange("lineHeight", value)} />
                                <Select size={InputSize.Small} label="Overflow" labelOnTop={true} value={box.data.overflow} options={_.map(Overflow, (o, k) => ({ label: o, value: o }))} onChange={value => onDataValueChange("overflow", value)} />
                            </div>
                            <div className="ContentWithLine__Line">
                                <Select size={InputSize.Small} label="Style" labelOnTop={true} value={box.data.style} options={_.map(FontStyle, (o, k) => ({ label: o, value: o }))} onChange={value => onDataValueChange("style", value)} />
                                <Select size={InputSize.Small} label="Weight" labelOnTop={true} value={box.data.weight} options={_.map(FontWeight, (o, k) => ({ label: o, value: o }))} onChange={value => onDataValueChange("weight", value)} />
                                <Select size={InputSize.Small} label="Align" labelOnTop={true} value={box.data.align} options={_.map(TextAlign, (o, k) => ({ label: o, value: o }))} onChange={value => onDataValueChange("align", value)} />

                            </div>
                            <div className="ContentWithLine__Line">
                                <Panel label="Custom CSS" className="CardTypeBoxEditor__CustomEditor">
                                    <CodeEditor instanceId={box.data} code={box.data.custom} onChange={value => onDataValueChange("custom", value)} />
                                </Panel>
                            </div>
                        </React.Fragment>}
                        {box.type == CardTypeBoxType.Image && <React.Fragment>
                            <div className="ContentWithLine__Line">
                               
                                <PathInput type={PathInputType.File}
                                    label="Path : "
                                    labelOnTop={true}
                                    value={box.data.path}
                                    onChange={value => onDataValueChange("path", value)}
                                    filterPath={filterPath}
                                    filters={[{ name: 'Images', extensions: ['jpg', 'png', 'svg', 'bmp', 'gif'] }]}
                                    
                                />
                               
                            </div>
                            <div className="ContentWithLine__Line">
                                <Input label="Label" labelOnTop={true} type="text" defaultValue={box.data.label} onChange={value => onDataValueChange("label", value)} />
                                <Select size={InputSize.Normal} label="Fit" labelOnTop={true} value={box.data.fit} options={_.map(ObjectFit, (o, k) => ({ label: o, value: o }))} onChange={value => onDataValueChange("fit", value)} />
                            </div>
                            <div className="ContentWithLine__Line">
                                <Panel label="Custom CSS" className="CardTypeBoxEditor__CustomEditor">
                                    <CodeEditor instanceId={box.data} code={box.data.custom} onChange={value => onDataValueChange("custom", value)} />
                                </Panel>
                            </div>
                        </React.Fragment>}

                    </div>
                </div>
                : <div className="CardTypeBoxEditor__NoBox">No Box Selected</div>}
        </div>
    )
}