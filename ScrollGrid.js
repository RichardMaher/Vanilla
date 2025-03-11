import { Utils } from '/Vanilla/Utils.js';

export class ScrollGrid
{	
	#host;
	#shadowRoot;
	#cols;
	#tableHdr;
	#tableBody;
	#hdrSpacer;
	#isScrolling;
	
	constructor(id, cols=[], options={}, userStyles) 
	{
		if (id == undefined ||
			id == null ||
			typeof id != "string" ||
			!/^[a-zA-Z0-9_-]*$/.test(id)||
			cols == undefined || 
			cols == null || 
			!Array.isArray(cols) || 
			cols.length == 0   
			)
		{
			throw new Error("Bad Parameter");
		}
		
		options = options == null ? {} : options;
		
		if(document.getElementById(id) != null)
		{
			throw new Error(`ID ${id} is already in use in this document.`);
		}
		
		this.#cols = cols;
		this.#host = document.createElement("div");
		this.#host.id = id;
		this.#shadowRoot = this.#host.attachShadow({mode:"open"});	
		this.#isScrolling = false;

		if (userStyles != undefined && userStyles != null) {
			switch (true) {
				case	userStyles instanceof URL:
					console.log("URL");
					if (!(userStyles.protocol == "http:" || "htps:")) {
						throw new Error("Invalid protocol for URL");
					}
					let link = document.createElement('link');
					link.href = userStyles.href;
					link.rel = "stylesheet";
					link.type = "text/css";
					this.#shadowRoot.appendChild(link);
					break;
				case	userStyles instanceof CSSStyleSheet:
					console.log("CSSStyleSheet");
					if (userStyles.type.toLowerCase() != "text/css") {
						throw new Error("Stylesheet Type must be 'text/css'");
					}
					this.#shadowRoot.adoptedStyleSheets.push(userStyles);
					break;
				default:
					throw new Error("The userStyles parameter must be a URL or a CSSStyleSheet");
			}
		}
		
		let link = document.createElement('link');
		link.href = "/Vanilla/ScrollGrid.css";
		link.rel = "stylesheet";
		link.type = "text/css";
		this.#shadowRoot.appendChild(link);
				    
		let colsWidth = "";
		let totalPerc = 0;
		for (let i=0; i<cols.length; i++)
		{
			if (cols[i].width == undefined || cols[i].width == null || !/^[0-9]*$/.test(cols[i].width)) {
				throw new Error("Bad column width")
			}
			totalPerc += cols[i].width;
			colsWidth += "table td:nth-child(" + (i+1) + "), .hdr-spacer th:nth-child(" + (i+1) + ") {width: " + cols[i].width + "% }"
		}
		
		if (totalPerc != 100)
		{
			throw new Error("Total percent column width must be 100");
		}
		
		this.#shadowRoot.innerHTML += '								\
				<div class="scrollContainer">						\
					<div class="xScroll">							\
						<table class="__header-table"></table>		\
						<div class="yScroll">						\
							<table class="__body-table">			\
								<tbody></tbody>						\
							</table>								\
						</div>										\
					</div>											\
				</div>';

		let localSheet = new CSSStyleSheet();
		localSheet.replaceSync(colsWidth);
		
		this.#shadowRoot.adoptedStyleSheets.push(localSheet);		
		this.#tableHdr = this.#shadowRoot.querySelector(".__header-table");
		
		this.#tableBody = this.#shadowRoot.querySelector(".__body-table tbody");
		if (options.dataset != undefined)
		{
			for (let dataItem in options.dataset)
			{
				this.#tableBody.dataset[dataItem] = options.dataset[dataItem];
			}
		}
		
		this.#hdrSpacer = document.createElement("tr");
		this.#hdrSpacer.classList.add("hdr-spacer");
		for (let i=0; i<cols.length; i++) 
		{
			let col = document.createElement("th");
			this.#hdrSpacer.appendChild(col);
		}
		
		this.#scrollClosure();	
		
		this.#buildObserver(this.#shadowRoot, this.#connected);
	}
	
