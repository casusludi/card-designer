


export function withError() {
    return (t: Error) => ({ payload: t,error:true })
}