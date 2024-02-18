import globalState from "http://localhost/Vanilla/GlobalStateManager.js";

export default class WebPage
{	
	#host;
	#fieldNames;
	#pageStack;
	#parentPage;
	
	#visibilityState;

	constructor(templateId) 
	{
		this.#host = document.createElement("div");
		
		if (templateId != undefined || templateId != null)
		{			
			var template = document.getElementById(templateId);
			if (template == undefined || template.tagName != "TEMPLATE")
				throw new Error("Unknown Template " + templateId);
			
			this.#host.appendChild(template.content.cloneNode(true));
		}
		
		this.#host.classList.add("page");
		
		this.#pageStack = globalState.getItem("pageStack");
		this.#parentPage = globalState.getItem("pageContainer");
    }
	
	init(startElem, qse, formData)
	{		
		const nodeList = startElem.querySelectorAll(qse);
		for (let i = 0; i < nodeList.length; i++) {
			if (formData[nodeList[i].dataset.itemName] == undefined) {
				console.warn("No itemName available for matched Element " + nodeList[i] + " itemName " + nodeList[i].dataset.itemName);
				continue;
			}
			var attrs = formData[nodeList[i].dataset.itemName];
			if (attrs == undefined)
				continue;
			
			console.log("name = " + nodeList[i].dataset.itemName + " attr ="+attrs);
			for (let attr in attrs) {
				console.log(attr);
				nodeList[i][attr] = attrs[attr]
			}
		}
	}
	
	load()
	{
		this.#parentPage.replaceChild(this.#host, this.#pageStack[this.#pageStack.length - 1].root);
		this.#pageStack.push(this);		
		document.getElementById("backButton").style.visibility = "visible";
	}
	
	unload()
	{
		if (this.#pageStack[this.#pageStack.length - 1] != this)
		{
			throw new Error("Corrupt page stack")
		}
		
		this.#pageStack.pop();
		this.#parentPage.replaceChild(this.#pageStack[this.#pageStack.length - 1].root, this.#host);
		
		if (this.#pageStack.length == 1)
			document.getElementById("backButton").style.visibility = "hidden";
	}
	
	back()
	{
		console.log("back");
	}
 	
	get root()
	{
		return this.#host;
	}
	
	get pageStack()
	{
		return this.#pageStack;
	}
  
	
	get parentPage()
	{
		return this.#parentPage;
	}
  
}
