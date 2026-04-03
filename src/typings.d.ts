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