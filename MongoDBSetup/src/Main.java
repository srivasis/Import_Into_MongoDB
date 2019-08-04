import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.Mongo;

public class Main {

	@SuppressWarnings({ "deprecation", "unchecked" })
	public static void main(String args[]) {

		if (args.length != 8) {
			System.out.println(
					"Incorrect arguments passed.\nArguments should be:\n1. Path to OneJira folder\n2. Path to the file containing start date\n3. IP address for the MongoDB\n4. Port number for MongoDB\n5. Database name");
			return;
		}

		String dir = args[0];
		String jiraffe_dir = args[1];
		String dateFile = args[2];
		String jiraffeDateFile = args[3];
		String ip = args[4];
		int port = Integer.parseInt(args[5]);
		String dbName = args[6];
		String jiraffeDBName = args[7];
		
		System.out.println(
				"Arguments passed ->\n1. Path to OneJira folder: "+ dir +
				"\n2. Path to the Jiraffe folder: "+ jiraffe_dir +
				"\n3. Path to the file containing start date: "+ dateFile +
				"\n4. IP address for the MongoDB: "+ ip +
				"\n5. Port number for MongoDB: "+ port +
				"\n6. Database name: "+ dbName +
				"\n7. Path to the file containing start date: "+ jiraffeDBName);

		FilePaths fps = new FilePaths(dir, dateFile);
		JiraffeFilePaths jfps = new JiraffeFilePaths(jiraffe_dir, jiraffeDateFile);

		// filePaths -> Holds paths to all json files that need to be pulled into
		// MongoDB

		ArrayList<String> filePaths = fps.getFilePaths();
		ArrayList<String> jiraffe_filePaths = jfps.getFilePaths();

		//ONE_JIRA DATA:
		try {
			Mongo mongo = new Mongo(ip, port);
			DB db = mongo.getDB(dbName);

			for (String filePath : filePaths) {
				String[] pathContents = filePath.split("\\\\");
				String projectID = pathContents[9];
				String fileName = pathContents[10];
				
				if(fileName.split("-")[2].equals("userstory")) {
					projectID+="Userstory";
				}

				System.out.println(filePath);
				
				DBCollection collection = db.getCollection(projectID);

				try {
					collection.insert((DBObject) JSON.parse(readFile(filePath)));
				} catch (Exception e) {
					System.out.println("Bad File Encountered -> " + filePath);
				}
			}

		} catch (Exception e) {
			System.out.println("Cannot insert into db");
			e.printStackTrace();
		}
		
		//JIRAFFE DATA:
		try {
			Mongo mongo = new Mongo(ip, port);
			DB jdb = mongo.getDB(jiraffeDBName);
			HashMap<String, ArrayList<JSONObject>> collections = new HashMap<>();

			for (String jiraffeFilePath : jiraffe_filePaths) {
				try {
					String date = jiraffeFilePath.split("\\\\")[8];
					JSONParser parser = new JSONParser();
					JSONObject json = (JSONObject) parser.parse(readFile(jiraffeFilePath));
					JSONArray teams = (JSONArray) json.get("TeamList");
					Iterator<JSONObject> iterator = teams.iterator();
					
					while(iterator.hasNext()) {
						JSONObject team = iterator.next();
						String teamName = "Prjct" + team.get("TeamID").toString();
						
						team.put("Date", date);
						
						JSONObject newDocument = new JSONObject();
						ArrayList<JSONObject> documents = new ArrayList<>();
						
						if(collections.containsKey(teamName)) {
							documents = collections.get(teamName);
							collections.remove(teamName);
						}
						
						newDocument.put("Team", team);
						documents.add(newDocument);
						
						collections.put(teamName, documents);
					}
				} catch (Exception e) {
					System.out.println("Bad File Encountered -> " + jiraffeFilePath);
					System.out.println(e);
				}
			}

			Set<String> teamCollections = collections.keySet();
			for(String collectionName: teamCollections) {
				DBCollection collection = jdb.getCollection(collectionName);
				ArrayList<JSONObject> documents = collections.get(collectionName);
				for(JSONObject obj: documents) {
					collection.insert((DBObject) JSON.parse(obj.toString()));
				}
			}
			
		} catch (Exception e) {
			System.out.println("Cannot insert into db");
			e.printStackTrace();
		}
	}

	@SuppressWarnings("resource")
	public static String readFile(String filepath) {
		InputStream is;
		try {
			is = new FileInputStream(filepath);
			BufferedReader buf = new BufferedReader(new InputStreamReader(is));
			String line = buf.readLine();
			StringBuilder sb = new StringBuilder();
			while (line != null) {
				sb.append(line).append("\n");
				line = buf.readLine();
			}
			String fileAsString = sb.toString();
			return fileAsString;
		} catch (FileNotFoundException e) {
			System.out.println("No file to read.");
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			System.out.println("Nothing in file to read.");
			e.printStackTrace();
			return null;
		}
	}
}
