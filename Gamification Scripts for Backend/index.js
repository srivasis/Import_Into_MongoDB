var express = require('express');
var router = express.Router();
var services = require('./services');
var cors = require('cors');
var utils = require('./utils');

const jwt = require('jsonwebtoken');

var authenticated = false;

router.use(cors());

/* GET authentication (LogIn) page to validate users. */
router.get('/login', function(req, res, next) {
    res.render('ldap', { title: 'Authenticate'});
  });

router.post('/login', function(req, res, next) {
    user = req.body['userName'];

    //Safety checks, they shouldn't get past the form fields, though.
    if (!user.endsWith("@transamerica.com")){

        // User enters only their name as John.Doe
        if (user.includes(".")) {
            user += "@transamerica.com";
        // User enters name as John Doe
        } else {
            field = user.split(' ');
            user = field[0] + "." + field[1] + "@transamerica.com";
        }
    } 
    services.authenticate(user, req.body['password']).then(function(result) {
        if (result){
            console.log("Pass");
            authenticated = true;
            let payload = { subject: user }
            let token = jwt.sign(payload, 'Transamardica')
            let message = "Congratulations " + user.split(".")[0] + "! You are logged in.";
            res.status(200).send({ token });
            res.redirect('/');
        } else {
            console.log("Fail");
            res.status(401).send("Invalid Transamerica Credentials");
        }
    })

});

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!authenticated) { res.redirect('/login'); }
    services.leaderboard().then(function(result){
        res.render('index', {
            "teamAndConsistency": result,
            title: "Transamerica"
        });
    });
});

/* ONEJIRA TEAMS for filetering based of team names*/
router.get('/collections', function(req, res){
    if (!authenticated) { res.redirect('/login'); }
	if(req.query.search){
        services.searchBar(req.query.search.toLowerCase()).then(function(result){
            res.render('searchResults', {
                'teamMembers': result
            });
        });         
    }
    else{
        services.collectionsDisplay().then(function (result){
            res.render('collections', {
                "teamList": result,
            });
        });
    }
});

/* Options for after team filter*/
router.get('/collectionFilter', function(req, res){
    if (!authenticated) { res.redirect('/login'); }
	services.getTeamData(req).then(function(result){
        res.render('collectionsFilter', {
            "teamName" : result[0],
            "teamEntries" : result[1]          
        });
    });
});

/* Display team members*/
router.get('/teamRoster', function(req,res){
    if (!authenticated) { res.redirect('/login'); }
	services.teamRoster(req).then(function(result){
        res.render('teamRoster', {
            "teamMembers": result[0], 
            "title": result[1]
        });
    });
});

/* Display MongoDB data for that team*/
router.get('/collectionData', function(req, res){
    if (!authenticated) { res.redirect('/login'); }
	services.collectionData(req).then(function(result){
        res.render('collectionData', {
            "title": result[0],
            "teamName":result[1],
            "dataList":result[2]
        });
    });
});

/*Team Velocity*/
router.get('/velocity', function (req, res) {
    if (!authenticated) { res.redirect('/login'); }
    services.getVelocity(req).then(function(result){
        res.render('velocityData', {
            "teamName": result[0],
            "avgCommit": result[1],
            "avgComplete": result[2],
            "completeness": result[3],
            "avgCommitThreeSprints": result[4],
            "avgCompleteThreeSprints": result[5],
            "committedVelocities": result[6],
            "completedVelocities": result[7],
            "consistency": result[8],
            "sprints": result[9],
            "startDates" : result[10],
            "endDates" : result[11]
        });
    });
});

/******************************************** API *********************************************/

/* Team and Last 3 Sprint Completeness for leaderboard */
router.get('/rest/leaderboard.json', function(req, res) {
    services.leaderboard().then(function(result){
        res.json(result);
    });
});

/* Teams for the searched result*/
router.get('/rest/search.json', function(req, res){
    services.searchBar(req.query.search.toLowerCase()).then(function(result){
        res.json(result);
    });         
}); 

