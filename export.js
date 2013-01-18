var fs		= require('fs');
var argv 	= require('optimist').argv;
var eyes	= require('eyes');
var xml2js	= require('xml2js');
var parser	= new xml2js.Parser();

if (typeof(argv.xml) == 'undefined' || typeof(argv.origlang) == 'undefined' || typeof(argv.wantedlangs) == 'undefined' ) {
	printUsage();
	//eyes.inspect(argv);
} else {
	//eyes.inspect(argv);
	var config = {
			'xmlFile': 		argv.xml,
			'origLangSlug':	argv.origlang,
			'wantedLangs':	argv.wantedlangs.split(',')	
	};
	//eyes.inspect(config);
	fs.stat(config.xmlFile, function (err, stats) {
		if (err) {
			console.log("File not found or not readable");
		} else {
			fs.readFile(config.xmlFile, function(err, data) {
				if (err) {
					console.log("File not readable");

				} else {
					parser.parseString(data);
				}
			});
		}
	} );
	
	
}


parser.on('end', function(result) {
	var tmpArrayForCsv = [];
	// Headline
	var headLine = ['Type', 'Key', config.origLangSlug];
	for (k in config.wantedLangs) {
		headLine.push(config.wantedLangs[k]);
	}
	tmpArrayForCsv.push(headLine);
	for (k in result) {
		if (k == 'string') {
			for (entry in result[k]) {
				if (result[k][entry]['#'].substr(0,8) == '@string/') {
					//console.log('skipped'+result[k][entry]['@'].name);
				} else {
					//eyes.inspect(result[k][entry]);
					var toAdd = [k, result[k][entry]['@'].name, result[k][entry]['#']];
					for (wl in config.wantedLangs) {
						toAdd.push('');
					}
					
					tmpArrayForCsv.push(toAdd);
				}
			}
		} else if (k=='string-array') {
			for (item in result[k].item) {
				var toAdd = [k, result[k]['@'].name, result[k].item[item]];
				for (wl in config.wantedLangs) {
					toAdd.push('');
				}
				tmpArrayForCsv.push(toAdd);
			}
		} else {
			eyes.inspect(k);
			eyes.inspect(result[k]);
		}
	}
	
	//eyes.inspect(tmpArrayForCsv);
	
	writeToCsv(tmpArrayForCsv);
	
});


function writeToCsv(csvArr) {
	var stringForFile = "";
	for (row in csvArr) {
		var rowStr = '';
		for (entry in csvArr[row]) {
			var str = csvArr[row][entry];
			str = str.replace(/\\'/g,'\'');
			if (str.indexOf('"') != -1) {
				str = str.replace(/"/g,'\\"\\"');
				str = '"'+str+'"';
			} else if (str.indexOf(',') != -1) {
				str = '"'+str+'"';
			}
			rowStr+=","+str;
		}
		rowStr= rowStr.substring(1);
		stringForFile +=rowStr+"\n";
	}
	console.log(stringForFile);
}

function printUsage() {
	console.log("Usage:");
	console.log("");
	console.log("node ./export.js --xml path/to/strings.xml --origlang en --wantedlangs it,de,fr,nl");

}