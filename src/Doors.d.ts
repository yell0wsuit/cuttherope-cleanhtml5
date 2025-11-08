declare module "@/Doors" {
    interface DoorsModule {
        renderDoors(showTape: boolean, percentOpen: number): void;
        openDoors(showTape: boolean, callback?: (() => void) | null, runInReverse?: boolean): void;
        closeDoors(showTape: boolean, callback?: (() => void) | null): void;
        closeBoxAnimation(callback?: (() => void) | null): void;
        openBoxAnimation(callback?: (() => void) | null): void;
        showGradient(): void;
        hideGradient(): void;
        appReady(): void;
    }
    const Doors: DoorsModule;
    export default Doors;
}
