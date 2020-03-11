import _ from 'lodash';
import nunjucks from 'nunjucks';
import { ProjectSelection, Project, CardTypeBox } from '..';
//@ts-ignore
import CardTypeCanvasBoxes from './CardTypeCanvasBoxes.njk';
//@ts-ignore
import CardTypeCanvasTemplate from './CardTypeCanvasTemplate.njk';
import { cssDimensionValue } from '../../../utils';

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

function getBoxStyleFromType(box:CardTypeBox):any{
    switch(box.type){
        case "text":
            return {
                color: box.data.color,
                "font-size": `${box.data.size}pt`,
                "font-weight": box.data.weight,
                "font-style": box.data.style,
                "text-align": box.data.align,
            }
    }

    return {}
}

export async function renderSelectionToHtml(project: Project, selection: ProjectSelection): Promise<string | null> {
    if (!project) return null;
    if (!selection.data) return null;
    if (!selection.layout) return null;
    if (!selection.cardType) return null;
    if (!selection.cardType.template) return null;
    if (!selection.layout.template) return null;

    const template = selection.cardType.config.advanced?project.files[selection.cardType.template].content:CardTypeCanvasTemplate;
    const layout = project.files[selection.layout.template].content;

    if (!template) return null;
    if (!layout) return null;


    let cards = applyMetaVariableEffects(metaVariables, selection.data.cards);

    if (selection.pages.length > 0) {
        const cardsPerPage = selection.layout.cardsPerPage;
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
            if(selection.cardType){
                const face =  typeof (isRecto) === 'boolean' ? "recto" : isRecto; 
                const boxes = _.chain(selection.cardType.canvas.boxes)
                    .filter(['face',face])
                    .map( o => {
                        const style = {
                            position: 'absolute',
                            top:cssDimensionValue(o.top),
                            left:cssDimensionValue(o.left),
                            right:cssDimensionValue(o.right),
                            bottom:cssDimensionValue(o.bottom),
                            width:cssDimensionValue(o.width),
                            height:cssDimensionValue(o.height),
                            ...getBoxStyleFromType(o)
                        }
                        return {
                            ...o,
                            style:_.reduce(style,(str,o,k) => {
                                str += `${k}:${o};`;
                                return str
                            },"")
                        };
                    })
                    .value();

                return env.renderString(CardTypeCanvasBoxes, { card, boxes });
            }
            return '';
        }
    }

    return renderNJKToHtml(
        template,
        layout,
        cards,
        {
            base: selection.cardType?.base || ''
        },
        {
            base: selection.layout.base,
            layoutCSSPath: selection.layout.styles || '',
            templateCSSPath: selection.cardType.styles || ''
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

    const env = new nunjucks.Environment();

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

