///<reference path='./model/Merge'/>

class Main
{
	public static instance: Main;
	public static getInstance(): Main
	{
		return Main.instance || new Main();
	}

	private _merge: Merge;

	constructor()
	{
		Main.instance = this;

		this._merge = new Merge();
	}
}