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
                        $unwind: "$Team.UserList"
                    }, {
                        $project: {
                            _id: "$Team.UserList.UserADEntity.NameLastFirst",
                            AD_username: "$Team.UserList.UserADEntity.ActiveDirectoryUserName",
                            email: "$Team.UserList.UserADEntity.EmailAddress",
                            contact: "$Team.UserList.UserADEntity.TelephoneNumber",
                            department: {$concat: ["$Team.UserList.UserADEntity.DepartmentName", " - ", "$Team.UserList.UserADEntity.DepartmentNumber"]},
                            company: "$Team.UserList.UserADEntity.CompanyName",
                            location: {$concat: ["$Team.UserList.UserADEntity.City", ", ", "$Team.UserList.UserADEntity.State"]},
                            user_id: "$Team.UserList.UserID",
                            level: "$Team.UserList.Level",
                            admin_pts: "$Team.UserList.AdminPts",
                            user_pts: "$Team.UserList.UserPts",
                            tester_pts: "$Team.UserList.TesterPts",
                            developer_pts: "$Team.UserList.DeveloperPts",
                            total_pts: "$Team.UserList.TotalPts",
                            date: "$Team.Date"
                        }
                    }, {
                        $sort: {"date": -1}
                    }, {
                        $group: { 
                            _id: "$_id",
                            info: {
                                $push: {
                                    AD_username: "$AD_username",
                                    email: "$email",
                                    contact: "$contact",
                                    department: "$department",
                                    company: "$company",
                                    location: "$location",
                                    user_id: "$user_id",
                                    level: "$level",
                                    admin_pts: "$admin_pts",
                                    user_pts: "$user_pts",
                                    tester_pts: "$tester_pts",
                                    developer_pts: "$developer_pts",
                                    total_pts: "$total_pts",
                                    date: "$date"
                                }
                            }
                        }
                    }, {
                        $project: {
                            _id: "$_id",
                            info: {$arrayElemAt: ["$info",0]}
                        }
                    }, {
                        $project: {
                            _id: "$_id",
                            AD_username: "$info.AD_username",
                            email: "$info.email",
                            contact: "$info.contact",
                            department: "$info.department",
                            company: "$info.company",
                            location: "$info.location",
                            user_id: "$info.user_id",
                            level: "$info.level",
                            admin_pts: "$info.admin_pts",
                            user_pts: "$info.user_pts",
                            tester_pts: "$info.tester_pts",
                            developer_pts: "$info.developer_pts",
                            total_pts: "$info.total_pts"
                        }
                    }]).toArray(function(err, result){
                        var newEntry = [{
                            _id: colName2,
                            info: result
                        }];
                        db.db("queries").collection("JiraffePersonalData").insertMany(newEntry, function(err, res){
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
