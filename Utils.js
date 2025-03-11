
export class Utils 
{
	static staticField = 0;
	
	static getScrollBarWidth() 
	{
		let outer = document.createElement("div");
		outer.style.visibility = "hidden";
		outer.style.width = "100px";
		outer.style.msOverflowStyle = "scrollbar";
		document.body.appendChild(outer);
		let widthNoScroll = outer.offsetWidth;

		outer.style.overflow = "scroll";
		let inner = document.createElement("div");
		inner.style.width = "100%";
		outer.appendChild(inner);
		let widthWithScroll = inner.offsetWidth;

		outer.parentNode.removeChild(outer);

		return widthNoScroll - widthWithScroll;
	}
	
	static findBackgroundColor(elem) {
			if (typeof elem != "Element")
				return "rgba(0, 0, 0, 0)";
			
			let elemStyle = getComputedStyle(elem);
			if (elemStyle.backgroundColor != "rgba(0, 0, 0, 0)") 
			{
				return elemStyle.backgroundColor;
			}
			else {
				if (elem.parentNode == null || elem.parentNode.nodeName == "BODY") {
					return elem.backgrounColor;
				}
				else {
					return this.findBackgroundColor(elem.parentNode);
				}
			}
	}
	
}

