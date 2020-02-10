
export const SHOW_ERROR_POPUP = 'SHOW_ERROR_POPUP';

export interface ShowErrorPopup {
    type: typeof SHOW_ERROR_POPUP,
    title:string,
    message: any
}

export type GlobalActionTypes = ShowErrorPopup;

