declare module NodeJS  {
    interface Global {
        sharedVars: {
            servePort:number
        }
    }
}

