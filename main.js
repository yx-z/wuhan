const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	'Oct', 'Nov', 'Dec'];

function toDate(timestamp) {
	let d = new Date(timestamp);
	let year = d.getFullYear();
	let month = MONTHS[d.getMonth()];
	let date = d.getDate();
	return `${month} ${date}, ${year}`;
}

$(document).ready(() => {
	// articles
	$.when(
		$.ajax("https://tools.cdc.gov/api/v2/resources/media", {
			type: "GET", dataType: "jsonp"
		}),
		$.ajax("https://api.nytimes.com/svc/search/v2/articlesearch.json?q=ncov&api-key=YYIVck53KehBzDgNXkUSZBxNK8QMpjwu", {
			type: "GET", dataType: "json"
		})
	).done((cdcData, nytData) => {
		let cdcNcovData = cdcData[0]["results"]
			.filter(obj => obj["description"].toLowerCase().includes("ncov"))
			.map(obj => {
				let url = obj["sourceUrl"];
				let header = obj["description"];
				let date = Date.parse(obj["dateContentUpdated"]);
				return [date, `<a href="${url}" target="_blank">${header}</a><br/>`, "CDC"];
			});
		console.log(nytData);
		let nytNcovData = nytData[0]["response"]["docs"]
			.map(obj => {
				let url = obj["web_url"];
				let header = obj["abstract"];
				let date = Date.parse(obj["pub_date"]);
				return [date, `<a href="${url}" target="_blank">${header}</a><br/>`, "NYTimes"];
			});
		let concated = cdcNcovData.concat(nytNcovData).sort((p1, p2) => p2[0] - p1[0])
			.map(p => `${p[2]}, ${toDate(p[0])} - ${p[1]}`);
		$("#articles").html(concated);
	});
});
