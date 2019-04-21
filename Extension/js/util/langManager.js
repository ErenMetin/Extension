var defaultLanguage = null,
	currLanguage = null;

//* Load languages if set
loadLanguages();

async function loadLanguages() {
	return new Promise(function(resolve, reject) {
		chrome.storage.sync.get('settings', function(res) {
			if (res.settings == undefined) return;

			chrome.storage.local.get('languages', function(res1) {
				if (res1.languages == undefined) {
					reject();
					return;
				}
				PMD_info('Loaded translations');

				resolve();
				defaultLanguage = res1.languages.default;
				currLanguage = res1.languages[res.settings.language.value];
			});
		});
	});
}

function updateLanguages() {
	chrome.storage.sync.get('settings', async function(res) {
		if (res.settings == undefined) return;

		PMD_info(`Updating translations for en && ${res.settings.language.value.toLowerCase()}`);
		defaultLanguage = await fetchJSON(`https://api.premid.app/langFile/en`);
		var result = await fetchJSON(`https://api.premid.app/langFile/${res.settings.language.value.toLowerCase()}`);

		if (result.error != undefined) {
			PMD_error(
				`Failed to fetch language file by code: ${res.settings.language.value.toLowerCase()}, using default language instead`
			);
			currLanguage = defaultLanguage;
			return;
		} else currLanguage = result;

		chrome.storage.local.set({
			languages: {
				default: defaultLanguage,
				[res.settings.language.value.toLowerCase()]: currLanguage
			}
		});
	});
}

async function getString(string) {
	await loadLanguages();
	if (currLanguage[string] != undefined) return currLanguage[string];
	if (currLanguage[string] == undefined && defaultLanguage[string] != undefined) return defaultLanguage[string];
	if (currLanguage[string] == undefined && defaultLanguage[string] == undefined) {
		PMD_error(`No translation found for ${string}`);
		return null;
	}
}