/* Team names and keys for listing out teams */
router.get('/rest/team-and-names.json', function(req, res){
    services.collectionsDisplay().then(function (result){
        res.json(result);
    });
});

/* Options for after team filter*/
router.get('/rest/team-and-collections.json', function(req, res){
	services.getTeamData(req).then(function(result){
        res.json(result);
    });
});

/* Display team members*/
router.get('/rest/team-members.json', function(req, res){
	services.teamRoster(req).then(function(result){
        toReturn = [];
        for(var i = 0; i < result[0].length; i++){
          var member = {
            team: result[1],
            email: result[0][i].email,
            name: result[0][i]._id
          }
          toReturn.push(member);
        }  
        res.json(toReturn);
      });
});

/* Display MongoDB data for that team*/
router.get('/rest/team-collection-data.json', function(req, res){
	services.collectionData(req).then(function(result){
        res.json(result);
    });
});

/*
Team Velocity -----
RETURNED FIELDS >> 
    "teamName": result[0]
    "avgCommit": result[1]
    "avgComplete": result[2]
    "completeness": result[3]
    "avgCommitThreeSprints": result[4]
    "avgCompleteThreeSprints": result[5]
    "committedVelocities": result[6]
    "completedVelocities": result[7]
    "consistency": result[8]
    "sprints": result[9]
    "startDates" : result[10]
    "endDates" : result[11]
*/
router.get('/rest/team-velocity.json', function (req, res) {
    services.calculateVelocity(req).then(function(result){
        res.json(result);
    });
});

/* Displays teams and their members for search bar */
router.get('/rest/team-list-with-members.json', function (req, res) {
    services.getTeamMembers().then(function(result){
        res.json(result);
    });
});

/* Team Sprint and tickets for the sprint */
router.get('/rest/sprints.json', function(req, res){
    services.getTeamSprintsData(req).then(function (result){
        res.json(result);
    });
});

/* Team Sprints */
router.get('/rest/sprints-list.json', function(req, res){
    services.getSprints(req).then(function (result){
        res.json(result);
    });
});

/* Displays committed and completed velocity for individuals*/
router.get('/rest/individual-committed-completed.json', function (req, res) {
    services.getIndividualVelocity(req).then(function(result){
        var toResult = [];
        for(var i = 0; i < result.length; i++){
            var teamMember = {
                member: result[i][0],
                overallCommit: result[i][1][2],
                overallComplete: result[i][1][3],
                threeSprintCommit: result[i][1][0],
                threeSprintComplete: result[i][1][1]
            }
            toResult.push(teamMember);
        }
        res.json(toResult);
    });
});

router.get('/rest/maturity-sprint-list.json', function (req, res) {
    services.getSprintListForMaturity(req).then(function(result){
        res.json(result);
    });
});

router.get('/rest/team-maturity.json', function (req, res) {
    services.getMaturity(req).then(function(result){
        res.json({
            name: result[0][0],
            maturePoints: result[0][1],
            totalStoryPoints: result[0][2],
            matureIssueCount: result[0][3],
            totalIssueCount: result[0][4],
            arrOfImmatureIssues: result[0][5]
        });
    });
});

router.get('/rest/team-info.json', function (req, res) {
    services.getMaturity(req).then(function(result){
        res.json(result);
    });
});

router.get('/rest/jiraffe-indiv-leaderboard.json', function(req, res){
    services.getJiraffeIndivLeaderboard().then(function(result){
        res.json(result);
    });
});

router.get('/rest/jiraffe-team-leaderboard.json', function(req, res){
    services.getJiraffeTeamLeaderboard().then(function(result){
        res.json(result);
    });
});

router.get('/rest/jiraffe-employee-info.json', function(req, res){
    services.getJiraffePersonalInfo(req).then(function(result){
        res.json(result);
    });
});

router.get('/rest/team-name.json', function(req, res){
    services.getTeamName(req).then(function(result){
        res.json(result);
    });
});

module.exports = router;