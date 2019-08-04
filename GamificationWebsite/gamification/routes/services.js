var utils = require('./utils');
var mongodb = require('mongodb');
const ldap = require('ldapjs');

//Get Data for Generating Leaderboard on Homepage
function leaderboard(){
    var MongoClient = mongodb,MongoClient;
    var url = 'mongodb://localhost:27017/queries';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collection = db.collection("Maturity");
            collection.aggregate([{
                $lookup: {
                    from: "Leaderboard",
                    localField: "_id",
                    foreignField: "_id",
                    as: "Result"
                }
             }, {
                 $unwind: "$Result"
             }, {
                 $match: {
                     "Result.Consistency": {
                         $ne: null
                     }
                 }
             }, {
                 $match: {
                     maturity: {
                         $ne: null
                     }
                 }
             }, {
                 $project: {
                     _id: "$_id",
                     TeamName: "$Result.TeamName",
                     Consistency: "$Result.Consistency",
                     Maturity: "$maturity",
                     Score: {
                         $sum: [{
                             $multiply: ["$maturity", 0.3]
                         }, {
                             $multiply: ["$Result.Consistency", 0.7]
                         }]
                     }
                 }
             }, {
                 $sort: {
                     Score: -1
                 }
             }, {
                 $match: {
                     Consistency: {
                         $ne: NaN
                     }
                 }
             }, {
                 $match: {
                     Maturity: {
                         $ne: NaN
                     }
                 }
             }, {
                $lookup: {
                    from: "TeamInfo",
                    localField: "_id",
                    foreignField: "_id",
                    as: "Result"
                }
             }, {
                 $unwind: "$Result"
             }, {
                 $project: {
                     _id: "$_id",
                     TeamName: {$concat: ["$Result.TeamName", " (", "$TeamName", ")"]},
                     Consistency: "$Consistency",
                     Maturity: "$Maturity",
                     Score: "$Score"
                 }
             }]).toArray().then(function(result){
                var toJSON = [];
                for(var i = 0; i < result.length; i++){
                    var entry = {
                        rank: i+1,
                        team_id: result[i]._id,
                        name: result[i].TeamName,
                        consistency_metric: result[i].Consistency.toFixed(3),
                        maturity: result[i].Maturity.toFixed(3),
                        score: result[i].Score.toFixed(3)
                    };
                    toJSON.push(entry);
                }
                db.close();
                resolve(toJSON);
            });
        });
    });
}
module.exports.leaderboard = leaderboard;

//Searches the list of employees for the given request. Return list of all found
function searchBar(search){
    var MongoClient = mongodb,MongoClient;
    var url = 'mongodb://localhost:27017/queries';
    var teamMembers = [];

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            db.collection("SearchBar").find({}).toArray().then(function(result){
                for(var i = 0; i < result.length; i++){
                    for(var j = 0; j < result[i].queryResult.length; j++){
                        try{
                            if(result[i].queryResult[j]._id.includes(',')){
                                var splitString = result[i].queryResult[j]._id.split(',');
                                var lastName = splitString[0];
                                var splitString2 = splitString[1].split(' ');
                                var firstName = splitString2[1];
                            }
                            else{
                                var lastName = result[i].queryResult[j]._id.substring(1);
                                var firstName = result[i].queryResult[j]._id.substring(0, 1);
                            }
                        }catch(e){}
                        if (firstName.toLowerCase().includes(search) || lastName.toLowerCase().includes(search)) {
                            var username = lastName + ", " + firstName;
                            var collection = result[i]._id;
                            if (teamMembers.indexOf([username, collection]) === -1) {
                                teamMembers.push([username, collection]);
                            }
                        }
                    }
                }
                db.close();
                resolve(teamMembers);
            })
        })
    });
}
module.exports.searchBar = searchBar;

//displays the collections with the Project Name and the Team Name
function collectionsDisplay(){
    var MongoClient = mongodb,MongoClient;
    var url = 'mongodb://localhost:27017/onejira';
    var teamList = [];
    var totalCount = 0;

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
        db.listCollections().toArray().then(function(items){
            for(var i = 0; i < items.length; i++){
                if(!(items[i].name.includes('Userstory'))){
                    totalCount++;
                }
            }
            for (i = 0; i < items.length; i++) {
                var name = items[i].name;
                if (!name.includes('Userstory')) {
                    var collection = db.collection(name);
                    collection.aggregate()
                        .project({
                            key: "$key",
                            team: "$id"
                        })
                        .group({
                            _id: "$team",
                            key: {"$first": "$key"}
                        }).toArray().then(function(result){
                            for(var i = 0; i < result.length; i++){
                                var name = "Prjct" + result[i]._id;
                                teamList.push([name, result[i].key]);
                            }
                            if(teamList.length === totalCount){
                                teamList = utils.mergeSort2DOnFirst(teamList);
                                db.close();
                                resolve(teamList);
                            }                       
                    })
                }
            }
        })
    });
})
}
module.exports.collectionsDisplay = collectionsDisplay;


