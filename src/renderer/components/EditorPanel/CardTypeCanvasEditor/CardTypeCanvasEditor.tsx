import React from "react";
import './CardTypeCanvasEditor.scss';
import CardTypeBoxView from "./CardTypeBoxView";
import { CardTypeCanvas, CardTypeBox, ProjectCardType, Project, CardTypeBoxType, createDefaultCanvasBox, CARD_TYPE_DEFAULT_VARIANT } from "../../../services/Project";
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
import PopoverPicker from "../../Misc/PopoverPicker";
import { SelectOptionsArray, SelectOptionsArrayItem } from "../../Misc/Select/Select";
import PopoverMenu from "../../Misc/PopoverMenu";
import { remote } from "electron";
import PopoverInput from "../../Misc/PopoverInput";
import Button from "../../Misc/Button";
import { APP_NAME } from "../../../utils/constants";
import ToggleButton from "../../Misc/ToggleButton";

type CardFaceCanvasProps = {
    label: string
    width: number
    height: number
    advanced: boolean
    advancedUrl: string | null
    cardTypeBaseUri:string | null
    boxes: Array<CardTypeBox>
    selectedBox: CardTypeBox | null
    onBoxChange: (box: CardTypeBox, prevBox: CardTypeBox) => void
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
                {props.boxes.map((box, i) => <CardTypeBoxView cardTypeBaseUri={props.cardTypeBaseUri} data={box} key={i} selected={box == props.selectedBox} onChange={(newBox) => props.onBoxChange(newBox, box)} onSelect={(selectedBox) => props.onBoxSelect(selectedBox, i)} />)}
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
    selectedBoxIndexInVariant: number
    selectedVariant: string
    selectedBoxVariantIndex: number
    currentTab: number
    advancedRectoUrl: string | null
    advancedVersoUrl: string | null
}

const typeToIconFont = {
    [CardTypeBoxType.Text]: "fas fa-paragraph",
    [CardTypeBoxType.Image]: "fas fa-image"
}


export class CardTypeCanvasEditor extends React.Component<CardTypeCanvasEditorProps, CardTypeCanvasEditorState>{

    state: CardTypeCanvasEditorState = {
        selectedBox: null,
        selectedBoxIndexInVariant: -1,
        selectedVariant: CARD_TYPE_DEFAULT_VARIANT,
        selectedBoxVariantIndex: -1,
        currentTab: 0,
        cardTypeCanvas: this.props.cardType.canvas,
        advancedRectoUrl: null,
        advancedVersoUrl: null,
    }

