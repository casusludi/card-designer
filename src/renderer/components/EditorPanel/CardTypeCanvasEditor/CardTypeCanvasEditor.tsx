import React from "react";
import './CardTypeCanvasEditor.scss';
import TabNav, { TabNavItem } from "../../Misc/TabNav/TabNav";
import Input from "../../Misc/Input";
import Checkbox from "../../Misc/Checkbox/Checkbox";
import CardTypeBoxView from "./CardTypeBoxView";
import { Dimension, CardTypeCanvas, CardTypeBox, ProjectCardType, Project } from "../../../services/Project";
import _ from "lodash";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { cardTypeCanvasChanged } from "../../../redux/project";
import RestrictedWebView from "../../Misc/RestrictedWebView";
import { renderNJKToHtml } from "../../../services/Project/Render";
import { serveHtml, pathToURL } from "../../../utils";

//@ts-ignore
import CardTypeCanvasLayout from './CardTypeCanvasLayout.njk';
import CardTypeBoxEditor from "./CardTypeBoxEditor";
import Select from "../../Misc/Select";
import Popover from "../../Misc/Popover";
import PopoverPicker from "../../Misc/PopoverPicker/PopoverPicker";
import { SelectOptionsArray, SelectOptionsArrayItem } from "../../Misc/Select/Select";

type CardFaceCanvasProps = {
    label: string
    width: number
    height: number
    advanced: boolean
    advancedUrl: string | null
    boxes: Array<CardTypeBox>
    selectedBox: CardTypeBox | null
    onBoxChange: (box: CardTypeBox, i: number) => void
    onBoxSelect: (box: CardTypeBox, i: number) => void
    onBGClick: () => void
}

