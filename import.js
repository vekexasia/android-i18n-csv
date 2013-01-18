var fs		= require('fs');
var argv 	= require('optimist').argv;
var eyes	= require('eyes');
var xml2js	= require('xml2js');
var csv		= require('csv');
var builder = require('xmlbuilder');
var path	= require('path');

if (typeof(argv.csv) == 'undefined' || typeof(argv.deflang) == 'undefined'  || typeof(argv.folderout) == 'undefined') {
	printUsage();
} else {
	var config = {
			'csvFile': 	argv.csv,
			'deflang':	argv.origlang,
			'outDir':	argv.folderout
	};

	fs.stat(config.csvFile, function (err, stats) {
		if (err) {
			console.log("File not found or not readable");
		} else {
			fs.readFile(config.csvFile, function(err, data) {
				if (err) {
					console.log("File not readable");

				} else {
					var converted = [];
					csv()
					.from(data, {'columns': true})
					.on('data',function(data,index) {
						converted.push(data);
					})
					.on('end', function() {
						saveTranslations(converted);
					});



				}
			});
		}
	} );


}
function parseContentForAndroidCompliancy(str) {
	return str.replace(/'/g,'\\\'').replace(/\\\\'/g, '\\\'');
}
function saveTranslations(translationData) {
	var columns		= Object.keys(translationData[0]);
	var nLanguages	= columns.length-2;
	for (var i=0; i<nLanguages; i++) {
		var languageIdx	= i+2;
		var languageKey = columns[languageIdx];
		var doc = "<resources>\n";
		var stringArrays = {};
		for (var row=0; row<translationData.length; row++) {
			var item = translationData[row];
			if (item.type == 'string-array') {
				if ( typeof(stringArrays[item.Key]) == 'undefined') {
					stringArrays[item.Key] = [];
				}
				stringArrays[item.Key].push(parseContentForAndroidCompliancy(item[languageKey]));
			} else {
				if (typeof(item[languageKey]) == 'undefined' || item[languageKey] == null ) {
					console.log("Skipped "+item.Key+" Language: "+languageKey);
				} else {
					var extraAttributes = '';
					if (parseContentForAndroidCompliancy(item[languageKey]).indexOf('%s') != -1) {
						extraAttributes = ' formatted="false" ';
					}

					doc+="\t<string name=\""+item.Key+"\""+extraAttributes+">"+parseContentForAndroidCompliancy(item[languageKey])+"</string>\n";
				}
			}
		}

		// Adding stringarrays
		for (key in stringArrays) {
			doc +="\t<string-array name=\""+key+"\">\n";
			for (item in stringArrays[key]) {
				doc +="\t\t<item>"+stringArrays[key][item]+"</item>\n";
			}
			doc +="\t</string-array>\n";
		}

		doc+='</resources>';
		writeXml(languageKey, doc);

	}

}

function writeXml(langKey, xmlDoc) {
	try {
		fs.mkdirSync(path.join(config.outDir, 'values-'+langKey));
	} catch (e) {}
	try {
		fs.writeFileSync(path.join(config.outDir, 'values-'+langKey, 'strings.xml'), xmlDoc,'utf8');
	} catch (e) {
		console.log("E. writing");
	}

}

function printUsage() {
	console.log("Usage:");
	console.log("");
	console.log("node ./export.js --csv path/to/strings.csv --deflang en --folderout path/to/folder");

}