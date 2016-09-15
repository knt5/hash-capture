# hash-capture
Screen capture by selected git hash

## Installation

```
curl -O http://selenium-release.storage.googleapis.com/2.53/selenium-server-standalone-2.53.1.jar
curl -O http://chromedriver.storage.googleapis.com/2.23/chromedriver_mac64.zip
unzip chromedriver_mac64.zip
npm i
```

## Usage

### Make dat/hash.tsv

```
cd path/to/your/repository
path/to/hash-capture/tools/git-log-to-tsv.sh > path/to/hash-capture/dat/hash.tsv
```

### Capture screenshots

```
# Start selenium standalone server
java -jar selenium-server-standalone-2.53.1.jar

# Run hash-capture
node hash-capture.js path/to/your/repository dat/hash.tsv 5000 5000
```
