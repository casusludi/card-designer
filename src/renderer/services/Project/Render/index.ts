import _ from 'lodash';
import nunjucks from 'nunjucks';
import { ProjectSelection, Project, CardTypeBox, getDataBySourceTypeAndCardType } from '..';
//@ts-ignore
import CardTypeCanvasBoxes from './CardTypeCanvasBoxes.njk';
//@ts-ignore
import CardTypeCanvasTemplate from './CardTypeCanvasTemplate.njk';
import { cssDimensionValue, cssZIndexValue } from '../../../utils';

type MetaVariables = {
    [key: string]: (value: string, card: any, cards: Array<any>) => void
}

function applyMetaVariableEffects(metaVariables: MetaVariables, cards: Array<any>, metaIndic = '_') {
    return _.reduce(cards,
        (result, card) => {
            result.push(card);
            _.chain(card)
                .pickBy((value, key) => key.startsWith(metaIndic))
                .mapKeys((value, key) => key.slice(1))
                .each((value, key) => {
                    const action = metaVariables[key];
                    if (action) action(value, card, result);
                })
                .value()
            return result;
        },
        Array<any>()
    );
}

const metaVariables: MetaVariables = {
    "COUNT": (value, card, cards) => {
        let val = parseInt(value);
        if (val < 0) val = 0;
        const start = cards.length;
        const newLength = cards.length + val - 1;
        if (newLength >= 0) {
            cards.length = cards.length + val - 1;
            _.fill(cards, card, start);
        }
    },
    "SKIP": (value, card, cards) => {
        let val = parseInt(value);
        if (val >= 1 || value == "TRUE") {
            _.remove(cards, card)
        }
    }
}

export function getBoxStyleFromType(box:CardTypeBox):any{
    switch(box.type){
        case "text":
            return `
                color: ${box.data.color};
                font-size: ${box.data.size?`${box.data.size}pt`:'inherit'};
                font-family: ${box.data.font?box.data.font.replace(/\"/g,""):"inherit"};
                font-weight: ${box.data.weight};
                font-style: ${box.data.style};
                text-align: ${box.data.align};
                line-height: ${box.data.lineHeight || 'normal'};
                overflow: ${box.data.overflow || 'visible'};
                ${box.data.custom || ''}
            `
    }

    return {}
}

export async function renderSelectionToHtml(project: Project, selection: ProjectSelection): Promise<string | null> {
    if (!project) return null;
    if (!selection) return null;
    if (!selection.sourceType) return null;
    if (!selection.layoutId) return null;
    if (!selection.cardTypeId) return null;
    //if (!selection.cardType.template) return null;
    //if (!selection.layout.template) return null;

    const cardType = project.cardTypes[selection.cardTypeId];
    const layout = project.layouts[selection.layoutId];
    const data = getDataBySourceTypeAndCardType(project,selection.sourceType,selection.cardTypeId);

    if(!cardType) return null;
    if(!layout) return null;
    if(!data) return null;
    if(!layout.template) return null;

    const cardTypeTemplate = cardType.config.advanced?(cardType.template?project.files[cardType.template].content:null):CardTypeCanvasTemplate;
    const layoutTemplate = project.files[layout.template].content;

    if (!cardTypeTemplate) return null;
    if (!layoutTemplate) return null;


    let cards = applyMetaVariableEffects(metaVariables, data.cards);

    if (selection.pages.length > 0) {
        const cardsPerPage = layout.cardsPerPage;
        cards = _.reduce(selection.pages, (selectedCards: any[], o) => {
            const i = o - 1;
            const start = i * cardsPerPage;
            const end = start + cardsPerPage;
            const extractedCards = cards.slice(start, end);
            return selectedCards.concat(extractedCards);
        }, [])
    }

    const filters = {
        'boxes': (env:nunjucks.Environment) => (card:any,isRecto: boolean | string = true) => {
            if(cardType){
                const face =  typeof (isRecto) === 'boolean' ? (isRecto?"recto":"verso") : isRecto; 
                const boxes = _.chain(cardType.canvas.boxes)
                    .filter(['face',face])
                    .filter( o => {
                        if(o.variants.length == 0) return true;
                        return o.variants.indexOf(card["_VARIANT"] || 'default') >= 0;
                    })
                    .map( o => {

                        const style = `
                            position: absolute;
                            top:${cssDimensionValue(o.top)};
                            left:${cssDimensionValue(o.left)};
                            right:${cssDimensionValue(o.right)};
                            bottom:${cssDimensionValue(o.bottom)};
                            width:${cssDimensionValue(o.width)};
                            height:${cssDimensionValue(o.height)};
                            z-index:${cssZIndexValue(o.zIndex)};
                            ${getBoxStyleFromType(o)}
                        `;
                        return {
                            ...o,
                            style:style.replace(/(\r\n|\n|\r| )/gm,"")
                        };
                    })
                    .value();
                return env.renderString(CardTypeCanvasBoxes, { card, boxes });
            }
            return '';
        }
    }

    return renderNJKToHtml(
        cardTypeTemplate,
        layoutTemplate,
        cards,
        {
            base: cardType.base || '',
            cardTypeWidth:cardType.config.width,
            cardTypeHeight:cardType.config.height,
        },
        {
            base: layout.base,
            haveVerso:cardType.config.haveVerso,
            layoutCSSPath: layout.styles || '',
            templateCSSPath: cardType.config.advanced?(cardType.styles || ''):''
        },
        filters
    )

}

export function renderNJKToHtml(
    template: string,
    layout: string,
    cards: any[],
    templateGlobalVars?: any,
    layoutGlobalVars?: any,
    filters?:{
        [key:string]:(env:nunjucks.Environment) => (...args: any[]) => any
    }
): string | null {

    const env = new nunjucks.Environment(null,{ autoescape: false });

    for(var key in filters){
        env.addFilter(key,filters[key](env));
    }

    env.addFilter('template', function (card, isRecto: boolean | string = true) {
        const aCard = { ...card, isRecto: typeof (isRecto) === 'boolean' ? isRecto : isRecto == "recto" }
        return env.renderString(template, { card: aCard, ...templateGlobalVars });
    });

    const variables = { cards, ...layoutGlobalVars };

    return env.renderString(layout, variables);

}

