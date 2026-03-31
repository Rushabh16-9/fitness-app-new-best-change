/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
interface Document {
    exitFullscreen(): void;
    fullscreenElement: Element;
    msExitFullscreen(): void;
    msFullscreenElement: Element;
    mozCancelFullScreen(): void;
    mozFullScreenElement(): void;
    webkitFullscreenElement: Element;
    webkitExitFullscreen(): void;
    webkitCancelFullScreen(): void;  
}
declare var L:any;  //leaflet

// Shim for NoInfer type introduced in TS 5.4, required by some dependencies
type NoInfer<T> = T;