/* Returns a Promise that gets List of collections for a particular team in the database with the Teamname */
function getTeamData(req){
    var MongoClient = mongodb.MongoClient;
	var url = 'mongodb://localhost:27017/onejira';

	return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
		    var collectionName = req.url.split("?")[1];
            db.listCollections().toArray().then(function(items) {
            	if(items.length <= 0){
					console.log("No collections in database");
				}else{
					var teamList = [];
					var i;
					for(i = 0; i < items.length; i++){
						var str = items[i].name;
						if(str.includes(collectionName)){
							teamList.push(items[i]);
						}
                    }
                    var toReturn = [];
                    toReturn.push(collectionName);
                    toReturn.push(teamList);
                    db.close();
                    resolve(toReturn);
			    }
    		});
        })
    });
}
module.exports.getTeamData = getTeamData;

/* Returns promise that on success returns data (mongodb document field) within a collection */
function collectionData(req){
    var MongoClient = mongodb.MongoClient;
	var url = 'mongodb://localhost:27017/onejira';

	return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
			var title = req.url.split("?")[1].substring(5, 10);
			var collectionName = req.url.split("?")[1];
			var collection = db.collection(collectionName);
			collection.find({}).toArray().then(function(result){
				if(result.length){
                    var toReturn = [];
					toReturn.push(title);
                    toReturn.push(collectionName);
                    toReturn.push(result);
                    db.close();
                    resolve(toReturn);
				} else {
					res.send("No data for this team");
				}
			});
		});
	});
}
module.exports.collectionData = collectionData;

/* Returns a promise that on success returns list of team members and their email addresses */
function teamRoster(req){
    var MongoClient = mongodb.MongoClient;
	var url = 'mongodb://localhost:27017/onejira';

	return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
			var title = req.url.split("?")[1].substring(5, 10) + " Team Roster";
			var collectionName = req.url.split("?")[1] + 'Userstory'; 
			var collection = db.collection(collectionName);		

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
			}]).toArray().then(function(result){
                var toReturn = [];
                toReturn.push(result);
                toReturn.push(title);
                db.close();
				resolve(toReturn);
			});
		});
	});
}
module.exports.teamRoster = teamRoster;

