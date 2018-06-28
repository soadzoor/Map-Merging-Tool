var Merge = /** @class */ (function () {
    function Merge() {
        var _this = this;
        this.onMapUpload = function (event) {
            var file = event.currentTarget.files[0];
            var mapType = event.currentTarget.name;
            var reader = new FileReader();
            reader.onload = function (event) {
                var img = new Image();
                img.onload = function () {
                    var canvas = _this["_" + mapType].canvas = document.createElement('canvas');
                    _this._width = canvas.width = img.width;
                    _this._height = canvas.height = img.height;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                };
                img.src = event.target.result;
            };
            if (file) {
                _this["_" + mapType].isPNG = (file.type.indexOf('png') !== -1);
                reader.readAsDataURL(file);
            }
            else {
                _this["_" + mapType] = null;
            }
        };
        this.merge = function () {
            _this._mergedMap.width = _this._width;
            _this._mergedMap.height = _this._height;
            var array = [
                _this._aoMap,
                _this._roughnessMap,
                _this._metalnessMap
            ];
            var isPNGUsed = false;
            for (var i = 0; i < array.length; ++i) {
                if (array[i].canvas) {
                    if (!isPNGUsed && array[i].isPNG) {
                        isPNGUsed = true;
                    }
                    _this.addMapToMerged(array[i].canvas, i);
                }
            }
            var dataURL = isPNGUsed ? _this._mergedMap.toDataURL() : _this._mergedMap.toDataURL('image/jpeg', 0.75);
            _this._type = isPNGUsed ? 'png' : 'jpg';
            _this.addImageToDOM(dataURL);
            // this.downloadFileFromUrl(dataURL, `mergedMap.${type}`);
        };
        this.addMapToMerged = function (map, rgb) {
            var ctx = map.getContext('2d');
            var fromImgData = ctx.getImageData(0, 0, _this._width, _this._height);
            var mergedCtx = _this._mergedMap.getContext('2d');
            var toImgData = mergedCtx.getImageData(0, 0, _this._width, _this._height);
            for (var i = 0; i < fromImgData.data.length; i += 4) {
                toImgData.data[i + rgb] = fromImgData.data[i + rgb];
                toImgData.data[i + 3] = 255;
            }
            mergedCtx.putImageData(toImgData, 0, 0);
        };
        this.addImageToDOM = function (dataURL) {
            var a = document.getElementById('mergedA');
            a.href = dataURL;
            a.download = "mergedMap." + _this._type;
            var img = document.getElementById('mergedIMG');
            img.width = _this._width;
            img.height = _this._height;
            img.src = dataURL;
        };
        this._aoMap = { canvas: null, isPNG: false };
        this._roughnessMap = { canvas: null, isPNG: false };
        this._metalnessMap = { canvas: null, isPNG: false };
        var mapElementsArray = [
            document.getElementById('uploadMetalness'),
            document.getElementById('uploadRoughness'),
            document.getElementById('uploadAO'),
        ];
        for (var _i = 0, mapElementsArray_1 = mapElementsArray; _i < mapElementsArray_1.length; _i++) {
            var element = mapElementsArray_1[_i];
            element.addEventListener('change', this.onMapUpload);
        }
        document.getElementById('merge').addEventListener('click', this.merge);
        this._mergedMap = document.createElement('canvas');
    }
    return Merge;
}());
///<reference path='./model/Merge'/>
var Main = /** @class */ (function () {
    function Main() {
        Main.instance = this;
        this._merge = new Merge();
    }
    Main.getInstance = function () {
        return Main.instance || new Main();
    };
    return Main;
}());
//# sourceMappingURL=app.js.map