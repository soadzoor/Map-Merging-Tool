interface TextureMap
{
	canvas: HTMLCanvasElement;
	isPNG: boolean; /** false -> jpg */
}

class Merge
{
	private _aoMap: TextureMap;
	private _roughnessMap: TextureMap;
	private _metalnessMap: TextureMap;
	private _mergedMap: HTMLCanvasElement;

	private _width: number;
	private _height: number;

	private _type: string;

	constructor()
	{
		this._aoMap = {canvas: null, isPNG: false};
		this._roughnessMap = {canvas: null, isPNG: false};
		this._metalnessMap = {canvas: null, isPNG: false};

		const mapElementsArray = [
			document.getElementById('uploadMetalness'),
			document.getElementById('uploadRoughness'),
			document.getElementById('uploadAO'),
		];

		for (const element of mapElementsArray)
		{
			element.addEventListener('change', this.onMapUpload);
		}

		document.getElementById('merge').addEventListener('click', this.merge);

		this._mergedMap = document.createElement('canvas');
	}

	private onMapUpload = (event: Event) =>
	{
		const file = (<any>event.currentTarget).files[0];
		const mapType = (<any>event.currentTarget).name;

		const reader = new FileReader();

		reader.onload = (event: FileReaderProgressEvent) =>
		{
			const img = new Image();
			img.onload = () =>
			{
				const canvas = this[`_${mapType}`].canvas = document.createElement('canvas');
				this._width = canvas.width = img.width;
				this._height = canvas.height = img.height;

				const ctx = canvas.getContext('2d');
				ctx.drawImage(img,0,0);
			};
			img.src = event.target.result;
		};

		if (file)
		{
			this[`_${mapType}`].isPNG = (file.type.indexOf('png') !== -1);
			reader.readAsDataURL(file);
		}
		else
		{
			this[`_${mapType}`] = null;
		}
	};

	private merge = () =>
	{
		this._mergedMap.width = this._width;
		this._mergedMap.height = this._height;

		const array = [
			this._aoMap,
			this._roughnessMap,
			this._metalnessMap
		];

		let isPNGUsed = false;
		for (let i = 0; i < array.length; ++i)
		{
			if (array[i].canvas)
			{
				if (!isPNGUsed && array[i].isPNG)
				{
					isPNGUsed = true;
				}

				this.addMapToMerged(array[i].canvas, i);
			}
		}

		const dataURL = isPNGUsed ? this._mergedMap.toDataURL() : this._mergedMap.toDataURL('image/jpeg', 0.75);
		this._type = isPNGUsed ? 'png' : 'jpg';

		this.addImageToDOM(dataURL);
		// this.downloadFileFromUrl(dataURL, `mergedMap.${type}`);
	};

	private addMapToMerged = (map: HTMLCanvasElement, rgb: number) => /** R: 0, G: 1, B: 2 */
	{
		const ctx = map.getContext('2d');
		const fromImgData = ctx.getImageData(0, 0, this._width, this._height);

		const mergedCtx = this._mergedMap.getContext('2d');
		const toImgData = mergedCtx.getImageData(0, 0, this._width, this._height);

		for (let i = 0; i < fromImgData.data.length; i += 4)
		{
			toImgData.data[i + rgb] = fromImgData.data[i + rgb];
			toImgData.data[i + 3] = 255;
		}

		mergedCtx.putImageData(toImgData, 0, 0);
	};

	private addImageToDOM = (dataURL: string) =>
	{
		const a   = <HTMLAnchorElement>document.getElementById('mergedA');
		a.href = dataURL;
		a.download = `mergedMap.${this._type}`;

		const img = <HTMLImageElement>document.getElementById('mergedIMG');
		img.width = this._width;
		img.height = this._height;

		img.src = dataURL;
	};


	// private downloadFileFromUrl(url: string, defaultFileName: string)
	// {
	// 	const a = document.createElement('a');
	// 	a.download = defaultFileName;
	// 	a.href = url;
	// 	a.click();
	// }
}