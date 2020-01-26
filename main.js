$(document).ready(() => {
	$.ajax("https://tools.cdc.gov/api/v2/resources/media", {
		type: "GET",
		dataType: "jsonp",
		success: (data) => {
			ncovData = data["results"]
				.filter(obj => obj["description"].toLowerCase().includes("ncov"))
				.map(obj => `<a href="${obj['sourceUrl']}">${obj["description"]}</a><br/>`);
			$("#content-cdc").html(ncovData.join("<br/>"));
		}
	});

	$.ajax("https://api.nytimes.com/svc/search/v2/articlesearch.json?q=ncov&api-key=YYIVck53KehBzDgNXkUSZBxNK8QMpjwu", {
		type: "GET",
		dataType: "json",
		success: (data) => {
			ncovData = data["response"]["docs"].map(obj =>
				`<a href="${obj['web_url']}">${obj["abstract"]}</a><br/>`
			);
			$("#content-nyt").html(ncovData.join("<br/>"));
		}
	})
});
