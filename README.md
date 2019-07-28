Set of commands to initiate the app

--- installation ---

	npm install (if installing for first time)
	npm install -g yo generator-generator (to install yeoman)
	npm link (may or may not be required, try if yeoman is not able to detect the commands)

--- usage ---

	* to create the entire app for the first time

		yo erp app

	* to create the individual component

		yo erp:ngc 'componentName' --component
		example - yo erp:ngc componentName --component
		erp sample - yo erp:ngc About --component