DATA-LINEAGE-GUI
=======

# 1. Development
-----------

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.4.



## 1.1 Install tools, frameworks and Third parties
* ### Install node and npm (installer) :
Download and install Node/npm (min version V2.11.0)

* ### Install angular tools (cli) :
Once npm installed, you can run following command line to install angular
```bash
npm install -g @angular/cli
```
* ### Install parcel tools (cli) :
Once npm installed, you can run following command line to install parcel
```bash
npm install -g parcel
```
* ### Install IDE for developement :
Download and install javascript/typescript IDE for developement. For example Visual Studio Code.

* ### Start backend application
Backend application is expected so that this frontend application can work.
For that, follow instructions into _data-lineage-backend_ repository and start backend application :
  * As a developper into java/J2EE IDE, and a started postgresql server for database
  * As a user with the generated and deployed container loaded into docker

## 1.2 Manage frontend Web app
Application is now usable and editable.

It is composed of 2 different parts or directories : 
* data-manager-gui-app, for the application itself
* node-server, for the server that launch application as a standalone application, only for final user.

Go to application directory
```bash
cd ./data-manager-gui-app
```

After repository clone or pull, run following command to update local libraries configured on project :

```bash
npm install
```

Start application with dev mode
```bash
ng serve
```

Once the server is running, open your browser and navigate to [http://localhost:4300/](http://localhost:4300/). The application will automatically reload whenever you modify any of the source files.

## 1.3 Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## 1.4 Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## 1.5 Running unit tests (Not manage yet)

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## 1.6 Running end-to-end tests (Not manage yet)

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## 1.7 Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# 2. Package Web app
-----------

Execute following steps to package the application and have a standalone application ready to execute for non/developer execution

## 2.1 Build Application
* Open a terminal at root directory

* Go to application directory
  ```bash
  cd ./data-manager-gui-app
  ```
* Update libraries
  ```bash
  npm install
  ```
* Run build command
  ```bash
  ng build
  ```
This will compile your project and store the build artifacts in the `/data-manager-gui-app/dist` directory. By default, the production build optimizes your application for performance and speed.

## 2.2 Build node server
* Go to node server directory
  ```bash
  cd ../node-server
  ```
* Update libraries
  ```bash
  npm install
  ```
* Run build command
  ```bash
  parcel build app.js
  ```
This will compile node server in the `/node-server/dist` directory, entirely package into app.js file

## 2.3 Package
Concatene files contained into `/data-manager-gui-app/dist/browser` with `./node-server/dist/app.js` file into a new package directory and archive it for distribution (zip). This distribution should be composed of following files :
* Application :
  * **examples-xdsm** directory : resources directory
  * **images** directory : resources directory
  * **XDSMjs-master** directory : resources directory
  * **app.js** : node server entry point
  * **index.html** : User interface entry point
  * **main-*.js** : Application main scripts and views
  * **polyfills-*.js** : Application complement scripts and views
  * **style-*.css** : Application styles
* For later containerization
  * **Dockerfile** : Docker script for containerization
  * **README.Docker.md** : Help file for containerization
* Starter scripts :
  * **Start_OpenLineage_Gui.bat** : Executable file to start application (Windows)
  * **Start_OpenLineage_Gui.sh** : Executable file to start application (Linux)

_Note : This procedure is executed by gitlab for each push on develop branch. Artifact zip file with all requested files is available directly in gitlab user interface_

# 3. Execution (user)

User manual to launch Web App for a user which is not a developer.

1. Pre-requisite :
   * Node installed, minimum version 18.19
   * Data-manager backend installed and started into docker
     * Data-Manager-Backend container
     * Database-Postgresql container
   * Archive file of the application (See previous chapter)
2. Launch application with script file :
   * For Linux user : Launch application with `browser/Start_OpenLineage_Gui.sh`
   * For Windows user : Launch application with `browser/Start_OpenLineage_Gui.bat`
3. Answer the question on Marquez port usage (Default is 5000). These port is indicated into docker, container Marquez.api
4. Answer the question on expected port for the Web Application. Choose a usable free port for your material.
5. Execute `s` command to start Application
6. Execute `-` command to stop application

**Web App example with data**
![Exemple de capture](ScreenShot_App.png "Title")



  * Install Docker 17.05+
  * Install Docker Compose