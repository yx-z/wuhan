const parseDate = (date) => {
	const parsed = Date.parse(date);
	if (!isNaN(parsed)) {
		return parsed;
	}
	return Date.parse(date.replace(/-/g, '/').replace(/[a-z]+/gi, ' '));
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
	"Oct", "Nov", "Dec"];

const toDate = (timestamp) => {
	let d = new Date(timestamp);
	let month = MONTHS[d.getMonth()];
	let date = d.getDate();
	return `${month} ${date}`;
};

const corsReq = (target, onSuccess) => {
	let req = new XMLHttpRequest();
	req.open(target.method, "https://cors-anywhere.herokuapp.com/" + target.url);
	req.onload = req.onerror = function () {
		onSuccess(
			target.method + " " + target.url + "\n" +
			req.status + " " + req.statusText + "\n\n" +
			(req.responseText || "")
		);
	};
	if (/^POST/i.test(target.method)) {
		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
		let situation = $(html).find(".field.field--name-field-pt-text.field--type-text-long.field--label-hidden.field--item")[0];
		$(situation).find("h4").remove();
		$(situation).find("h2").next().remove();
		$(situation).find("h2").remove();
		$(situation).children().last().remove();
		$("#situation").html(situation.outerHTML);
	});

	// articles
	// pls. don't abuse api key
	$.when(
		$.ajax("https://tools.cdc.gov/api/v2/resources/media", {
			type: "GET", dataType: "jsonp"
		}),
		$.ajax("https://api.nytimes.com/svc/search/v2/articlesearch.json?q=ncov&api-key=YYIVck53KehBzDgNXkUSZBxNK8QMpjwu", {
			type: "GET", dataType: "json"
		}),
		$.ajax("https://api.currentsapi.services/v1/search?keywords=wuhan&apiKey=GhPrUSYJJPmo02-gPUw261xM_fLv0GggSg_73fVivLqLz9C4", {
			type: "GET", dataType: "json"
		}),
		$.ajax("https://content.guardianapis.com/search?q=ncov&api-key=8dfc8a33-15f9-478d-93c1-69ba74f096d1", {
			type: "GET", dataType: "json"
		})
	).done((cdcData, nytData, currentsData, theGuardianData) => {
		let cdcNcovData = cdcData[0]["results"]
			.filter(obj => obj["description"].toLowerCase().includes("ncov"))
			.map(obj => {
				let date = parseDate(obj["dateContentUpdated"]);
				let url = obj["sourceUrl"];
				let header = obj["description"];
				return [date, "CDC", url, header, "", ""];
			});
		let nytNcovData = nytData[0]["response"]["docs"]
			.map(obj => {
				let date = parseDate(obj["pub_date"]);
				console.log(date);
				let url = obj["web_url"];
				let header = obj["headline"]["main"];
				let abstract = obj["abstract"];
				return [date, "NYTimes", url, header, abstract];
			});
		let currentsNcovData = {};
		currentsData[0]["news"].forEach(obj => {
			let date = parseDate(obj["published"]);
			let url = obj["url"];
			let header = obj["title"];
			let abstract = obj["description"];
			currentsNcovData[header] = [date, "Latest", url, header, abstract];
		});
		let theGuardianNcovData = theGuardianData[0]["response"]["results"]
			.map(obj => {
				let date = parseDate(obj["webPublicationDate"]);
				let url = obj["webUrl"];
				let header = obj["webTitle"];
				return [date, "The Guardian", url, header, ""];
			});
		let concated = cdcNcovData
			.concat(nytNcovData)
			.concat(Object.values(currentsNcovData).slice(0, 5))
			.concat(theGuardianNcovData)
			.sort((p1, p2) => p2[0] - p1[0])
			.map(p => `<div class="news">${p[1]} - ${toDate(p[0])}, <a href="${p[2]}" target="_blank">${p[3]}</a><div style="font-size: 1.1rem;">${p[4]}</div></div>`);
		$("#articles").html(concated);
	});
});
