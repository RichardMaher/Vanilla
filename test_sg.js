
	import * as sg from "/Vanilla/ScrollGrid.js";
	import globalState from "/Vanilla/GlobalStateManager.js";
	import HomePage from "/Vanilla/HomePage.js";
	import { ABCMenuButton } from "../MenuButton/menu-button.js"
	import RowDetails from "/Vanilla/RowDetails.js";

	var termsConsent, params, cacheManagerSubscription;
	
	document.addEventListener("DOMContentLoaded", initialize);

	function preventExit(e)
	{
		history.pushState({ stopExit: true }, "");
	}

	function openUp() {
		modalWait.style.display = "none";
	}

	function reportError(error) {
		var header  = error.header  || "Error";
		var message = error.message || "";
		var topWindow=window.top.document.open();
		topWindow.write("<!DOCTYPE html><html><body style='height: 100%;'><hr><h1>" + header + "</h1><hr>");
		topWindow.write("<h2>Please contact Support for assistance.</h2><br />");
		topWindow.write('<p style="color:red">' + message + "</p></body></html>");
		topWindow.close();
	}

	function getAmbience(){
		var displayName = document.querySelector('meta[name="application-name"]').content;

		let bodyStyle = getComputedStyle(document.body);
		let fontSize = parseInt(bodyStyle.fontSize, 10);
		if (isNaN(fontSize))
		throw new Error("Body Font Size must be stated in pixels");

		const DEFAULT_PARAMS =
		{
			currUser: null,
			fontSize: fontSize,
			installCount: 0
		}

		// font size
		//	replayRange.addEventListener("change", speedChanged);
		//	replayRange.addEventListener("input", speedChanged);

		var ambience = localStorage.getItem(displayName);

		if (!ambience)  {
			params = DEFAULT_PARAMS;
		try {
			localStorage.setItem(displayName, JSON.stringify(DEFAULT_PARAMS));
		} catch (err) {
					reportError({
						header: "Incompatible browser settings - Private Browsing",
						message: displayName + " cannot maintain LocalStorage in Private Browsing mode."
					});
				return;
			}
		} else {
			params = JSON.parse(ambience);
		}

		for (var attr in params) {
			var currParam = document.getElementById(attr + "Param");
			if (!currParam) continue;

			console.log("Params["+attr+"] = " + params[attr] + " type = " + currParam.type);

			switch(currParam.type)
			{
				case "checkbox":
					currParam.checked = params[attr];
					break;
				case "range":
					currParam.value = Number(params[attr]);
					break;
				case "select-one":
					for (var i=0; i<currParam.options.length; i++) {
						if (currParam.options[i].value == params[attr]) {
						currParam.selectedIndex = i;
					break;
						}
					}
					break;
				default:
					currParam.innerHTML = params[attr];
			}
		}
}

	function lockApproved(e) {
		termsConsent.style.display = "none";
	}

	window.addEventListener("load", () =>
			{
				preventExit();
				window.addEventListener('popstate', preventExit)

				let ss = document.getElementById("gridStyles");

				var imageDOM = document.getElementById("crest").contentDocument;
				var svgRoot = imageDOM.querySelector(':root');
				var iconStyle = getComputedStyle(document.getElementById("crest"));

				var bgColor = iconStyle.getPropertyValue('--alt-bg-color');
				if (bgColor != null)
					svgRoot.style.setProperty('--coa-bg-color', bgColor);

				var strokeColor = iconStyle.getPropertyValue('--coa-stroke-color');
				if (strokeColor != null)
					svgRoot.style.setProperty('--coa-stroke-color', strokeColor);

				var crest = imageDOM.getElementById("wa_state_crest");

				termsConsent.style.display = "block";
				getAmbience();
			});

	function buildTableLookup(page)
	{
		var closurePage = page;

		function tableLookup(e)
		{
			console.log("Lookup for table " + e.target.id);
			var elementPath = e.composedPath(); // Needs shadowDOM mode 'open'
			if (elementPath[0].nodeName != "TD")
			{
				return;
			}

			var rowClicked = elementPath[1];
			if (rowClicked.nodeName != "TR" || rowClicked.dataset.dbkey == undefined || rowClicked.cells.length < 1)
			{
				throw new Error("Bad Row");
			}

			var dbKey = rowClicked.dataset.dbkey;
			console.log("DB lookup key = " + dbKey);
			var tableBody = elementPath[2];
			var colNames = tableBody.dataset.colNames.split(",");
			var formData = {"dbKey":{"textContent": dbKey}};
			var skipCols = 1;
			var dataCols = 0;
			for (let i=0; i<colNames.length; i++)
			{
				if (--skipCols != 0) {
						formData[colNames[i]] = { "textContent": "" };
					continue;
				}

				skipCols = rowClicked.children[dataCols].colSpan;
				formData[colNames[i]] = {"textContent": rowClicked.children[dataCols++].textContent};
			}
			closurePage.init(closurePage.root, "span.colValue", formData);
			closurePage.load();
		}

		return tableLookup;
}

	async function initialize()
	{
		globalState.setItem("pageContainer", document.getElementById("content"));
		console.log("pc " + globalState.getItem("pageContainer").id);
		let pageStack = globalState.getItem("pageStack");
		let homePage = new HomePage();
		homePage.root.id = "home";
		homePage.classList = "page";
		homePage.load();
		console.log("ps " + globalState.getItem("pageStack").length);

		termsConsent = document.getElementById("termsConsent");

		let menuButton = document.getElementById("menuButton");
		menuButton.addEventListener('click', (e) => {
						console.log("been clicked " + menuButton.clicked);
					});

//		const baseURL = "http://localhost";
		const baseURL = "https://richardmaher.github.io";


		var dimCols = [
			{"width": 25},
			{"width": 30},
			{"width": 20},
			{"width": 25}
		];

		var colHdrs = [
			[{colSpan: 4, text:"First Header"}],
			[{text:" Col 1"},{text:" Col 2"},{text:" Col 3"},{text:" Col 4"}]
		];

		var demo = document.getElementById("home");

		// load css at run-time, just to show how

		var userStyles = "/Vanilla/caller.css";

		let myCSSMod, userStylesURL;
		let userSheet = false;

		if (userStyles != undefined && userStyles != null) {
			if (typeof userStyles == "string") {
				try
					{
						userStylesURL = new URL(userStyles, baseURL);
				} catch (err) {
						console.log(err.message);
				}
				if (userStylesURL != undefined) {
					userSheet = (userStylesURL.protocol == "http:" || "htps:")
				}
			}
		}
		
		if (userSheet)
		{
			myCSSMod = new CSSStyleSheet({ baseURL: userStylesURL, media: "all" });
		}

		document.getElementById("backButton").addEventListener("click",
					(e) => {
						if (e.target.id != "backButton" || e.target.style.visibility == "hidden")
						{
							Utils.stopEvent(e);
							return;
						}

						let pageStack = globalState.getItem("pageStack");
						if (pageStack.length < 2)
						throw new Error("Page stack is corrupt");

						pageStack[pageStack.length - 1].unload();
					});
					
		document.getElementById("noWorries").addEventListener("click", 
			(e) => {
						e.target.closest("div").style.display = "none";
						openUp();

					});
					
		if ("serviceWorker" in navigator) {					
			await navigator.serviceWorker.register('/Vanilla/CacheManager.js', { scope: '/Vanilla/', type: 'module' })
				.then(reg => {
						console.log('SW Registered');
					})
				.catch(err => {
					console.log('SW Registration failed with ' + err)
				});
				
			await navigator.serviceWorker.ready
				.then(subscription => {cacheManagerSubscription = subscription})
						.catch(err => {
								console.log('Cache Manager Subscription failed with ' + err)
							});
		}

		let options = {dataset: {colNames: "Name,Address,BirthDate,Occupation"}};

//		var x = new sg.ScrollGrid("myTable", dimCols, options, myCSSMod.default);
		var x = new sg.ScrollGrid("myTable", dimCols, options, userStylesURL);

		x.setColumnHeader(colHdrs);

		demo.appendChild(x.root);

		var detailsPage = new RowDetails("rowDumpTemplate");

		detailsPage.back();

		x.root.addEventListener("click", buildTableLookup(detailsPage));

		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo foo foo foo foo bar bar bar bar bar foo foo foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});

		x.appendSubheader({ },{text: 'foo', colSpan: '4'});


		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo', colSpan: '2'},{text: 'foo'},{text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'foo'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});
		x.appendRow({dataset: {dbkey: crypto.randomUUID()}},{text: 'last'},{text: 'foo'},{text: 'foo'}, {text: 'foo'});

		dimCols = [
			{"width": 10},
			{"width": 50},
			{"width": 40}
		];

		colHdrs = [
			[{colSpan: 3, text:"Header For 2 row grid"}],
			[{text:" Col A"},{text:" Col B"},{text:" Col C"}]
		];
		var y = new sg.ScrollGrid("myTable2", dimCols, options, userStylesURL);

		y.setColumnHeader(colHdrs);

		demo.appendChild(y.root);

		y.appendRow({ },{text: 'abc'},{text: 'abc'},{text: 'abc'});
		y.appendRow({ },{text: 'abc'},{text: 'abc'},{text: 'abc'});
		y.appendRow({ },{text: 'abc'},{text: 'abc'},{text: 'abc'});
		y.appendRow({ },{text: 'abc'},{text: 'abc abc abc abc abc abc abc abc abc abc '},{text: 'abc'});
	}