/* Returns a promise that returns velocity data on success */
function getVelocity(req){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/onejira';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collectionName = req.url.split("?")[1] + "Userstory";
            var collection = db.collection(collectionName);
            var teamName = collectionName.substring(5, 10);
            collection.aggregate([{
                $unwind: "$issues"
                }, {
                    $unwind: "$issues.fields.customfield_10004"
                }, {
                    $project: {
                        _id: {
                            $arrayElemAt: [{
                                $split: ["$issues.fields.customfield_10004", ","]
                                }, 3]
                        },
                        start_date: {
                            $arrayElemAt: [{
                                $split: ["$issues.fields.customfield_10004", ","]
                                }, 4]
                        },
                        end_date: {
                            $arrayElemAt: [{
                                $split: ["$issues.fields.customfield_10004", ","]
                                }, 5]
                        },
                        story_points: "$issues.fields.customfield_10006",
                        status: "$issues.fields.status.statusCategory.name",
                        issue_id: "$issues.id",
                        team_name: {
                            $arrayElemAt: [{
                                $split: ["$issues.key", "-"]
                                }, 0]
                            
                        }
                    }
                }, {
                    $match: {
                        story_points: {
                            $ne: null
                        }
                    }
                }, {
                    $group: {
                        _id: {
                            ID: "$_id",
                            Status: "$status",
                            Issue_ID: "$issue_id",
                            Team_Name: "$team_name"
                        },
                        Data: {
                            $push: {
                                story_points: "$story_points",
                                start_date: "$start_date",
                                end_date: "$end_date"
                            }
                        }
                    }
                }, {
                    $project: {
                        _id: {
                            ID: "$_id.ID",
                            Status: "$_id.Status",
                            Team_Name: "$_id.Team_Name"
                            
                        },
                        Issue_ID: "$_id.Issue_ID",
                        Data: {
                            $arrayElemAt: ["$Data", 0]
                        }
                    }
                }, {
                    $group: {
                        _id: "$_id",
                        Issues: {
                            $push: {
                                IssueData: "$Issue_ID"
                            }
                        },
                        Data: {
                            $push: {
                                IssueData: "$Data",
                                Team_Name: "$_id.Team_Name"
                            }
                        }
                    }
                }, {
                    $match: {
                        "_id.Status": {
                            $ne: "In Progress"
                        }
                    }
                }, {
                    $project: {
                        _id: "$_id",
                        start_date: {$arrayElemAt: [{$split: [{$arrayElemAt: ["$Data.IssueData.start_date",0]}, "="]}, 1]},
                        end_date: {$arrayElemAt: [{$split: [{$arrayElemAt: ["$Data.IssueData.end_date",0]}, "="]}, 1]},
                        velocity: {
                            $sum: "$Data.IssueData.story_points"
                        }
                    }
                }, {
                    $sort: {start_date: 1}
                }, {
                    $match: {start_date: {
                            $ne: "<null>"
                        }}
                }, {
                    $match: {end_date: {$ne: "<null>"}}
                }]).toArray().then(function(result){
                    var sprints = [];
                    var committedVelocities = [];
                    var completedVelocities = [];
                    var completeness = [];

                    var start_date = [];
                    var end_date = [];
                        
                    var avgCommitted = 0;
                    var avgCompleted = 0;
                    var avgLast3_Committed = 0;
                    var avgLast3_Completed = 0;
                    var len = 0;

                    var consistency = 0;

                    for(var i = 0; i < result.length; i++){
                           
                        var index = sprints.indexOf(result[i]._id.ID.split("=")[1]);
                        var startDate = result[i].start_date;
                        var endDate = result[i].end_date;

                        if(index >= 0){
                            if(result[i]._id.Status === "Done"){
                                completedVelocities[index] = result[i].velocity;

                            }else if(result[i]._id.Status === "To Do"){
                                committedVelocities[index] = result[i].velocity;
                            }

                            start_date[index] = startDate.split("T")[0];
                            end_date[index] = endDate.split("T")[0];   

                        }else{
                            sprints.push(result[i]._id.ID.split("=")[1]);
                                
                            if(result[i]._id.Status === "Done"){
                                committedVelocities.push(0);
                                completedVelocities.push(result[i].velocity);

                            }else if(result[i]._id.Status === "To Do"){
                                committedVelocities.push(result[i].velocity);
                                completedVelocities.push(0);
                            }
                            
                            start_date.push(startDate.split("T")[0]);
                            end_date.push(endDate.split("T")[0]);                                
                        }
                    }


                    for(var j = 0; j < sprints.length; j++){
                        var complete = 0;
                        if(committedVelocities[j] > 0){
                            if(sprints.length <= 3 || j >= sprints.length - 3){
                                avgLast3_Committed += committedVelocities[j];
                            }
                            avgCommitted += committedVelocities[j];
                        }
                        if(completedVelocities[j] > 0){
                            if(sprints.length <= 3 || j >= sprints.length - 3){
                                avgLast3_Completed = avgLast3_Completed + completedVelocities[j];
                            }
                            avgCompleted += completedVelocities[j];
                        }
                        if(committedVelocities[j] > 0 && completedVelocities[j] > 0){
                            complete = (completedVelocities[j]/committedVelocities[j]) * 100; 
                        }
                        completeness.push(complete.toFixed(3));
                    }

                    consistency = (avgCommitted >= avgCompleted) ? (avgCompleted / avgCommitted)*100 : 0;
                    avgCommitted = (avgCommitted / committedVelocities.length).toFixed(3);
                    avgCompleted = (avgCompleted / completedVelocities.length).toFixed(3);
                    len = (result.length > 3) ? 3 : result.length;
                    avgLast3_Committed = (avgLast3_Committed / len).toFixed(3);
                    avgLast3_Completed = (avgLast3_Completed / len).toFixed(3);
                    
                    var toReturn = [];
                    toReturn.push(result[0]._id.Team_Name + "-" + teamName);
                    toReturn.push(avgCommitted);
                    toReturn.push(avgCompleted);
                    toReturn.push(completeness);
                    toReturn.push(avgLast3_Committed);
                    toReturn.push(avgLast3_Completed);
                    toReturn.push(committedVelocities);
                    toReturn.push(completedVelocities);
                    toReturn.push(consistency.toFixed(3));
                    toReturn.push(sprints);
                    toReturn.push(start_date);
                    toReturn.push(end_date);
                    db.close();
                    resolve(toReturn);
            });
        });
    });
}
module.exports.getVelocity = getVelocity;

function getTeamMembers(){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/queries';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collection = db.collection("TeamMemberList");
            collection.aggregate(
                [{
                    $project: {
                        _id: "$_id",
                        TeamMemberList: "$queryResult._id"
                    }
                }]
            ).toArray().then(function(result){
                db.close();
                resolve(result);
            });
        });
    });
}
module.exports.getTeamMembers = getTeamMembers;

