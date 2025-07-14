declare module 'headless-terminal' {
    export default class Terminal {
        constructor(columns: number, rows: number);
        write(data: string): void;
        reset(): void;
        on(event: string, callback: (buffer: any) => void): void;
        displayBuffer: {
            toString(): string;
        };
    }
}