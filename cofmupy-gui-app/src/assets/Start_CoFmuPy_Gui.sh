#!/bin/sh

# node executable path
NodePath="../tools/node-v22.13.0-linux-x64"

#echo What is your expected backend port \(default port is 5000\) ?
#read BackendPort

echo What is your expected web app port \(default port is 4400\) ?
read WebAppPort

if [ "$BackendPort" = "" ]; then
	BackendPort="5000"
	echo Marquez has $BackendPort port
fi

if [ "$WebAppPort" = "" ]; then
	WebAppPort="4400"
	echo web app has $WebAppPort port
fi


while [ "$choice" != "!" ]
do
	choice=
	echo
	echo ============================================ General commands
	echo -: stop all
	echo !: quit
	echo /: clean screen
	echo s: start application

	echo What do you want to do :
	read choice
	echo
	
	
	if [ "$choice" = "/" ]; then
		clear
	fi
	
	if [ "$choice" = "-" ]; then
		echo i will stop all node programs runned by you
		taskkill -F -IM "node.exe"
	fi
	
	if [ "$choice" = "s" ]; then
		node app.js $WebAppPort $BackendPort
		echo Running Front End EasyMOD Application, available on http://localhost:$WebAppPort
		xdg-open http://localhost:$WebAppPort
	fi
	
	
done
