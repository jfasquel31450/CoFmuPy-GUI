DATA-LINEAGE-GUI
=======

# 1. Development
-----------

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.0.



## 1.1 Install tools, frameworks and Third parties
* ### Install node and npm (installer) :
[Download and install](https://nodejs.org/fr) Node (minimum 22.13.1) combine with npm (minimum 10.9.2)

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
For that, follow instructions from [_CoFmuPy_](https://github.com/IRT-Saint-Exupery/CoFmuPy) repository and start backend application 

## 1.2 Manage frontend Web application
Application is now usable and editable,  composed of 2 sub-directories : 
* cofmupy-gui-app, for the application itself
* node-server, for the server that launch application as a standalone application, only for final user.


```bash
# Go to application directory
cd ./cofmupy-gui-app

# Only after repository clone or pull, run following command to update local repository with dependencies :
npm install

# Start application with dev mode
ng serve
```

Once the server is running, open your browser and navigate to [http://localhost:3145/](http://localhost:4300/). The application will automatically reload whenever you modify any of the source files.

## 1.3 Code scaffolding

Angular CLI includes powerful code scaffolding tools. See [online help](https://angular.dev/cli/generate) for more informations

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

Execute following steps to package code as a standalone application.

## 2.1 Build Application
* Open a terminal at root directory

```bash
# Navigate to application directory
cd ./data-manager-gui-app

# Update libraries
npm install

# Run build command
ng build
```

This will compile your project and store the build artifacts in the `/cofmupy-gui-app/dist` directory. By default, the production build optimizes your application for performance and speed.

## 2.2 Build node server

```bash
# Navigate to node server directory
cd ../node-server

# Update libraries
npm install

# Run build command
parcel build app.js

```

This will compile node server in the `/node-server/dist` directory, entirely package into app.js file

## 2.3 Package
Concatene files contained into `/cofmupy-gui-app/dist/browser` with `./node-server/dist/app.js` file into a new package directory and archive it for distribution (zip). This distribution should be composed of following files :
* Application :
  * **assets** directory : resources directory
  * **app.js** : node server entry point
  * **index.html** : User interface entry point
  * **main-*.js** : Application main scripts and views
  * **polyfills-*.js** : Application complement scripts and views
  * **style-*.css** : Application styles
* Starter scripts :
  * **Start_CoFmuPy_Gui.bat** : Script file to start application (Windows)
  * **Start_CoFmuPy_Gui.sh** : Script file to start application (Linux)

_Note : This procedure should be executed by github CI/CD.

# 3. Execution (end-user)

User instruction to start standalone Web Application.

1. Pre-requisite :
   * Node installed, minimum version 18.19
   * CoFmuPy server installed and started
   * Archive file of the application (See previous chapter)
2. Launch application with script file :
   * For Linux user : Launch application with `Start_CoFmuPy_Gui.sh`
   * For Windows user : Launch application with `Start_CoFmuPy_Gui.bat`
4. Answer the question on expected port for the Web Application. Choose a usable free port for your material.
5. Execute `s` command to start Application
6. Execute `-` command to stop application

**Web App example with data**
![Exemple de capture](ScreenShot_App.png "Title")

