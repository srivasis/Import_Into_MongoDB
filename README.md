READ ME:

This project imports the UNC filepath JSON contents specifically for a preconfigured filepath structure, into MongoDB.
The easiest way to run this project is to open it inside an IDE and provide the following set of arguments.

Arg1: UNC Filepath 
		Example: \\TLPFILER\sharpregr\GAMIFI-SHARE\DAT\V01\ONEJIRA
Arg2: Path to the start date text (this file indicates starting at which day do you want to start reading in the data from, 
		it will also right back to that file what the last read in date was for future use. If you are running this for the first time just leave the 
		date file empty)
		Example: fileC:\MongoImport\gamification\MongoDBSetup\src\ReadFiles.txt
Arg3: IP address of the machine hosting the MongoDB
		Example: localhost or 10.128.....
Arg4: Port Number for MongoDB
		Example: 27017
Arg5: Database to which you want to add the collections inside mongodb. Before you run the program you need to create a Database in MongoDB into which 
		this data needs to be added into. Make sure a user is created for that Database.
		Example: onejira (name of the database)