function getTeamSprintsData(req){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/onejira';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collectionName = req.url.split("?")[1] + "Userstory";
            var collection = db.collection(collectionName);
            var sprintName = req.url.split("?")[2].replace(/%20/g, " ");
            console.log(sprintName); 
            collection.aggregate([{
                $unwind: "$issues"
            }, {
                $project: {
                    _id: "$issues.fields.customfield_10004",
                    IssueKey: "$issues.key",
                    IssueID: "$issues.id",
                    IssueLink: {
                        $concat: ["https://tajira.us.aegon.com/browse/","$issues.key"]
                    },
                    IssueStatus: "$issues.fields.status.name",
                    Description: "$issues.fields.status.description",
                    Assignee: "$issues.fields.assignee.displayName"
                }
            }, {
                $match: {
                    _id: {
                        $ne: null
                    }
                }
            }, {
                $unwind: "$_id"
            }, {
                $project: {
                    _id: {
                        $arrayElemAt: [{
                            $split: [{
                                $arrayElemAt: [{
                                    $split: ["$_id", ","]
                                }, 3]
                            }, "="]
                        }, 1]
                    },
                    IssueKey: "$IssueKey",
                    IssueID: "$IssueID",
                    IssueLink: "$IssueLink",
                    IssueStatus: "$IssueStatus",
                    Description: "$Description",
                    Assignee: "$Assignee"
                }
            }, {
                $match: {
                    _id: {
                        $eq: sprintName
                    }
                }
            }, {
                $group: { 
                    _id: {Sprint: "$_id", IssueKey: "$IssueKey", IssueLink: "$IssueLink", IssueID: "$IssueID", Assignee: "$Assignee", IssueStatus: "$IssueStatus",
                            Description: "$Description"},

                }
            }, {
                $group: { 
                    _id: {
                        Sprint: "$_id.Sprint",
                        IssueKey: "$_id.IssueKey",
                        IssueID: "$_id.IssueID",
                        IssueLink: "$_id.IssueLink"
                    },
                    Tickets: {
                        $push: {
                            Assignee: "$_id.Assignee", 
                            IssueStatus: "$_id.IssueStatus",
                            Description: "$_id.Description"
                        }
                    }
                }
            },{
                $unwind: "$Tickets"
            }, {
                $project: {
                    _id: "$_id.Sprint",
                    IssueKey: "$_id.IssueKey",
                    IssueID: "$_id.IssueID",
                    IssueLink: "$_id.IssueLink",
                    Assignee: "$Tickets.Assignee", 
                    IssueStatus: "$Tickets.IssueStatus",
                    Description: "$Tickets.Description"
                }
            }]).toArray().then(function(result){
                db.close();
                resolve(result);
            });
        });
    });
}
module.exports.getTeamSprintsData = getTeamSprintsData;

function getSprints(req){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/onejira';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collectionName = req.url.split("?")[1] + "Userstory";
            var collection = db.collection(collectionName);
            collection.aggregate([{ 
                $unwind: "$issues"
            }, {
                $unwind: "$issues.fields.customfield_10004"
            }, {
                $project: {
                    _id: {
                        $arrayElemAt: [{
                            $split: [{
                                $arrayElemAt: [{
                                    $split: ["$issues.fields.customfield_10004", ","]
                                }, 3]
                            }, "="]
                        }, 1]
                    },
                    start_date: {
                        $arrayElemAt: [{
                            $split: [{
                                $arrayElemAt: [{
                                    $split: [{
                                        $arrayElemAt: [{
                                            $split: ["$issues.fields.customfield_10004", ","]
                                        }, 4]
                                    }, "="]
                                }, 1]
                            }, "T"]
                        }, 0]
                    }
                }
            }, {
                $match: {start_date: {
                        $ne: "<null>"
                    }}
            }, {
                $group: {
                    _id: "$_id",
                    start_date: {
                        $first: "$start_date"
                    }
                }
            }, {
                    $sort: {start_date: -1}
            }, {
                $project: { _id: "$_id"}
            }]).toArray().then(function(result){
                db.close();
                resolve(result);
            });
        });
    });
}
module.exports.getSprints = getSprints;


