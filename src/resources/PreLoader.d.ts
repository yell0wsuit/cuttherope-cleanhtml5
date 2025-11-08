declare module "@/resources/PreLoader" {
    type PreloaderCallback = (() => void) | null | undefined;

    interface PreLoaderModule {
        start(): void;
        domReady(): void;
        run(callback: PreloaderCallback): void;
        startResourceLoading(): void;
    }

    const preLoader: PreLoaderModule;
    export default preLoader;
}
