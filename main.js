const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	'Oct', 'Nov', 'Dec'];

function timeConverter(timestamp) {
	let d = new Date(timestamp);
	let year = d.getFullYear();
	let month = months[d.getMonth()];
	let date = d.getDate();
	return `${month} ${date}, ${year}`;
}

$(document).ready(() => {
	$.ajax("https://tools.cdc.gov/api/v2/resources/media", {
		type: "GET",
		dataType: "jsonp",
		success: (data) => {
			console.log(data);
			let ncovData = data["results"]
				.filter(obj => obj["description"].toLowerCase().includes("ncov"))
				.map(obj => {
					let url = obj["sourceUrl"];
					let header = obj["description"];
					let date = Date.parse(obj["dateContentUpdated"]);
					return [date, `<a href="${url}" target="_blank">${header}</a><br/>`];
				})
				.sort((p1, p2) => p1[0] - p2[0])
				.map(p => `${timeConverter(p[0])} - ${p[1]}`);
			console.log(ncovData);
			$("#content-cdc").html(ncovData.join("<br/>"));
		}
	});

	// please don't abuse the api key...
	$.ajax("https://api.nytimes.com/svc/search/v2/articlesearch.json?q=ncov&api-key=YYIVck53KehBzDgNXkUSZBxNK8QMpjwu", {
		type: "GET",
		dataType: "json",
		success: (data) => {
			console.log(data);
			let ncovData = data["response"]["docs"].map(obj =>
				`<a href="${obj['web_url']}" target="_blank">${obj["abstract"]}</a><br/>`
			);
			$("#content-nyt").html(ncovData.join("<br/>"));
		}
	})
});
