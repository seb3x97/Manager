/* CONSTANTES */

// Liste des proxy
const proxys = [
	'', // try without proxy first
	'https://api.codetabs.com/v1/proxy/?quest='
];


/**
 * On rcupére l'url en argument
 */
function getUrl() {
	// On essaye de récupérer l'url
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const url = urlParams.get('src')
	if(url == null) return null;

	// On format l'url
	const formatUrl = url.replace(/\/\/github\.com/, '//raw.githubusercontent.com')
						 .replace(/\/blob\//, '/');

	// On retourne l'url formattée
	return formatUrl
};



(function () {
	//On essaye de récupérer l'url
	const url = getUrl();
	if(url == null) return;
	
	/**
	 * On remplace les assets
	 */
	function replaceAssets() {
		//Framesets
		if (document.querySelectorAll('frameset').length) return; //Don't replace CSS/JS if it's a frameset, because it will be erased by document.write()
		
		//Frames
		const frame = document.querySelectorAll('iframe[src],frame[src]');
		for (let i = 0; i < frame.length; ++i) {
			const src = frame[i].src; //Get absolute URL
			if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				frame[i].src = '//' + location.hostname + location.pathname + '?' + src; //Then rewrite URL so it can be loaded using CORS proxy
			}
		}

		//Links
		const a = document.querySelectorAll('a[href]');
		for (let i = 0; i < a.length; ++i) {
			const href = a[i].href; //Get absolute URL
			if (href.indexOf('#') > 0) { //Check if it's an anchor
				a[i].href = '//' + location.hostname + location.pathname + location.search + '#' + a[i].hash.substring(1); //Then rewrite URL with support for empty anchor
			} else if ((href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) && (href.indexOf('.html') > 0 || href.indexOf('.htm') > 0)) { //Check if it's from raw.github.com or bitbucket.org and to HTML files
				a[i].href = '//' + location.hostname + location.pathname + '?' + href; //Then rewrite URL so it can be loaded using CORS proxy
			}
		}

		//Stylesheets
		const links = [];
		const link = document.querySelectorAll('link[rel=stylesheet]');
		for (let i = 0; i < link.length; ++i) {
			const href = link[i].href; //Get absolute URL
			if (href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				links.push(fetchProxy(href, null, 0)); //Then add it to links queue and fetch using CORS proxy
			}
		}
		Promise.all(links).then(function (res) {
			for (i = 0; i < res.length; ++i) {
				loadCSS(res[i]);
			}
		});

		//Scripts
		const scripts = [];
		const script = document.querySelectorAll('script[type="text/htmlpreview"]');
		for (let i = 0; i < script.length; ++i) {
			const src = script[i].src; //Get absolute URL
			if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				scripts.push(fetchProxy(src, null, 0)); //Then add it to scripts queue and fetch using CORS proxy
			} else {
				script[i].removeAttribute('type');
				scripts.push(script[i].innerHTML); //Add inline script to queue to eval in order
			}
		}
		Promise.all(scripts).then(function (res) {
			for (let i = 0; i < res.length; ++i) {
				loadJS(res[i]);
			}
			document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true, cancelable: true})); //Dispatch DOMContentLoaded event after loading all scripts
		});
	};

	function loadHTML(data) {
		if (data == null) return;
		data = data.replace(/<head([^>]*)>/i, '<head$1><base href="' + url + '">').replace(/<script(\s*src=["'][^"']*["'])?(\s*type=["'](text|application)\/javascript["'])?/gi, '<script type="text/htmlpreview"$1'); //Add <base> just after <head> and replace <script type="text/javascript"> with <script type="text/htmlpreview">
		setTimeout(function () {
			document.open();
			document.write(data);
			document.close();
			replaceAssets();
		}, 10); //Delay updating document to have it cleared before	
	};

	function loadCSS(data) {
		if (data == null) return;
		const style = document.createElement('style');
		style.innerHTML = data;
		document.head.appendChild(style);
	};

	function loadJS(data) {
		if (data == null) return;
		const script = document.createElement('script');
		script.innerHTML = data;
		document.body.appendChild(script);
	};
	
	function fetchProxy(url, options, i) {
		return fetch(proxys[i] + url, options).then(function (res) {
			if (!res.ok) throw new Error(`Cannot load '${url}': ${res.status} ${res.statusText}`);
			return res.text();
		}).catch(function (error) {
			if (i === proxys.length - 1) throw error;
			return fetchProxy(url, options, i + 1);
		})
	};

	if (url && (location.hostname.length === 0 || url.indexOf(location.hostname) < 0)) {
		fetchProxy(url, {
			mode: 'cors',
			cache: 'no-cache',
		}, 0).then(loadHTML).catch(function (error) {
			console.error(error);
		});
		console.log("pass");
	}

})()