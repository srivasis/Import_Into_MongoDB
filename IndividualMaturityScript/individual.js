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
                        }, {
                            $unwind: "$issues.fields.customfield_10004"
                        }, {
                            $project: {
                                sprint_name: {$arrayElemAt: [{$split: [{$arrayElemAt: [{$split: ["$issues.fields.customfield_10004", ","]}, 3]}, "="]}, 1]},
                                created_date:{$arrayElemAt: [{$split: ["$issues.fields.created", "T"]}, 0]},
                                start_date: { $arrayElemAt: [{$split: [{$arrayElemAt: [{$split: [{$arrayElemAt: [{$split: ["$issues.fields.customfield_10004", ","]}, 4]}, "="]}, 1]}, "T"]}, 0]},
                                issue_id: "$issues.id",
                                story_points: "$issues.fields.customfield_10006",
                                issue_key: "$issues.key", 
                                assignee: "$issues.fields.assignee.displayName"
                            }
                        }, {
                            $match: {
                                sprint_name: {$ne:null, $exists: true},
                                created_date: {$ne:null, $exists: true},
                                start_date: {$ne:null, $exists: true},
                                story_points: {$ne: null},
                            }
                        }, {
                            $group: {
                                _id: "$issue_id",
                                Data: {
                                    $push: {
                                        created_date: "$created_date",
                                        story_points: "$story_points",
                                        start_date: "$start_date",
                                        sprint_name: "$sprint_name", 
                                        issue_key: "$issue_key", 
                                        assignee: "$assignee"
                                    }
                                }
                            }
                        }, {
                            $project: {
                                _id: "$_id",
                                Data: {
                                    $arrayElemAt: ["$Data",0]
                                }
                            }
                        }, {
                            $group: {
                                _id: "$Data.assignee",
                                ticket_info: {
                                    $push: {
                                        ticket_id: "$Data.issue_key",
                                        ticket_creation_date: "$Data.created_date",
                                        ticket_story_points: "$Data.story_points",
                                        sprint: "$Data.sprint_name",
                                        sprint_start_date: "$Data.start_date", 
                                    }
                                }
                            }
                        }, {
                            $match: {_id :{$ne: null}}
                        }]).toArray(function(err, result){
                            var res = [{_id: colName2, info: result}];
                            db.db("queries").collection("IndividualMaturity").insertMany(res, function(err, res){
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
        }
    });
});
