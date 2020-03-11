import React from "react";
import './CardTypeCanvasEditor.scss';
import TabNav, { TabNavItem } from "../../Misc/TabNav/TabNav";
import Input from "../../Misc/Input";
import Checkbox from "../../Misc/Checkbox/Checkbox";
import ActivableInput from "../../Misc/ActivableInput";
import CardTypeBoxView from "./CardTypeBoxView";
import { Dimension, CardTypeCanvas, CardTypeBox, ProjectCardType, Project } from "../../../services/Project";
import _ from "lodash";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { cardTypeCanvasChanged } from "../../../redux/project";
import { RestrictedWebView } from "../../Misc/RestrictedWebView/RestrictedWebView";
import { renderNJKToHtml } from "../../../services/Project/Render";
import { serveHtml } from "../../../utils";

//@ts-ignore
import CardTypeCanvasLayout from './CardTypeCanvasLayout.njk';

type CSSDimensionView = {
    name: string,
    value: Dimension,
    onChange: (name: string, value: Dimension) => void
}

function CSSDimensionView(props: CSSDimensionView) {
    return (
        <ActivableInput type="text" pattern="/[.0-9]*|auto/" defaultActivatedValue={0} desactivatedValue="auto" label={props.name + " : "} units={props.value != "auto" ? "mm" : ""} labelOnTop={true} defaultValue={props.value} activated={props.value != "auto"} onChange={(value) => props.onChange(props.name, value as Dimension)} />
    )
}

export type CardTypeCanvasEditorProps = {
    cardTypeCanvasId: string
    cardType: ProjectCardType
    project: Project
    dispatch: Dispatch
}

export type CardTypeCanvasEditorState = {
    cardTypeCanvas: CardTypeCanvas
    selectedBox: CardTypeBox | null
    selectedBoxIndex: number
    currentTab: number
    advancedRectoUrl: string | null
    advancedVersoUrl: string | null
}

export class CardTypeCanvasEditor extends React.Component<CardTypeCanvasEditorProps, CardTypeCanvasEditorState>{

    state = {
        selectedBox: null,
        selectedBoxIndex: -1,
        currentTab: 0,
        cardTypeCanvas: this.props.cardType.canvas,
        advancedRectoUrl: null,
        advancedVersoUrl: null
    }

    componentDidMount() {
        this.renderAdvancedContent();
    }

    componentDidUpdate(prevProps: CardTypeCanvasEditorProps, prevState: CardTypeCanvasEditorState) {

        if (!_.isEqual(prevState.cardTypeCanvas, this.state.cardTypeCanvas)) {
            console.log("canvas changed")

            this.props.dispatch(cardTypeCanvasChanged({ id: this.props.cardTypeCanvasId, canvas: this.state.cardTypeCanvas }));
        }

        if (!_.isEqual(prevProps.cardType, this.props.cardType)) {
            if (this.props.cardType.template) {
                this.renderAdvancedContent();
            }


            this.setState({ cardTypeCanvas: this.props.cardType.canvas })
        }
    }

    async renderAdvancedContent() {
        if(this.props.cardType.config.advanced){
            this.setState({
                advancedRectoUrl: await this.renderCardByFace("recto"),
                advancedVersoUrl: await this.renderCardByFace("verso"),
            })
        }
    }

    async renderCardByFace(face:string):Promise<string|null>{
        if (this.props.cardType.template) {
            const templateFile = this.props.project.files[this.props.cardType.template];
            if (templateFile) {
                const filters = {
                    'boxes': (env:any) => function name(card:any) {
                        return '';
                    }
                }
                const html = renderNJKToHtml(
                    templateFile.content,
                    CardTypeCanvasLayout,
                    [{}],
                    {
                        base: this.props.cardType.base,
                    },
                    {
                        face,
                        templateCSSPath: this.props.cardType.styles
                    },
                    filters
                )
                if (html) {
                    const override: any = {}
                    if (this.props.cardType.styles) {
                        override[this.props.cardType.styles] = this.props.project.files[this.props.cardType.styles].content;
                    }
                    return await serveHtml("cardtype-canvas-"+face, html, this.props.project.path, override)
                }
            }
        }
        return null
    }

    onBoxChange(index: number, box: CardTypeBox) {

    }

    onBoxSelect(index: number, box: CardTypeBox, isRecto: boolean) {
        this.setState({
            currentTab: 1,
            selectedBox: box,
            selectedBoxIndex: index,
        })
    }

    onTabChange(index: number) {
        this.setState({
            currentTab: index
        })
    }

