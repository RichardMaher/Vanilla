import WebPage from "http://localhost/Vanilla/WebPage.js";
import globalState from "http://localhost/Vanilla/GlobalStateManager.js";

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
