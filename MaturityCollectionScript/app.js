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
                                    story_points: {$ne: null}
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
                                    _id: {
                                        sprint_name: "$Data.sprint_name",
                                        start_date: "$Data.start_date",
                                    },
                                    Data: {
                                        $push: {
                                            story_points: "$Data.story_points",
                                            created_date: "$Data.created_date",
                                            assignee: "$Data.assignee", 
                                            issue_key: "$Data.issue_key"
                                        }
                                    }
                                }
                            }, {
                                $project: {
                                    _id: "$_id",
                                    Data: "$Data",
                                    total_story_points: { $sum: "$Data.story_points" }
                                }
                            }, {
                                $sort: {
                                    "_id.start_date": -1
                                }
                            }, {
                                $limit: 3
                            }])
                        .toArray(function(err, result){
                            var colName3 = colName2.split("Userstory")[0];
                            var db_Query = db.db("queries");                        
                            var immatureSP = 0;
                            var totSP = 0; 
                            for(var i = 0; i < result.length; i++){
                                var sprintStart = result[i]._id.start_date;
                                totSP += result[i].total_story_points;
                                for(var j = 0; j < result[i].Data.length; j++){
                                    if(sprintStart < result[i].Data[j].created_date){
                                        immatureSP += result[i].Data[j].story_points;
                                    }
                                }
                            }
                            var newVal = [{_id: colName3, maturity: (((totSP - immatureSP)/totSP)*100)}];
                            db_Query.collection("Maturity").insertMany(newVal, function(err, res){
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