    async componentDidMount() {
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
                        base: this.props.cardType.relBase,
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
                    const htmlUrl = await serveHtml("cardtype-canvas-" + face, html, this.props.project.path, override)
                    return `${htmlUrl}?rnd=${Date.now()}`
                }
            }
        }
        return null
    }


    onBoxSelect(box: CardTypeBox, index: number) {
        const boxes = this.getBoxesByVariant(this.state.cardTypeCanvas.boxes, this.state.selectedVariant);
        const selectedBoxIndex = _.findIndex(boxes, box);
        this.setState({
            currentTab: 1,
            selectedBox: box,
            selectedBoxIndexInVariant: selectedBoxIndex,
        })
    }

    onFaceBGClick() {
        this.setState({
            selectedBox: null,
            selectedBoxIndexInVariant: -1,
        })
    }

    onTabChange(index: number) {
        this.setState({
            currentTab: index
        })
    }

    onBoxChange(box: CardTypeBox, prevBox: CardTypeBox) {
        const boxes = [...this.state.cardTypeCanvas.boxes];
        const selectedBoxIndex = _.findIndex(boxes, prevBox);
        boxes[selectedBoxIndex] = box;
        this.setState({
            selectedBox: this.state.selectedBox == prevBox ? box : this.state.selectedBox,
            cardTypeCanvas: {
                ...this.state.cardTypeCanvas,
                boxes
            }
        })

    }

    onVariantsChange(variants: string[]) {
        if (this.state.selectedBox) {
            const newSelectedBox = { ...this.state.selectedBox, variants: _.sortBy(variants) };
            const boxes = [...this.state.cardTypeCanvas.boxes];
            const selectedBoxIndex = _.findIndex(boxes, this.state.selectedBox);
            boxes[selectedBoxIndex] = newSelectedBox;
            const boxesByVariant = this.getBoxesByVariant(boxes, this.state.selectedVariant);
            this.setState({
                selectedBox: newSelectedBox,
                selectedBoxIndexInVariant: _.findIndex(boxesByVariant, newSelectedBox),
                cardTypeCanvas: {
                    ...this.state.cardTypeCanvas,
                    boxes
                }
            })
        }
    }

    onMainAttrChange(attr: string, value: any) {
        this.setState({
            cardTypeCanvas: {
                ...this.state.cardTypeCanvas,
                [attr]: value
            }
        })

    }


    onSelectBoxChange(index: number) {

        const boxes = this.state.cardTypeCanvas.boxes;
        const boxesByVariant = this.getBoxesByVariant(boxes, this.state.selectedVariant);
        const box = boxesByVariant[index];
        this.setState({
            selectedBox: box,
            selectedBoxIndexInVariant: index,
        })
    }

    onSelectBoxVariantChange(index: number) {
        const variant = index >= 0 ? this.state.cardTypeCanvas.variants[index] : CARD_TYPE_DEFAULT_VARIANT;
        this.setState({
            selectedBoxIndexInVariant: -1,
            selectedBox: null,
            selectedVariant: variant,
            selectedBoxVariantIndex: index,
        })
    }

    onAddBoxSelect(type: CardTypeBoxType) {
        const box = createDefaultCanvasBox(type, this.state.selectedVariant);
        const boxes = [...this.state.cardTypeCanvas.boxes, box];
        const boxesByVariant = this.getBoxesByVariant(boxes, this.state.selectedVariant);
        this.setState({
            selectedBox: box,
            selectedBoxIndexInVariant: boxesByVariant.length -1,
            cardTypeCanvas: {
                ...this.state.cardTypeCanvas,
                boxes
            }
        })
    }

    async onRemoveBoxButtonClick() {
        if (!this.state.selectedBox) return;
        const options = {
            title: APP_NAME,
            buttons: ["Yes", "No"],
            message: "Do you really want remove the current box?"
        }
        const response = await remote.dialog.showMessageBox(options);
        if (response.response == 0) {
            const boxes = _.reject(this.state.cardTypeCanvas.boxes, o => o == this.state.selectedBox);
            this.setState({
                selectedBox: null,
                selectedBoxIndexInVariant: -1,
                cardTypeCanvas: {
                    ...this.state.cardTypeCanvas,
                    boxes
                }
            })
        }
    }

    onDuplicateBoxButtonClick() {
        if (!this.state.selectedBox) return;
        const box = _.cloneDeep(this.state.selectedBox);
        const boxes = [...this.state.cardTypeCanvas.boxes, box];
        const boxesByVariant = this.getBoxesByVariant(boxes, this.state.selectedVariant);
        this.setState({
            selectedBox: box,
            selectedBoxIndexInVariant: _.findIndex(boxesByVariant, box),
            cardTypeCanvas: {
                ...this.state.cardTypeCanvas,
                boxes
            }
        })
    }

    async onRemoveVariantButtonClick() {
        if (!this.state.selectedVariant) return;
        if (this.state.selectedVariant == CARD_TYPE_DEFAULT_VARIANT) return;
        const options = {
            title: APP_NAME,
            buttons: ["Yes", "No"],
            message: `Do you really want remove the variant "${this.state.selectedVariant}"?`
        }
        const response = await remote.dialog.showMessageBox(options);
        const variantToDel = this.state.selectedVariant;
        if (response.response == 0) {
            const variants = _.reject(this.state.cardTypeCanvas.variants, o => o == variantToDel)
            const boxes: CardTypeBox[] = _.reduce(this.state.cardTypeCanvas.boxes, (list, o, k) => {
                if (o.variants.indexOf(variantToDel) >= 0) {
                    if (o.variants.length == 1) {
                        // Do nothing to remove the box from the list
                    } else {
                        list.push({
                            ...o,
                            variants: _.reject(o.variants, v => v == variantToDel)
                        })
                    }
                } else {
                    list.push(o);
                }
                return list;
            }, [] as CardTypeBox[])
            this.setState({
                selectedBox: null,
                selectedBoxIndexInVariant: -1,
                selectedVariant: CARD_TYPE_DEFAULT_VARIANT,
                selectedBoxVariantIndex: _.findIndex(variants, CARD_TYPE_DEFAULT_VARIANT),
                cardTypeCanvas: {
                    ...this.state.cardTypeCanvas,
                    variants,
                    boxes
                }
            })
        }
    }

    onEditVariantPopoverValidate(value: string | number) {
        const newVariant = value.toString();
        const oldVariant = this.state.selectedVariant;
        if (newVariant != oldVariant && !_.isEmpty(newVariant)) {
            const variants = _.map(this.state.cardTypeCanvas.variants, o => o == oldVariant ? newVariant : o);
            const boxes: CardTypeBox[] = _.reduce(this.state.cardTypeCanvas.boxes, (list, o, k) => {
                if (o.variants.indexOf(oldVariant) >= 0) {
                    list.push({
                        ...o,
                        variants: _.map(o.variants, v => v == oldVariant ? newVariant : v)
                    })
                } else {
                    list.push(o);
                }
                return list;
            }, [] as CardTypeBox[])
            this.setState({
                selectedVariant: newVariant,
                //selectedBoxVariantIndex: _.findIndex(variants, newVariant),
                cardTypeCanvas: {
                    ...this.state.cardTypeCanvas,
                    variants,
                    boxes
                }
            })
        }
    }

    onAddVariantPopoverValidate(value: string | number) {
        const variant = value.toString();
        const variants = [...this.state.cardTypeCanvas.variants, variant]
        this.setState({
            selectedVariant: variant,
            selectedBoxVariantIndex: variants.length - 1,
            cardTypeCanvas: {
                ...this.state.cardTypeCanvas,
                variants
            }
        })
    }

    getBoxesByVariant(boxes: CardTypeBox[], variant: string) {
        return _.filter(boxes, o => o.variants.length == 0 || o.variants.indexOf(variant) >= 0)
    }

    createBoxLabel(box: CardTypeBox,index:number,list:CardTypeBox[]): string {

        // Code to improve : find a good way to have box with differents names
        /*let n;
        switch (box.type) {
            case CardTypeBoxType.Text:
                n = 0;
                for(let i=0;i<index;i++){
                    const aBox = list[i];
                    if(aBox.type == CardTypeBoxType.Text && aBox.data.ref == box.data.ref){
                        n++;
                    }
                }
                return `${box.data.ref}${n == 0?'':` (${n})`}`;
            case CardTypeBoxType.Image:
                n = 0;
                for(let i=0;i<index;i++){
                    const aBox = list[i];
                    if(aBox.type == CardTypeBoxType.Image){
                        n++;
                    }
                }
                return `image${n == 0?'':` (${n})`}`;
        }*/

        switch (box.type) {
            case CardTypeBoxType.Text:
                return box.data.ref || 'text';
            case CardTypeBoxType.Image:
                return box.data.label || `image`;
        }
    }

    onBoxLockInViewChange(isLock:boolean){
        if(!this.state.selectedBox) return;
        const box:CardTypeBox = {
            ...this.state.selectedBox,
            lockInView:isLock
        }
        this.onBoxChange(box,this.state.selectedBox);
    }

    render() {
        // @ts-ignore
        // if we use selectedBox:CardTypeBox|null, TS define this.state.selectedBox only on null never in CardTypeBox
        // => Trigger TS errors later
        // It's not the good way to solve it. But it's currently the only I found
        const selectedBox: CardTypeBox = this.state.selectedBox;
        const selectedBoxKey = this.state.selectedBoxIndexInVariant;
        // If the variants list is empty, it be displayed
        // If the variants list containt the selected variant, it be displayed
        const boxesByVariant = this.getBoxesByVariant(this.state.cardTypeCanvas.boxes, this.state.selectedVariant);
        const rectoBoxes = _.filter(boxesByVariant, ['face', 'recto'])
        const versoBoxes = _.filter(boxesByVariant, ['face', 'verso'])
        const boxSelectOptions = _.map(boxesByVariant, (o, k) => ({ label: this.createBoxLabel(o,k,boxesByVariant), value: k }))
        const boxEmptyOption = { label: 'None', value: -1, disabled: true }
        const boxVariantSelectOptions: SelectOptionsArray = _.map(this.state.cardTypeCanvas.variants, (o, k) => ({ label: o.toString(), value: k }))
        const boxVariantEmptyOption: SelectOptionsArrayItem = { label: CARD_TYPE_DEFAULT_VARIANT, value: -1, disabled: false }
        const boxVariantList = _.map([CARD_TYPE_DEFAULT_VARIANT, ...this.state.cardTypeCanvas.variants], (o, k) => ({ label: o.toString(), value: o }))

        const BoxTypeOptions = _.map(CardTypeBoxType, (o, k) => ({ label: <React.Fragment>Add {o} <i className={typeToIconFont[o]}></i></React.Fragment>, value: o }))
        
        const cardTypeBaseUri = this.props.project.baseUri +'/'+ this.props.cardType.relBase;
        return (
            <div className="CardTypeCanvasEditor full-space">
                <div className="CardTypeCanvasEditor__Header">
                    <div className="CardTypeCanvasEditor__SelectAdd">
                        <Select id="CardTypeCanvasEditor__BoxesActionBar_selectVariant" disabled={boxVariantSelectOptions.length == 0} label="Variant" labelOnTop={false} value={this.state.selectedBoxVariantIndex} onChange={this.onSelectBoxVariantChange.bind(this)} emptyOption={boxVariantEmptyOption} options={boxVariantSelectOptions} />
                        <PopoverInput opener={(show => <Button fontIcon="fas fa-plus" onClick={show} />)} defaultValue={""} type="text" onValidate={this.onAddVariantPopoverValidate.bind(this)} />
                    </div>
                    <div className="button-bar CardTypeCanvasEditor__VariantActionBar">

                        <PopoverInput key={this.state.selectedVariant} opener={(show => <Button fontIcon="fas fa-pencil-alt" disabled={this.state.selectedVariant == CARD_TYPE_DEFAULT_VARIANT} onClick={show} />)} defaultValue={this.state.selectedVariant} type="text" onValidate={this.onEditVariantPopoverValidate.bind(this)} />
                        <Button fontIcon="fas fa-trash-alt" disabled={this.state.selectedVariant == CARD_TYPE_DEFAULT_VARIANT} onClick={this.onRemoveVariantButtonClick.bind(this)} />
                    </div>
                </div>
                <div className="CardTypeCanvasEditor__Canvas">
                    <div className="CardTypeCanvasEditor__CanvasContent">
                        <CardFaceCanvas
                            label="Recto"
                            cardTypeBaseUri={cardTypeBaseUri}
                            width={this.props.cardType.config.width}
                            height={this.props.cardType.config.height}
                            advanced={this.props.cardType.config.advanced}
                            advancedUrl={this.state.advancedRectoUrl}
                            boxes={rectoBoxes}
                            selectedBox={this.state.selectedBox}
                            onBoxChange={this.onBoxChange.bind(this)}
                            onBoxSelect={this.onBoxSelect.bind(this)}
                            onBGClick={this.onFaceBGClick.bind(this)}
                        />
                        {this.props.cardType.config.haveVerso &&
                            <CardFaceCanvas
                                label="Verso"
                                cardTypeBaseUri={cardTypeBaseUri}
                                width={this.props.cardType.config.width}
                                height={this.props.cardType.config.height}
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

                <div className="CardTypeCanvasEditor__Tabs">
                    <div className="CardTypeCanvasEditor__BoxesActionBar">
                        <div className="CardTypeCanvasEditor__SelectAdd CardTypeCanvasEditor__BoxesActionBar_Fixe">
                            <Select className="CardTypeCanvasEditor__BoxesActionBar_selectRef" id="CardTypeCanvasEditor__BoxesActionBar_selectRef" label="Box" labelOnTop={false} value={this.state.selectedBoxIndexInVariant} onChange={this.onSelectBoxChange.bind(this)} emptyOption={boxEmptyOption} options={boxSelectOptions} />
                            <PopoverMenu opener={(show => <Button fontIcon="fas fa-plus" onClick={show} />)} items={BoxTypeOptions} onSelect={this.onAddBoxSelect.bind(this)} />
                        </div>

                        {selectedBox && <div className="CardTypeCanvasEditor__VariantPicker">
                            <div className="CardTypeCanvasEditor__VariantValues">Variants : {selectedBox.variants.length == 0 ? 'All' : selectedBox.variants.join(',')}</div>
                            <PopoverPicker opener={(show) => <Button fontIcon="fas fa-pencil-alt" borderless={true} disabled={!selectedBox} onClick={(e) => show(e)} />} options={boxVariantList} values={selectedBox.variants} onChange={(values: Array<string | number>) => this.onVariantsChange(values as string[])} />
                        </div>}
                        <div className="CardTypeCanvasEditor__BoxesActionBar_Fixe">
                            {selectedBox && <div className="CardTypeCanvasEditor__TypeShow"><i className={typeToIconFont[selectedBox.type]}></i><span>{_.capitalize(selectedBox.type)}</span></div>}
                            <div className="button-bar ">
                                <ToggleButton key={selectedBoxKey} toggleFontIcon="fas fa-lock" fontIcon="fas fa-lock-open" disabled={!selectedBox} value={selectedBox?selectedBox.lockInView:false} onChange={this.onBoxLockInViewChange.bind(this)} />
                                <Button fontIcon="fas fa-clone" disabled={!selectedBox} onClick={this.onDuplicateBoxButtonClick.bind(this)} />
                                <Button fontIcon="fas fa-trash-alt" disabled={!selectedBox} onClick={this.onRemoveBoxButtonClick.bind(this)} />
                            </div>
                        </div>
                    </div>
                    <CardTypeBoxEditor className="CardTypeCanvasEditor__CardTypeBoxEditor" box={selectedBox} absCardTypePath={this.props.cardType.absBase} key={selectedBoxKey} onChange={this.onBoxChange.bind(this)} fonts={this.props.project.config.fonts} />
                </div>

            </div>
        )
    }

}

export default connect()(CardTypeCanvasEditor)

