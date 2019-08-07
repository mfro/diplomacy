declare interface Window {
    devtoolsFormatters?: DevtoolsFormatter[];
}
declare namespace NodeJS {
    interface Global {
        devtoolsFormatters?: DevtoolsFormatter[];
    }
}

interface DevtoolsFormatter {
    header(object: any, config: any): any;
    hasBody(object: any, config: any): boolean;
    body(object: any, config: any): any;
}
