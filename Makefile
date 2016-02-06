export PATH := node_modules/.bin:$(PATH)

all: build

build: public/build.js public/build.css copy_images

.env:
	cp default.env $@

copy_images:
	mkdir -p public/images
	cp -f src/images/* public/images 2>/dev/null || :

build_css: clean_css public/build.css

build_debug_css: clean_css
	"node-sass" src/scss/index.scss public/build.css --source-map public/build.css.map

build_debug_js: clean_js
	browserify src/js/browser/index.js -d -t [ babelify --presets [ es2015 react ] ] > public/build.js

clean: clean_css clean_js

clean_css:
	rm -f public/build.css
	rm -f public/build.css.map

clean_js:
	rm -f public/build.js
	rm -f public/build.browserify.js

public/build.css:
	mkdir -p public
	"node-sass" src/scss/index.scss $@ --output-style compressed

public/build.browserify.js:
	mkdir -p public
	browserify src/js/browser/index.js -t [ babelify --presets [ es2015 react ] ] > $@

public/build.js: public/build.browserify.js
	mkdir -p public
	uglifyjs $< -m -c > $@