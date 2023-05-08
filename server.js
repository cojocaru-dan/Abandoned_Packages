const http = require('http');
const fs = require('fs');

const ip = "127.0.0.1";
const port = 9000;
const server = http.createServer((request, response) => {

	//request parameter contains the incoming (request) data from the client side to the server side as an object 
	// console.log(request);
	// console.log(request.method);
	// console.log(request.url);

	
	//response parameter contains the outgoing (response) data from the server side to the client side as an object 
	// console.log(response);
	
	
	//Write your code here
	//you can read the file with the help of the fs package's readFileSync method and parse the JSON with JSON.parse method
	const packagesFile = fs.readFileSync("./pkgs.json");

	const packagesData = JSON.parse(packagesFile);
	const latestNpmVersion = packagesData.packages[0].releases[0].version;
	

	if (request.method === "GET" && request.url === "/") {
		response.write("<h1>NPM Package Maintenance Portal</h1>");
		response.write(`<h2>${latestNpmVersion}</h2>`);
	} else if (request.method === "GET" && request.url === "/api/package") {
		response.write(JSON.stringify(packagesData.packages));
	} else if (request.method === "GET" && request.url === "/api/status/maintained") {
		response.write(JSON.stringify(getPackages(packagesData.packages, "maintained")));
	} else if (request.method === "GET" && request.url === "/api/status/abandoned")	{
		response.write(JSON.stringify(getPackages(packagesData.packages, "abandoned")));
	}	
	//Don't forget to close your response
	response.end();

});

server.listen(port, ip, () => {
	const addr = server.address();
	console.log(`http://${addr.address}:${addr.port}`);
});


function getPackages(packagesArray, state) {
	const packagesResult = [];

	for (const package of packagesArray) {
		if (package.dependencies.length === 0) continue;

		const packageDate = new Date(package.releases[0].date);

		const checkedDependencies = package.dependencies.map((dependencyId) => {
			const depPackage = packagesArray.find((p) => p.id === dependencyId);
			const depDate = new Date(depPackage.releases[0].date);
			return depDate.getTime() < packageDate.getTime();
		});

		const checkInclusion = (!checkedDependencies.includes(false) && state === "maintained")
								|| 
							   (!checkedDependencies.includes(true) && state === "abandoned");
		if (checkInclusion) {
			packagesResult.push(package);
		}
	}
	return packagesResult;
}