	#buildObserver(shadow, connected) 
	{
		var root = shadow;
		var callback = connected;
		var observer = new MutationObserver((mutations, myInstance) => {
				var touchDown = false;
				
				outer:
					for (var i=0; i<mutations.length; i++)
					{
						if (mutations[i].type != "childList" ||
							mutations[i].addedNodes.length   == 0) 
								continue;
								
						for (var j=0; j<mutations[i].addedNodes.length; j++) 
						{
							var node = mutations[i].addedNodes[j];
							if (node.tagName == "DIV" && node.id == root.host.id)
							{
								touchDown = true;
								break outer;
							}
						}
					}
					
				if (touchDown) {
					connected(root);
					console.log("Got Marker");
					myInstance.disconnect();
				}				
			});
			
		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
			attributes: false,
			characterData: false
		})

	}
	
	#connected(root) {
		console.log("In connected");
		root.host.style.setProperty('--header-background-color', Utils.findBackgroundColor(root.querySelector('.__header-table tbody > tr  th')));
	}
		
	#scrollClosure()
	{
		 let xScroll = this.#shadowRoot.querySelector(".xScroll");
		 let yScroll = this.#shadowRoot.querySelector(".yScroll");
		 let scrollHandler = this.#setScroll;
		 let hasScrollBar = this.#hasScrollBar;
		 
		 xScroll.addEventListener("scroll", (e) => {
					scrollHandler(xScroll, yScroll);
				});
		 
		 window.addEventListener("resize", (e) => {
					scrollHandler(xScroll, yScroll);
					hasScrollBar(yScroll, "y");
				});
		 
		 screen.orientation.addEventListener("change", (e) => {
					scrollHandler(xScroll, yScroll);
					hasScrollBar(yScroll, "y");
				});
		 
	}
	
	#setScroll(xScroll, yScroll)
	{
		let xStyle = getComputedStyle(xScroll);
		yScroll.style.width = (Number(xStyle.width.match("[0-9.]*")) + Number(xScroll.scrollLeft)) + "px";
	}
	
	setColumnHeader(colHdrs, hdrOptions=[]) 
	{
		hdrOptions = hdrOptions == null ? [] : hdrOptions;	
		if (colHdrs == undefined     	|| 
			colHdrs == null          	|| 
			!Array.isArray(colHdrs)  	||
 			!Array.isArray(hdrOptions)  || 
			colHdrs.length == 0   
			)
		{
			throw new Error("Bad Parameter");
		}

		const newHdrTable = document.createElement("table");
		newHdrTable.classList.add("__header-table");
		const hdrBody = document.createElement("tbody");
		hdrBody.appendChild(this.#hdrSpacer);
		
		var options;
		
		for (let i=0; i<colHdrs.length; i++)
		{			
			if (!Array.isArray(colHdrs[i])  || 
				colHdrs[i].length == 0   
				)
			{
				throw new Error("Bad Parameter");
			}
			
			options = hdrOptions[i] == undefined ? {} : hdrOptions[i];
			hdrBody.appendChild(this.#makeRow("th", options, colHdrs[i]));			
		}
			
		newHdrTable.appendChild(hdrBody);	
		this.#tableHdr.replaceWith(newHdrTable);
		this.#tableHdr = newHdrTable;
	}
	
	appendRow()
	{
		if (arguments.length < 2) 
		{
			throw new Error("Bad Parameter");
		}
		let colArgs = Array.from(arguments);
		
		let options = colArgs.shift();
		options = options == null || options == undefined ? {} : options;
		
		this.#tableBody.appendChild(this.#makeRow("td", options, colArgs));
		
		let yScroll = this.#shadowRoot.querySelector(".yScroll");
		
		if (!this.#host.isConnected || this.#isScrolling) 
		{
			return;
		}
		
		let scrollBarWidth = this.#hasScrollBar(yScroll,"y");
		
		if (scrollBarWidth != 0) 
		{
			this.#shadowRoot.host.style.setProperty('--scroll-bar-width', scrollBarWidth + "px");
			var hdrStyle = getComputedStyle(this.#tableHdr);
			this.#tableHdr.style.minWidth = (Number(hdrStyle.minWidth.match("[0-9.]*")) + scrollBarWidth) + "px";;
			this.#isScrolling = true;
		}
	}
	
	#hasScrollBar(elem, axis) 
	{
		let elemStyle = getComputedStyle(elem);
				
		let offsetWidth = elem.offsetWidth;
		offsetWidth -= (Number(elemStyle.borderLeftWidth.match("[0-9.]*")) + Number(elemStyle.borderRightWidth.match("[0-9.]*")))
		if (offsetWidth != elem.clientWidth) 
		{
			console.log("scrolling");
		}
		return (offsetWidth - elem.clientWidth);
	}
	
	appendSubheader()
	{
		if (arguments.length < 2) 
		{
			throw new Error("Bad Parameter");
		}		
		let colArgs = Array.from(arguments);
		
		let options = colArgs.shift();
		options = options == null || options == undefined ? {} : options;
		
		let row = document.createElement("tbody");
		row.classList.add("__sub-header");
		this.#tableBody.appendChild(row);
		
		this.#tableBody.appendChild(this.#makeRow("th", options, colArgs));
	}
	
	#makeRow(colType, options, cols)  
	{
		let tableRow = document.createElement("tr");
		if (options.dataset != undefined)
		{
			for (let dataItem in options.dataset)
			{
				tableRow.dataset[dataItem] = options.dataset[dataItem];
			}
		}
		
		let rowCol;
		let totalCols = 0;
		
		for (let i=0; i<cols.length; i++)
		{
			rowCol = document.createElement(colType);
			
			if (cols[i].colSpan != undefined) 
			{
				if (cols[i].colSpan == null || !/^[0-9]*$/.test(cols[i].colSpan ) || cols[i].colSpan == 0 || cols[i].colSpan > this.#cols.length - totalCols) 
				{
					throw new Error("Bad column span")
				}
				totalCols += cols[i].colSpan;
				rowCol["colSpan"] = cols[i].colSpan;
			}
			else
			{
				totalCols++;
			}

			if (cols[i].text != undefined && cols[i].text != null)
			{
				rowCol.textContent = cols[i].text;
			}
			tableRow.appendChild(rowCol);
		}
		
		if (totalCols != this.#cols.length)
		{
			throw new Error("Insufficient columns")
		}
		
		return tableRow;		
	}
	
	get root()
	{
		return this.#host;
	}
		
}
