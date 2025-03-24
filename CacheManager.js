import {config} from "/Vanilla/config.js"

const CACHE_NAME    = config.cacheName
console.log(CACHE_NAME)
	
self.addEventListener('install', (e) => 
{
	try {
 	e.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll([
				'/Vanilla/test_sg9.html',
				'/Vanilla/Scales.png',
				'/Vanilla/GlobalStateManager.js',
				'/Vanilla/HomePage.js',
				'/Vanilla/RowDetails.js',
				'/Vanilla/ScrollGrid.css',
				'/Vanilla/ScrollGrid.js',
				'/Vanilla/CacheManager.js',
				'/Vanilla/Utils.js',
				'/Vanilla/test_sg.json',
				'/Vanilla/WebPage.js',
				'/Vanilla/coa.css',
				'/Vanilla/coa.svg',
				'/Vanilla/caller.css'
		  ]).then(async () => await self.skipWaiting())
		})
	)
	} catch(err) {
		console.log(err);
	}
	console.log("Leaving install")
})
	
self.addEventListener('activate', (e) => 
{
	e.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(keyList.map((key) => {
				if (key !== CACHE_NAME) {
					console.log('Removing cache', key);
					return caches.delete(key);
				}
			}))
		})
	)

	e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (e) => 
{
	console.log(e.request.url + " my origin " + self.location.origin)
	if (e.request.url.startsWith(self.location.origin)) {
		e.respondWith(
			caches.match(e.request.url, { ignoreVary: true }).then((response) => {
				console.log("Request " + e.request.url)
				if (response) {
					console.log("Response " + response.url)
				} else
					console.log("No MATCH")

				return response || fetch(e.request)
			})
		)
	} else
		return fetch(e.request);
})