function calculateVelocity(req){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/onejira';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collectionName = req.url.split("?")[1] + "Userstory";
            var collection = db.collection(collectionName);
            var teamName = collectionName.substring(5, 10);
            collection.aggregate([{
                    $unwind: "$issues"
                },
                {
                    $unwind: "$issues.fields.customfield_10004"
                },{
                    $project: {
                        _id: "$issues.id",
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
                            Status: "$status"
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
                        status: "$_id.Status",
                        Issue: {$arrayElemAt: ["$Issue",0]}
                    }
                }, {
                    $group: {
                        _id: {
                            IssueID: "$_id",  
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
                }]).toArray().then(function(result){
                    var sprints = new Map();
                    var lastThreeSprintsCommitted = 0;
                    var lastThreeSprintsCompleted = 0;

                    for(var i = 0; i < result.length; i++){
                        var sprintName = result[i]._id.SprintName;

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
                    var avgCommit = 0;
                    var avgCompleted = 0;
                    var consistency = 0;
                    var sprint_names = [];
                    var committed_sp = [];
                    var completed_sp = [];

                    for(var k = 0; k < sprints.size; k++){
                        var sprint = keys.next().value;
                        var tmp_commit = sprints.get(sprint)[0];
                        var tmp_complete = sprints.get(sprint)[1];

                        if(k < sprints.size - 1 || sprints.size === 1){
                            avgCommit +=tmp_commit;
                            avgCompleted +=tmp_complete;

                            if(k > sprints.size - 5){
                            
                                lastThreeSprintsCommitted += tmp_commit;
                                lastThreeSprintsCompleted += tmp_complete;
                            }
                        }

                        committed_sp.push(tmp_commit);
                        completed_sp.push(tmp_complete);
                        sprint_names.push(sprint);
                    }

                    consistency =  (avgCompleted / avgCommit)*100;
                    if(sprints.size > 1){
                        avgCommit /= (sprints.size - 1);  
                        avgCompleted /= (sprints.size - 1);
                    }
                    lastThreeSprintsCommitted /= 3;   
                    lastThreeSprintsCompleted /= 3;  

                    var toJSON = {    
                        teamName: teamName,
                        avgCommit: avgCommit.toFixed(3),
                        avgComplete: avgCompleted.toFixed(3),
                        consistency: consistency.toFixed(3),
                        avgCommitThreeSprints: lastThreeSprintsCommitted.toFixed(3),
                        avgCompleteThreeSprints: lastThreeSprintsCompleted.toFixed(3),
                        committedVelocities: committed_sp,
                        completedVelocities: completed_sp,
                        sprints: sprint_names
                    };
                    db.close();
                    resolve(toJSON);
                });
            });
        });
}
module.exports.calculateVelocity = calculateVelocity;

