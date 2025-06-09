# Makefile pour gestion du projet React avec Docker

# Adapter les chemins Dockerfile
up:
	docker build -f .docker/Dockerfile -t psig-react .
	- docker stop psig
	docker run --rm -d -p 5173:80 --name psig psig-react

down:
	- docker stop psig

build: down clean
	docker build -f .docker/Dockerfile -t psig-react .
	docker create --name psig-tmp psig-react
	docker cp psig-tmp:/usr/share/nginx/html ./dist
	docker rm psig-tmp
	make apk

clean:
	- docker rmi psig-react
	@if exist dist rmdir /s /q dist

apk:
	docker build -f .docker/Dockerfile.apk -t psig-apk .
	docker create --name psig-apk-tmp psig-apk
	- docker cp psig-apk-tmp:/app/output/. ./output
	docker rm psig-apk-tmp
	@echo "APK(s) genere(s) : output/"
