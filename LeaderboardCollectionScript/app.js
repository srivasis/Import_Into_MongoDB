var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db){
    if(err) throw err;
    var db_OneJira = db.db("onejira");
    db_OneJira.listCollections().toArray(function(err, collections){
        if(err) throw err;
        for(var i = 0; i < collections.length; i++){
            if(collections[i].name.includes("Userstory")){
                var colName = collections[i].name;
                db_OneJira.collection(collections[i].name, function(err, collection){
                    if(err){
                        throw err;
                    }else{
                        var colName2 = colName;
                        collection.aggregate([{
                            $unwind: "$issues"
                        },
                        {
                            $unwind: "$issues.fields.customfield_10004"
                        },{
                            $project: {
                                _id: "$issues.id",
                                team_name: {$arrayElemAt: [{$split: ["$issues.key", "-"]}, 0]},
                                story_points: "$issues.fields.customfield_10006",
                                sprint_name: {$arrayElemAt: [{$split: [{$arrayElemAt: [{$split: ["$issues.fields.customfield_10004", ","]}, 3]}, "="]}, 1]},
                                start_date: {$arrayElemAt: [{$split: [{$arrayElemAt: [{$split: ["$issues.fields.customfield_10004", ","]}, 4]}, "="]}, 1]},
                                status: "$issues.fields.status.statusCategory.name"
                            }
                        }, {
                            $match: {
                                story_points: {
                                    $ne: null
                                }
                            }
                        }, {
                            $match: {
                                sprint_name: {
                                    $ne: null
                                }
                            }
                        }, {
                            $match: {
                                start_date: {
                                    $ne: "<null>"
                                }
                            }
                        }, {
                            $group: {
                                _id: {
                                    IssueID: "$_id", 
                                    Status: "$status",
                                    TeamName: "$team_name"
                                },
                                Issue: {
                                    $push: {
                                        story_points: "$story_points",
                                        sprint_name: "$sprint_name",
                                        start_date: "$start_date"
                                    }
                                }
                            }
                        },{
                            $project: {
                                _id: "$_id.IssueID",
                                TeamName: "$_id.TeamName",
                                status: "$_id.Status",
                                Issue: {$arrayElemAt: ["$Issue",0]}
                            }
                        }, {
                            $group: {
                                _id: {
                                    IssueID: "$_id",
                                    TeamName: "$TeamName",
                                    SprintName: "$Issue.sprint_name", 
                                    StartDate: "$Issue.start_date"
                                },
                                Issue: {
                                    $push: {
                                        Status: "$status",
                                        story_points: "$Issue.story_points"
                                    }
                                }
                            }
                        }, {
                            $sort: {
                                "_id.StartDate": 1
                            }
                        }]).toArray(function(err, result){
                            if(err){
                                console.log(err);
                            }else{
                                var sprints = new Map();
                                var lastThreeSprintsCommitted = 0;
                                var lastThreeSprintsCompleted = 0;
                                var teamName = '';

                                for(var i = 0; i < result.length; i++){
                                    var sprintName = result[i]._id.SprintName;
                                    teamName = result[i]._id.TeamName;

                                    for(var j = 0; j < result[i].Issue.length; j++){
                                        var committedSum = result[i].Issue[j].story_points;
                                        var completedSum = 0;
                
                                        if(result[i].Issue[j].Status === "Done" || j + 1 === result[i].Issue.length){
                                            if(result[i].Issue[j].Status === "Done"){
                                                completedSum = committedSum;
                                            }
                                            var newValue = [committedSum, completedSum];
                                            if(sprints.has(sprintName)){
                                                var oldValue = sprints.get(sprintName);
                                                newValue = [committedSum + oldValue[0], completedSum + oldValue[1]];
                                                sprints.delete(sprintName);
                                            }
                                            sprints.set(sprintName, newValue);
                                            break;
                                        }
                                    }
                                }
                                var keys = sprints.keys();
                                var consistency = 0;

                                for(var k = 0; k < sprints.size; k++){
                                    var sprint = keys.next().value;
                                    var tmp_commit = sprints.get(sprint)[0];
                                    var tmp_complete = sprints.get(sprint)[1];

                                    if(k < sprints.size - 1 || sprints.size === 1){
                                        if(k > sprints.size - 5){
                                        
                                            lastThreeSprintsCommitted += tmp_commit;
                                            lastThreeSprintsCompleted += tmp_complete;
                                        }
                                    }
                                }
                                consistency = (lastThreeSprintsCompleted / lastThreeSprintsCommitted) * 100;
                                var newVal = [{_id: colName2.split("Userstory")[0], Consistency: consistency, TeamName: teamName}];
                                db.db("queries").collection("Leaderboard").insertMany(newVal, function(err, res){
                                    if(err){
                                        console.log("Cannot insert");
                                        throw err;
                                    }
                                    console.log("Inserted");
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});