/* Returns the Committed and Completed Velocity for an individual over the span of the data
and over the first 3 sprints*/
function getIndividualVelocity(req){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/onejira';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collectionName = req.url.split("?")[1] + "Userstory";
            var collection = db.collection(collectionName);
            var teamName = collectionName.substring(5, 10);
            collection.aggregate([{
                $unwind: "$issues"
                },{
                    $unwind: "$issues.fields.customfield_10004"
                }, {
                    $project: {
                        member: "$issues.fields.assignee.displayName",
                        story_points: "$issues.fields.customfield_10006",
                        status: "$issues.fields.status.statusCategory.name",
                        issue_id: "$issues.id",
                        start_date: {$arrayElemAt: [{$split: [{$arrayElemAt: [{$split: ["$issues.fields.customfield_10004", ","]}, 4]}, "="]}, 1]},
                    }
                },{
                    $match: {
                        story_points: { $ne: null},
                        member: { $ne: null, $exists: true }, 
                        start_date: {$ne: null, $ne: "<null>"},
                    }
                }, {
                    $group: {
                        _id:{ 
                            status: "$status",
                            issue_id: "$issue_id"
                        },
                        Data: {
                            $push: {
                                story_points: "$story_points",
                                member: "$member", 
                                start_date: "$start_date"
                            }
                        }
                    }
                }, {
                    $project: {
                        _id: {
                            status: "$_id.status",
                            issue_id: "$_id.issue_id"
                        },
                        Data: {
                            $arrayElemAt: ["$Data",0]
                        }
                    }
                }, {
                    $group: {
                        _id: {
                            start_date: "$Data.start_date"
                        },
                        Data: {
                            $push: {
                                issue_id: "$_id.issue_id", 
                                status: "$_id.status", 
                                story_points: "$Data.story_points", 
                                member: "$Data.member",
                            }
                        }
                    }
                }, {
                    $sort: {_id: -1}
                }, {
                    $skip: 1
                }]).toArray().then(function(result){
                    var foundIssues = new Map();
                    var members = new Map();
                    for(var i = 0; i < result.length; i++){
                        for(var j = 0; j < result[i].Data.length; j++){
                            if(foundIssues.has(result[i].Data[j].issue_id)){
                                if(foundIssues.get(result[i].Data[j].issue_id) === "Done"){
                                    continue;
                                }
                                else if(result[i].Data[j].status === "Done" && 
                                foundIssues.get(result[i].Data[j].issue_id) != "Done"){
                                    var oldValue = members.get(result[i].Data[j].member);
                                    if(i < 3){
                                        members.set(result[i].Data[j].member, [oldValue[0], 
                                            oldValue[1] + result[i].Data[j].story_points,
                                            oldValue[2], oldValue[3] + result[i].Data[j].story_points]);
                                    }else {
                                        members.set(result[i].Data[j].member, [oldValue[0], 
                                            oldValue[1], oldValue[2], oldValue[3] + 
                                            result[i].Data[j].story_points]);
                                    }
                                    foundIssues.set(result[i].Data[j].issue_id, "Done");
                                }
                            }else{
                                foundIssues.set(result[i].Data[j].issue_id, result[i].Data[j].status);
                                if(members.has(result[i].Data[j].member)){
                                    var oldValue = members.get(result[i].Data[j].member);
                                    if(result[i].Data[j].status === "Done"){
                                        if(i < 3){
                                            members.set(result[i].Data[j].member, [oldValue[0] + 
                                                result[i].Data[j].story_points, oldValue[1] + 
                                                result[i].Data[j].story_points,oldValue[2] + 
                                                result[i].Data[j].story_points, oldValue[3] + 
                                                result[i].Data[j].story_points]);
                                        }else {
                                            members.set(result[i].Data[j].member, [oldValue[0], 
                                                oldValue[1], oldValue[2] + result[i].Data[j].story_points, 
                                                oldValue[3] + result[i].Data[j].story_points]);
                                        }
                                    }else {
                                        if(i < 3){
                                            members.set(result[i].Data[j].member, [oldValue[0] + 
                                                result[i].Data[j].story_points, oldValue[1],
                                                oldValue[2] + result[i].Data[j].story_points, 
                                                oldValue[3]]);
                                        }else {
                                            members.set(result[i].Data[j].member, [oldValue[0], 
                                                oldValue[1], oldValue[2] + result[i].Data[j].story_points, 
                                                oldValue[3]]);
                                        } 
                                    }
                                }else{
                                    if(result[i].Data[j].status === "Done"){
                                        if(i < 3){
                                            members.set(result[i].Data[j].member, [
                                                result[i].Data[j].story_points,
                                                result[i].Data[j].story_points, 
                                                result[i].Data[j].story_points, 
                                                result[i].Data[j].story_points]);
                                        }else {
                                            members.set(result[i].Data[j].member, [0, 0, 
                                                oldValue[2] + result[i].Data[j].story_points, 
                                                oldValue[3] + result[i].Data[j].story_points]);
                                        }
                                    }else {
                                        if(i < 3){
                                            members.set(result[i].Data[j].member, [ 
                                                result[i].Data[j].story_points, 0,
                                                result[i].Data[j].story_points, 0]);
                                        }else {
                                            members.set(result[i].Data[j].member, [0, 0, 
                                                result[i].Data[j].story_points, 0]);
                                        } 
                                    }
                                }
                            }
                        }
                    }
                    db.close();
                    resolve(Array.from(members.entries()));
                  });
                });
            });
  }

  module.exports.getIndividualVelocity = getIndividualVelocity;


// Authenticate user at LogIn by binding their username (email) and password
//     and checking it against the Transamerica server
function authenticate(userName="", password="") {
    // Create client and bind to AD
    var ldapClient = ldap.createClient({ 
        url: "ldap://crdcusdc01.us.aegon.com:389",
        connectTimeout: 3600000,
        reconnect: true
    });
  
    var passed = false;
    
    return new Promise(function(resolve, reject) {
      ldapClient.bind(userName, password, function(err) {
          if (err instanceof Error) {
              console.log(err);
              console.log("Invalid credentials.");
              resolve(passed);
  
          } else {
              console.log("Bind was successful.");
              var name = userName.split(".")[0]
              name = name[0].toUpperCase() + name.slice(1);
              console.log("Welcome to the Transamerica site, " + name + "!");
              passed = true;
              console.log(passed);
              resolve(passed);
          }
      });
  
    })
  
  }
  
  module.exports.authenticate = authenticate;

  function getMaturity(req) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/onejira';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collectionName = req.url.split("?")[1] + "Userstory";
            var collection = db.collection(collectionName);
            var teamName = collectionName.substring(5, 10);
            var sprintName = req.url.split("?")[2].replace(/%20/g, " ");
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
                        sprint_name: {$eq: sprintName}
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
                }]).toArray().then(function(result){
                    var sprints = [];
                    for(var i = 0; i < result.length; i++){   
                        var sprintName = result[i]._id.sprint_name;
                        var startDate = new Date(result[i]._id.start_date);
                        var maturePoints = 0;
                        var matureIssues = 0;
                        var immatureIssues = [];
                        for(var j = 0; j < result[i].Data.length; j++){
                            var createdDate = new Date(result[i].Data[j].created_date);
                            if(startDate - createdDate >= 0){
                                maturePoints += result[i].Data[j].story_points;
                                matureIssues++;
                            }else{
                                immatureIssues.push([result[i].Data[j].issue_key, 
                                    result[i].Data[j].story_points, result[i].Data[j].assignee]);
                            }
                        }
                        sprints[i] = [sprintName, maturePoints, result[i].total_story_points, 
                                        matureIssues, result[i].Data.length, immatureIssues];
                    }
                    db.close();
                    resolve(sprints);
                });
            });
        });
  }
  module.exports.getMaturity = getMaturity;

