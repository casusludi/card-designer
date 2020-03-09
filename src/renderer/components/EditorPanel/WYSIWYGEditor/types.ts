
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
    color: string
    weight: FontWeight | number
    style: FontStyle
    align: TextAlign
    size: number
}

export type Dimension = number | "auto" ;

export type CardTypeBox = {
    ref: string // variable name
    type: CardTypeBoxType
    top: Dimension
    left: Dimension
    bottom: Dimension
    right: Dimension
    width: Dimension
    height: Dimension
    data: CardTypeBoxText
}

export type CardTypeData = {
    width: number
    height: number
    haveVerso: boolean
    rectoBoxes: Array<CardTypeBox>
    versoBoxes: Array<CardTypeBox>
}