function CardFaceCanvas(props: CardFaceCanvasProps) {
    return (
        <div className="CardTypeCanvasEditor__CardBox">
            <div className="CardTypeCanvasEditor__Card CardTypeCanvasEditor__CardVerso" style={{
                width: `${props.width}mm`,
                height: `${props.height}mm`
            }}>
                {props.advanced && <RestrictedWebView url={props.advancedUrl} className="CardTypeCanvasEditor__AdvancedContent full-space" />}
                <div className="full-space" onClick={() => props.onBGClick()}></div>
                {props.boxes.map((box, i) => <CardTypeBoxView data={box} key={i} selected={box == props.selectedBox} onChange={(newBox) => props.onBoxChange(newBox, i)} onSelect={(selectedBox) => props.onBoxSelect(selectedBox, i)} />)}
            </div>
            <div className="CardTypeCanvasEditor__CardBoxLabel">{props.label}</div>
        </div>
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
    selectedVariant: string
    selectedBoxVariantIndex: number
    currentTab: number
    advancedRectoUrl: string | null
    advancedVersoUrl: string | null
}

const DEFAULT_VARIANT = 'default';

export class CardTypeCanvasEditor extends React.Component<CardTypeCanvasEditorProps, CardTypeCanvasEditorState>{

    state = {
        selectedBox: null,
        selectedBoxIndex: -1,
        selectedVariant: DEFAULT_VARIANT,
        selectedBoxVariantIndex: -1,
        currentTab: 0,
        cardTypeCanvas: this.props.cardType.canvas,
        advancedRectoUrl: null,
        advancedVersoUrl: null
    }

    componentDidMount() {
        this.throttledRenderAdvancedContent();
    }

    componentDidUpdate(prevProps: CardTypeCanvasEditorProps, prevState: CardTypeCanvasEditorState) {

        if (!_.isEqual(prevState.cardTypeCanvas, this.state.cardTypeCanvas)) {

            this.props.dispatch(cardTypeCanvasChanged({ id: this.props.cardTypeCanvasId, canvas: this.state.cardTypeCanvas }));
        }

        if (!_.isEqual(prevProps.cardType, this.props.cardType)) {

            this.throttledRenderAdvancedContent();


            this.setState({ cardTypeCanvas: this.props.cardType.canvas })
        }

        const oldTemplate = prevProps.cardType.template ? prevProps.project.files[prevProps.cardType.template] : null;
        const oldStyle = prevProps.cardType.styles ? prevProps.project.files[prevProps.cardType.styles] : null;

        const currTemplate = this.props.cardType.template ? this.props.project.files[this.props.cardType.template] : null;
        const currStyle = this.props.cardType.styles ? this.props.project.files[this.props.cardType.styles] : null;

        if (oldTemplate != currTemplate || oldStyle != currStyle) {
            this.throttledRenderAdvancedContent();
        }
    }

    async renderAdvancedContent() {
        if (this.props.cardType.config.advanced) {
            this.setState({
                advancedRectoUrl: await this.renderCardByFace("recto"),
                advancedVersoUrl: await this.renderCardByFace("verso"),
            })
        }
    }

    private throttledRenderAdvancedContent = _.throttle(this.renderAdvancedContent, 1000);

    async renderCardByFace(face: string): Promise<string | null> {
        if (this.props.cardType.template) {
            const templateFile = this.props.project.files[this.props.cardType.template];
            if (templateFile) {
                const filters = {
                    'boxes': (env: any) => function name(card: any) {
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
                        override[pathToURL(this.props.cardType.styles)] = this.props.project.files[this.props.cardType.styles].content;
                    }
                    return await serveHtml("cardtype-canvas-" + face, html, this.props.project.path, override)
                }
            }
        }
        return null
    }

    onBoxChange(box: CardTypeBox, index: number) {
        // currently no change comme from box in the canvas
    }

    onBoxSelect(box: CardTypeBox, index: number, ) {
        this.setState({
            currentTab: 1,
            selectedBox: box,
            selectedBoxIndex: _.findIndex(this.state.cardTypeCanvas.boxes, box),
        })
    }

    onFaceBGClick() {
        this.setState({
            selectedBox: null,
            selectedBoxIndex: -1,
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

    onSelectBoxChange(index: number) {
        const box = this.state.cardTypeCanvas.boxes[index];
        this.setState({
            selectedBox: box,
            selectedBoxIndex: index,
        })
    }

    onSelectBoxVariantChange(index: number) {
        const variant = index >= 0 ? this.state.cardTypeCanvas.variants[index] : DEFAULT_VARIANT;
        this.setState({
            selectedBoxIndex: -1,
            selectedBox: null,
            selectedVariant: variant,
            selectedBoxVariantIndex: index,
        })
    }

    getAvailableBoxes(variant: string) {
        return _.filter(this.state.cardTypeCanvas.boxes, o => o.variants.length == 0 || o.variants.indexOf(variant) >= 0)
    }

    render() {
        // @ts-ignore
        // if we use selectedBox:CardTypeBox|null, TS define this.state.selectedBox only on null never in CardTypeBox
        // => Trigger TS errors later
        // It's not the good way to solve it. But it's currently the only I found
        const selectedBox: CardTypeBox = this.state.selectedBox;
        const selectedBoxKey = this.state.selectedBoxIndex;
        // If the variants list is empty, it be displayed
        // If the variants list containt the selected variant, it be displayed
        const boxes = this.getAvailableBoxes(this.state.selectedVariant);
        const rectoBoxes = _.filter(boxes, ['face', 'recto'])
        const versoBoxes = _.filter(boxes, ['face', 'verso'])
        const boxSelectOptions = _.map(boxes, (o, k) => ({ label: o.ref.toString(), value: k }))
        const boxEmptyOption = { label: 'None', value: -1, disabled: true }
        const boxVariantSelectOptions:SelectOptionsArray = _.map(this.state.cardTypeCanvas.variants, (o, k) => ({ label: o.toString(), value: k }))
        const boxVariantEmptyOption:SelectOptionsArrayItem = { label: DEFAULT_VARIANT, value: -1, disabled: false }
        const boxVariantList = _.map([DEFAULT_VARIANT,...this.state.cardTypeCanvas.variants], (o, k) => ({ label: o.toString(), value: o }))
        console.log(boxVariantList)
        return (
            <div className="CardTypeCanvasEditor full-space">
                <div className="CardTypeCanvasEditor__Header">
                    <Select id="CardTypeCanvasEditor__BoxesActionBar_selectVariant" disabled={boxVariantSelectOptions.length == 0} label="Variant" labelOnTop={false} value={this.state.selectedBoxVariantIndex} onChange={this.onSelectBoxVariantChange.bind(this)} emptyOption={boxVariantEmptyOption} options={boxVariantSelectOptions} />
                </div>
                <div className="CardTypeCanvasEditor__Canvas">
                    <div className="CardTypeCanvasEditor__CanvasContent">
                        <CardFaceCanvas
                            label="Recto"
                            width={this.state.cardTypeCanvas.width}
                            height={this.state.cardTypeCanvas.height}
                            advanced={this.props.cardType.config.advanced}
                            advancedUrl={this.state.advancedRectoUrl}
                            boxes={rectoBoxes}
                            selectedBox={this.state.selectedBox}
                            onBoxChange={this.onBoxChange.bind(this)}
                            onBoxSelect={this.onBoxSelect.bind(this)}
                            onBGClick={this.onFaceBGClick.bind(this)}
                        />
                        {this.state.cardTypeCanvas.haveVerso &&
                            <CardFaceCanvas
                                label="Verso"
                                width={this.state.cardTypeCanvas.width}
                                height={this.state.cardTypeCanvas.height}
                                advanced={this.props.cardType.config.advanced}
                                advancedUrl={this.state.advancedVersoUrl}
                                boxes={versoBoxes}
                                selectedBox={this.state.selectedBox}
                                onBoxChange={this.onBoxChange.bind(this)}
                                onBoxSelect={this.onBoxSelect.bind(this)}
                                onBGClick={this.onFaceBGClick.bind(this)}
                            />

                        }
                    </div>
                </div>
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
                        <div className="full-space">
                            <div className="CardTypeCanvasEditor__BoxesActionBar">
                                <Select id="CardTypeCanvasEditor__BoxesActionBar_selectRef" label="Box" labelOnTop={false} value={this.state.selectedBoxIndex} onChange={this.onSelectBoxChange.bind(this)} emptyOption={boxEmptyOption} options={boxSelectOptions} />
                                {selectedBox && <div className="CardTypeCanvasEditor__VariantPicker">
                                    <div className="CardTypeCanvasEditor__VariantValues">{selectedBox.variants.length == 0?'All':selectedBox.variants.join(',')}</div>
                                    <PopoverPicker options={boxVariantList} values={selectedBox.variants}/>
                                </div>}
                                <button type="button" className="button"><i className="icon fas fa-plus"></i><span>Add a box</span></button>
                            </div>
                            <CardTypeBoxEditor className="CardTypeCanvasEditor__CardTypeBoxEditor" box={selectedBox} key={selectedBoxKey} onDimensionChange={this.onCSSDimensionChange.bind(this)} />
                        </div>
                    </TabNavItem>
                </TabNav>
            </div>
        )
    }

}

export default connect()(CardTypeCanvasEditor)

/*

<Select id="CardTypeCanvasEditor__BoxesActionBar_select" label="Box" labelOnTop={false} value={this.state.selectedBoxIndex} onChange={} options={_.map(this.props.cardType.canvas.boxes, (o, k) => ({ label: k, value: k }))} />

{selectedBox ? <div className="ContentWithColumn">
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
                        </div> : <div className="CardTypeBoxEditor__NoBox">No Box Selected</div>}

                        */