function getSprintListForMaturity(req) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/onejira';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collectionName = req.url.split("?")[1] + "Userstory";
            var collection = db.collection(collectionName);
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
                },
                {
                    $group: { 
                        _id: "$sprint_name",
                        data: {
                            $push: {
                                start_date: "$start_date"
                            }
                        }
                    }
                }, {
                    $project: {
                        _id: "$_id", 
                        start_date: {
                            $arrayElemAt: ["$data",0]
                        }
                    }
                }, {
                    $sort: {"start_date": -1}
                }, {
                    $project: {_id: "$_id"}
                }]).toArray().then(function(result){
                    db.close();
                    resolve(result)
            });
        });
    });
}
module.exports.getSprintListForMaturity = getSprintListForMaturity;

//db.TeamInfo.aggregate([{$sort: {"_id": 1}}])
function getTeamsInfo(req) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/onejira';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collection = db.collection("TeamInfo");
            collection.aggregate([{$sort: {"_id": 1}}]).toArray().then(
                function(result){
                    db.close();
                    resolve(result)
                }
            );
        });
    });
}
module.exports.getTeamsInfo = getTeamsInfo;


//Get Jiraffe Indiv Leaderboard
function getJiraffeIndivLeaderboard(){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/queries';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collection = db.collection("JiraffeIndividualLeaderboard");
            collection.aggregate([{
                $group: {
                    _id: "$_id.TeamMember",
                    Info: {
                        $push: {
                            TeamName: "$_id.TeamName",
                            TeamID: "$_id.TeamID"
                        }
                    },
                    Score: {
                        $sum: "$TotalPoints"
                    }
                }
            },{
                $sort: {
                    Score: -1
                }
            }, {
                $project: {
                    _id: "$_id",
                    Score: "$Score",
                    Team: {
                        $substr: [{
                            $reduce: {
                                input: "$Info.TeamName",
                                initialValue: "",
                                "in": {
                                    $concat: ["$$value", " and ", "$$this"]
                                }
                            }
                        }, 5, -1]
                    }
                }
            }]).toArray().then(
                function(result){
                    var toJson = [];
                    for(var i = 0; i < result.length; i++){
                        var entry = {
                            rank: i+1,
                            employee_name: result[i]._id,
                            score: result[i].Score,
                            team_name: result[i].Team
                        };
                        toJson.push(entry);
                    }
                    db.close();
                    resolve(toJson);
                }
            );
        });
    });
}
module.exports.getJiraffeIndivLeaderboard = getJiraffeIndivLeaderboard;

//Get Jiraffe Team Leaderboard
function getJiraffeTeamLeaderboard(){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/queries';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var collection = db.collection("JiraffeTeamLeaderboard");
            collection.aggregate([{
                $sort: {
                    Score: -1
                }
            }]).toArray().then(function(result){
                var toJson = [];
                for(var i = 0; i < result.length; i++){
                    var entry = {
                        rank: i+1,
                        team_id: result[i]._id,
                        team_name: result[i].TeamName,
                        score: result[i].Score
                    };
                    toJson.push(entry);
                }
                db.close();
                resolve(toJson);
            });
        });
    });
}
module.exports.getJiraffeTeamLeaderboard = getJiraffeTeamLeaderboard;