    onCSSDimensionChange(name: string, value: Dimension) {
        if (this.state.selectedBox) {
            // @ts-ignore
            // if we use selectedBox:CardTypeBox|null, TS define this.state.selectedBox only on null never in CardTypeBox
            // => Trigger TS errors later
            // It's not the good way to solve it. But it's currently the only I found
            const selectedBox = { ...this.state.selectedBox, [name]: value };
            if (this.state.selectedBoxIndex >= 0) {
                const boxes = [...this.state.cardTypeCanvas.boxes];
                boxes[this.state.selectedBoxIndex] = selectedBox;
                this.setState({
                    selectedBox,
                    cardTypeCanvas: {
                        ...this.state.cardTypeCanvas,
                        boxes
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
        const selectedBox: CardTypeBox = this.state.selectedBox;
        const selectedBoxKey = this.state.selectedBoxIndex;
        const rectoBoxes = _.filter(this.state.cardTypeCanvas.boxes,['face','recto'])
        const versoBoxes = _.filter(this.state.cardTypeCanvas.boxes,['face','verso'])
        return (
            <div className="CardTypeCanvasEditor full-space">
                <div className="CardTypeCanvasEditor__Canvas">

                    <div className="CardTypeCanvasEditor__CardBox">

                        <div className="CardTypeCanvasEditor__Card CardTypeCanvasEditor__CardRecto" style={{
                            width: `${this.state.cardTypeCanvas.width}mm`,
                            height: `${this.state.cardTypeCanvas.height}mm`
                        }}>
                            {this.props.cardType.config.advanced && <RestrictedWebView url={this.state.advancedRectoUrl} className="CardTypeCanvasEditor__AdvancedContent full-space" />}
                            {rectoBoxes.map((box, i) => <CardTypeBoxView data={box} key={i} selected={box == this.state.selectedBox} onChange={(newBox) => this.onBoxChange(i, newBox)} onSelect={(selectedBox) => this.onBoxSelect(i, selectedBox, true)} />)}
                        </div>
                        <div className="CardTypeCanvasEditor__CardBoxLabel">Recto</div>
                    </div>
                    {this.state.cardTypeCanvas.haveVerso &&
                        <div className="CardTypeCanvasEditor__CardBox">
                            <div className="CardTypeCanvasEditor__Card CardTypeCanvasEditor__CardVerso" style={{
                                width: `${this.state.cardTypeCanvas.width}mm`,
                                height: `${this.state.cardTypeCanvas.height}mm`
                            }}>
                                {this.props.cardType.config.advanced && <RestrictedWebView url={this.state.advancedVersoUrl} className="CardTypeCanvasEditor__AdvancedContent full-space" />}
                                {versoBoxes.map((box, i) => <CardTypeBoxView data={box} key={i} selected={box == this.state.selectedBox} onChange={(newBox) => this.onBoxChange(i, newBox)} onSelect={(selectedBox) => this.onBoxSelect(i, selectedBox, false)} />)}
                            </div>
                            <div className="CardTypeCanvasEditor__CardBoxLabel">Verso</div>
                        </div>
                    }
                </div>
                <div>
                    <TabNav className="CardTypeCanvasEditor__Tabs" currentTab={this.state.currentTab} onTabChange={this.onTabChange.bind(this)} >
                        <TabNavItem label="Card Settings">
                            <div className="ContentWithLine">
                                <div className="ContentWithLine__Line">
                                    <Input label="width : " labelOnTop={true} type="number" defaultValue={this.state.cardTypeCanvas.width} units="mm" />
                                    <Input label="height : " labelOnTop={true} type="number" defaultValue={this.state.cardTypeCanvas.height} units="mm" />
                                    <Checkbox label="With Verso" defaultChecked={this.state.cardTypeCanvas.haveVerso} />
                                </div>
                            </div>
                        </TabNavItem>
                        <TabNavItem label="Boxes">
                            {selectedBox && <div className="ContentWithColumn">
                                <div className="ContentWithColumn__Col">
                                    <CSSDimensionView name="top" value={selectedBox.top} key={"top:" + selectedBoxKey} onChange={this.onCSSDimensionChange.bind(this)} />
                                    <CSSDimensionView name="left" value={selectedBox.left} key={"left:" + selectedBoxKey} onChange={this.onCSSDimensionChange.bind(this)} />
                                    <CSSDimensionView name="bottom" value={selectedBox.bottom} key={"bottom:" + selectedBoxKey} onChange={this.onCSSDimensionChange.bind(this)} />
                                    <CSSDimensionView name="right" value={selectedBox.right} key={"right:" + selectedBoxKey} onChange={this.onCSSDimensionChange.bind(this)} />

                                </div>
                                <div className="ContentWithColumn__Col">
                                    <CSSDimensionView name="width" value={selectedBox.width} key={"width:" + selectedBoxKey} onChange={this.onCSSDimensionChange.bind(this)} />
                                    <CSSDimensionView name="height" value={selectedBox.height} key={"height:" + selectedBoxKey} onChange={this.onCSSDimensionChange.bind(this)} />
                                </div>
                            </div>}
                        </TabNavItem>

                    </TabNav>
                </div>
            </div>
        )
    }

}

export default connect()(CardTypeCanvasEditor)