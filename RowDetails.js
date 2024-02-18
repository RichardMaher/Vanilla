import WebPage from "/Vanilla/WebPage.js";
import globalState from "/Vanilla/GlobalStateManager.js";

export default class RowDetails extends WebPage
{	
	#visibilityState;

	constructor(templateId) 
	{
		super(templateId);
    }
	
	back()
	{
		super.back();
	}
	
	unload()
	{
		super.unload();
	}
  
}
