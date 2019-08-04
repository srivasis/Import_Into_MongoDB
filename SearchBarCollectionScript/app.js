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
                        collection.aggregate([
                            {
                                $unwind : "$issues"
                            },{
                                $group : {
                                      _id: "$issues.fields.assignee.displayName",
                                      email : { "$first": "$issues.fields.assignee.emailAddress"}
                                  }
                              },{
                                  $match : {
                                      _id : {
                                          $ne: null
                                      }
                                  }
                            }]).toArray(function(err, result){
                            if(err){
                                console.log(err);
                            }else{
                                var colName3 = colName2.split("Userstory")[0];
                                var db_Query = db.db("queries");
                                var res = result;
                                var newVal = [{_id: colName3, queryResult: res}];
                                db_Query.collection("TeamMemberList").insertMany(newVal, function(err, res){
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
