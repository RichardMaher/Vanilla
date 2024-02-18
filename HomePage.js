import WebPage from "/Vanilla/WebPage.js";
import globalState from "/Vanilla/GlobalStateManager.js";

export default class HomePage extends WebPage
{	
	#visibilityState;

	constructor() 
	{
		super();
    }
	
	back()
	{
		return;
	}
	
	load()
	{
		this.parentPage.appendChild(this.root);
		this.pageStack.push(this);		
	}

	unload()
	{
		return;
	}
  
}
