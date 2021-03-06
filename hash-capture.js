const fs = require('fs');
const execSync = require('child_process').execSync;

const async = require('async');
const webdriverio = require('webdriverio');

const options = require('./modules/options');
const target = require('./modules/target');

//=========================================================
// Arguments

// Check arguments
const argv = process.argv;
if (argv.length !== 6) {
	console.error(`Usage: node ${argv[1]} repositoryDir hashTsvFile waitToDeployMilliseconds waitToCaptureMilliseconds`);
	process.exit(1);
}

// Save arguments
const repositoryDir = argv[2];
const hashTsvFile = argv[3];
const waitToDeployMilliseconds = parseInt(argv[4], 10);
const waitToCaptureMilliseconds = parseInt(argv[5], 10);

// Check dir
if (!fs.statSync(repositoryDir).isDirectory()) {
	console.error(`${repositoryDir} is not directory`);
	process.exit(1);
}
if (!fs.statSync(repositoryDir + '/.git').isDirectory()) {
	console.error(`No .git directory in ${repositoryDir}`);
	process.exit(1);
}

//=========================================================
const hashTsv = fs.readFileSync(hashTsvFile).toString();
const series = [];

// Build series
hashTsv.split('\n').forEach((line) => {
	// Skip empty line
	if (line === '') {
		return;
	}
	
	// Get log information
	const list = line.split('\t');
	const date = list[0];
	const hash = list[1];
	const name = list[2];
	const comment = list[3];
	
	// Checkout
	series.push((callback) => {
		// Checkout
		console.log('git checkout ' + hash);
		execSync(`git checkout ${hash}`, {
			cwd: repositoryDir
		});
		
		// Wait to deploy
		setTimeout(callback, waitToDeployMilliseconds);
	});
	
	// Capture
	let i = 0;
	for (const url of target.urls) {
		series.push(((i, length, url, date, hash) => {
			return (callback) => {
				webdriverio
					.remote(options)
					.init()
					.setViewportSize({
						// iPhone 6 size
						width: 375,
						height: 667
					})
					.url(url)
					.pause(waitToCaptureMilliseconds)
					.saveScreenshot(`capture/${i}-${date}-${hash}.png`)
					.end();
				
				if (i < length - 1) {
					// Wait to go next
					setTimeout(callback, 5000);
				} else {
					// Final
					setTimeout(callback, waitToCaptureMilliseconds);
				}
			};
		})(i, target.urls.length, url, date, hash));
		
		i++;
	}
});

// Run series
async.series(series, (error, results) => {
	if (error) {
		throw error;
	}
});
