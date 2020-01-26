const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
	"Oct", "Nov", "Dec"];

const toDate = (timestamp) => {
	let d = new Date(timestamp);
	let year = d.getFullYear();
	let month = MONTHS[d.getMonth()];
	let date = d.getDate();
	return `${month} ${date}, ${year}`;
};

const toLink = (dict, urlKey, headerKey, dateKey, source) => {
	let url = dict[urlKey];
	let header = dict[headerKey];
	let date = Date.parse(dict[dateKey]);
	return [date, `<a href="${url}" target="_blank">${header}</a><br/>`, source];
};


const corsReq = (target, onSuccess) => {
	let req = new XMLHttpRequest();
	req.open(target.method, "https://cors-anywhere.herokuapp.com/" + target.url);
	req.onload = req.onerror = function () {
		onSuccess(
			target.method + ' ' + target.url + '\n' +
			req.status + ' ' + req.statusText + '\n\n' +
			(req.responseText || '')
		);
	};
	if (/^POST/i.test(target.method)) {
		req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	}
	req.send(target.data);
};

$(document).ready(() => {
	// situation
	corsReq({
		url: "https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases",
		method: "GET"
	}, (data) => {
		let html = $.parseHTML(data);
		let situation = $(html).find(".field .field--item")[0];
		$(situation).find("h4").remove();
		$(situation).find("h2").next().remove();
		$(situation).find("h2").remove();
		$("#situation").html(situation.outerHTML);
	});

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
			.map(obj => toLink(obj, "sourceUrl", "description", "dateContentUpdated", "CDC"));
		let nytNcovData = nytData[0]["response"]["docs"]
			.map(obj => toLink(obj, "web_url", "abstract", "pub_date", "NYTimes"));
		let concated = cdcNcovData.concat(nytNcovData)
			.sort((p1, p2) => p2[0] - p1[0])
			.map(p => `${p[2]}, ${toDate(p[0])} - ${p[1]}`);
		$("#articles").html(concated);
	});
});
