interface TextureMap {
    canvas: HTMLCanvasElement;
    isPNG: boolean; /** false -> jpg */
}
declare class Merge {
    private _aoMap;
    private _roughnessMap;
    private _metalnessMap;
    private _mergedMap;
    private _width;
    private _height;
    private _type;
    constructor();
    private onMapUpload;
    private merge;
    private addMapToMerged;
    private addImageToDOM;
}
declare class Main {
    static instance: Main;
    static getInstance(): Main;
    private _merge;
    constructor();
}