//Get Jiraffe Team Leaderboard
function getJiraffePersonalInfo(req){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/queries';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var sprintName = req.url.split("?")[1].replace(/%20/g, " ");
            var collection = db.collection("JiraffePersonalData");
            collection.aggregate([{
                    $unwind: "$info"
                }, {
                    $project: {
                        _id: "$info._id",
                        team_id: "$_id",
                        user_id: "$info.user_id",
                        email: "$info.email",
                        contact: "$info.contact",
                        department: "$info.department",
                        company: "$info.company",
                        location: "$info.location",
                        level: "$info.level",
                        admin_pts: "$info.admin_pts",
                        user_pts: "$info.user_pts",
                        tester_pts: "$info.tester_pts",
                        developer_pts: "$info.developer_pts",
                        total_pts: "$info.total_pts"
                    }
                }, {
                    $group: { 
                        _id: "$_id",
                        info: {
                            $push: {
                                user_id: "$user_id",
                                email: "$email",
                                contact: "$contact",
                                team_id: "$team_id",
                                department: "$department",
                                company: "$company",
                                location: "$location",
                                level: "$level",
                                admin_pts: "$admin_pts",
                                user_pts: "$user_pts",
                                tester_pts: "$tester_pts",
                                developer_pts: "$developer_pts",
                                total_pts: "$total_pts"
                            }
                        }
                    }
                }, {
                    $match: {
                        _id: {$eq: sprintName}
                    }
                }, {
                    $unwind: "$info"
                }]).toArray().then(function(result){
                    if(result.length < 1) {
                        reject(new Error("No data for this employee"));
                    }

                    var latest_index = 0;
                    var team_id = [];
                    for(var i = 0; i < result.length; i++){
                        if(result[i].info.total_pts > result[latest_index].info.total_pts) {
                            latest_index = i;
                        }
                        team_id.push(result[i].info.team_id);
                    }

                    var toJson = {
                        _id: result._id,
                        user_id: result[latest_index].info.user_id,
                        email: result[latest_index].info.email,
                        contact: result[latest_index].info.contact,
                        team_id: team_id,
                        department: result[latest_index].info.department,
                        company: result[latest_index].info.company,
                        location: result[latest_index].info.location,
                        level: result[latest_index].info.level,
                        admin_pts: result[latest_index].info.admin_pts,
                        user_pts: result[latest_index].info.user_pts,
                        tester_pts: result[latest_index].info.tester_pts,
                        developer_pts: result[latest_index].info.developer_pts,
                        total_pts: result[latest_index].info.total_pts
                    };
                    db.close();
                    resolve(toJson);
                });
            });
    });
}
module.exports.getJiraffePersonalInfo = getJiraffePersonalInfo;

function getTeamName(req){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/queries';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var teamId = req.url.split("?")[1].replace(/%20/g, " ");
            var collection = db.collection("TeamInfo");
            collection.aggregate([{
                $match: {
                    _id: {$eq: teamId}
                }
            }]).toArray().then(function(result){
                db.close();
                resolve({_id: result[0]._id, name: result[0].TeamName + " (" + result[0].TeamKey + ")"});
            });
        });
    });
}
module.exports.getTeamName = getTeamName;

/*
.aggregate([{
    $unwind: "$info"
    }, {
        $project: {
            _id: "$info._id",
            team_id: "$_id",
            tickets: "$info.ticket_info"
        }
    }, {
        $group: {
            _id: "$_id",
            info: {
                $push: {
                    team_id: "$team_id",
                    tickets: "$tickets"
                }
            }
        }
    }, {
        $match: {_id: {$eq: "Srivastava, Indresh"}}
    }, {
        $unwind: "$info"
    }, {
        $project: {
            _id: "$_id",
            team_id: "$info.team_id",
            tickets: "$info.tickets"
        }
    }])
 */
function getIndivMaturity(req){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/queries';

    return new Promise(function(resolve, reject){
        MongoClient.connect(url).then(function(db){
            var employeeName = req.url.split("?")[1].replace(/%20/g, " ");
            var collection = db.collection("IndividualMaturity");
            collection.aggregate([{
                $unwind: "$info"
                }, {
                    $project: {
                        _id: "$info._id",
                        team_id: "$_id",
                        tickets: "$info.ticket_info"
                    }
                }, {
                    $group: {
                        _id: "$_id",
                        info: {
                            $push: {
                                team_id: "$team_id",
                                tickets: "$tickets"
                            }
                        }
                    }
                }, {
                    $match: {_id: {$eq: employeeName}}
                }, {
                    $unwind: "$info"
                }, {
                    $project: {
                        _id: "$_id",
                        team_id: "$info.team_id",
                        tickets: "$info.tickets"
                    }
                }]).toArray().then(function(result){
                    var toJson = [];
                    for(var i= 0; i < result.length; i++) {
                        for(var j =0; j < result[i].tickets.length; j++) {
                            var maturity = '';
                            if(result[i].tickets[j].ticket_creation_date > result[i].tickets[j].sprint_start_date) {
                                maturity = "Late";
                            }else{
                                maturity = "On Time";
                            }
                            toJson.push({
                                team_id: result[i].team_id,
                                sprint: result[i].tickets[j].sprint,
                                ticket_id: result[i].tickets[j].ticket_id,
                                story_points: result[i].tickets[j].ticket_story_points,
                                maturity_status: maturity,
                            });
                        }
                    }
                    db.close();
                    resolve(toJson);
            });
        });
    });
}
module.exports.getIndivMaturity = getIndivMaturity;


