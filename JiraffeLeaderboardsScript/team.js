var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db){
    if(err) throw err;
    var db_OneJira = db.db("jiraffe");
    db_OneJira.listCollections().toArray(function(err, collections){
        if(err) throw err;
        for(var i = 0; i < collections.length; i++){
            var colName = collections[i].name;
            db_OneJira.collection(collections[i].name, function(err, collection){
                if(err){
                    throw err;
                }else{
                    var colName2 = colName;
                    collection.aggregate([{
                        $sort:{
                            "Team.Date": -1
                        }
                    }, {
                        $limit: 1
                    }, {
                        $unwind: "$Team.UserList"
                    }, {
                        $project: {
                            _id: {
                                $concat: ["Prjct", {
                                    $toString: "$Team.TeamID"
                                }]
                            },
                            TeamName: {
                                $concat: ["$Team.TeamNameLong", "$Team.TeamNameShort"]
                            },
                            Score: "$Team.UserList.TotalPts"
                        }
                    }, {
                        $group: {
                            _id: {
                                TeamID: "$_id",
                                TeamName: "$TeamName"
                            },
                            Score: {
                                $sum: "$Score"
                            }
                        }
                    }, {
                        $project: {
                            _id: "$_id.TeamID",
                            TeamName: "$_id.TeamName",
                            Score: "$Score"
                        }
                    }]).toArray(function(err, result){
                        db.db("queries").collection("JiraffeTeamLeaderboard").insertMany(result, function(err, res){
                            if(err){
                                console.log("Cannot insert");
                                throw err;
                            }
                            console.log("Inserted");
                        });
                    });
                }
            });
        }
    });
});
