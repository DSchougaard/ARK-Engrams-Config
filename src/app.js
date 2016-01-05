const request 		= require('request');
const url 			= "http://ark.gamepedia.com/Crafting";
const _ 			= require('lodash');
const regression 	= require('regression');

request(url, function(error, response, body){
	const thresholds 	= [2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
	const maxLevel 		= 94;

	/*const levelToIndicies = [
		'3': 0,
		'5': 1,
		'10': 2,
		'15': 3,
		'20': 4,
		'25': 5,
		'30': 6,
		'35': 7,
		'40': 8,
		'45': 9,
		'50': 10,
		'55': 11, 
		'60': 12,
		'65': 13,
		'70': 14,
		'75': 15,
		'80': 16,
		'85': 17,
		'94': 18
	]*/

	var contents = JSON.stringify(response);
	// Pattern for matching HTML tables, containing name, EPs and required levels.
	var pattern = /([a-z ]+)<\/a><\/td>\\n<td>[ ]*([0-9]+)[ ]*<\/td>\\n<td>[ ]*([0-9]+)[ ]*<\/td>/gi;
	var matches = contents.match(pattern);

	var scannedItems = [];


	//var craftings = [ [], [], [], [], [], [], [], [],  [], [], [], [], [], [], [], [], [], [] face];
	var craftings = {};

	for(var crafting of matches){
		// For some reason we have to double match?! Im not sure why.
		var t = crafting.match(/([a-z ]+)<\/a><\/td>\\n<td>[ ]*([0-9]+)[ ]*<\/td>\\n<td>[ ]*([0-9]+)[ ]*<\/td>/i);
		/* Index List:
			1. Name
			2. Requirred Level
			3. Engram Cost
		*/
		var item = {
			name: t[1],
			level: t[2],
			EP:  t[3]
		}

		if( craftings[item.level] === undefined && craftings[item.level] !== null )
			craftings[item.level] = [];


		if( !_.find(craftings[item.level], item) ){
			craftings[item.level].push(item);
		}
	}

	// Debug Prints
	var str = JSON.stringify(craftings, null, 2); 
	//console.log(str);

	var points = [[0,0]];
	var totalEngrams = 0;
	for( var i in thresholds ){
		var sum = 0;
		for( var j in craftings[thresholds[i]]  ){
			//Debug Print
			//console.log("%d:%j", thresholds[i], craftings[thresholds[i]][j]);
			sum += parseInt(craftings[thresholds[i]][j].EP);
		}
		
		console.log("Sum of engrams unlocked at lvl %d is: %d.", thresholds[i], sum);

		totalEngrams += sum;
		points.push([thresholds[i], totalEngrams]);
	}

	console.log("Dataset: " + points);

	var result = regression('polynomial', points);
	var result_pretty = JSON.stringify(result, null, 2); 
	console.log(result_pretty);


	var points2 = [[0,0]];
	points2.push([maxLevel, totalEngrams]);

	result = regression('polynomial', points2);
	result_pretty = JSON.stringify(result, null, 2); 
	console.log(result_pretty);
});