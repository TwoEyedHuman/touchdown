.PHONY: dev build preview test lint check install clean

dev:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

test:
	npm run test

lint:
	npm run lint

check: lint test

install:
	npm install

clean:
	rm -rf dist
