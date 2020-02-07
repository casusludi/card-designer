export default function reducer(state:any, action:any) {
    const newState = {...state};
    switch (action.type) {
        case "REMOVE_ITEM":
            // change newState
            break;
        default:
            return state;
    }
    return newState;
}
