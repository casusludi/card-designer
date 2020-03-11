import _ from 'lodash';
import nunjucks from 'nunjucks';
import { ProjectSelection, Project } from '.';

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

export async function renderSelectionToHtml(project: Project, selection: ProjectSelection): Promise<string | null> {
    if (!project) return null;
    if (!selection.data) return null;
    if (!selection.layout) return null;
    if (!selection.cardType) return null;
    if (!selection.cardType.template) return null;
    if (!selection.layout.template) return null;

    const template = project.files[selection.cardType.template].content;
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
        }
    )

}

export function renderNJKToHtml(
    template: string,
    layout: string,
    cards: any[],
    templateGlobalVars?: any,
    layoutGlobalVars?: any,
): string | null {

    const env = new nunjucks.Environment();

    env.addFilter('template', function (card, isRecto: boolean | string = true) {
        const aCard = { ...card, isRecto: typeof (isRecto) === 'boolean' ? isRecto : isRecto == "recto" }
        return env.renderString(template, { card: aCard, ...templateGlobalVars });
    });

    const variables = { cards, ...layoutGlobalVars };

    return env.renderString(layout, variables);

}

