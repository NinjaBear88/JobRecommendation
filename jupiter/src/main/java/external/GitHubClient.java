package external;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.*;

import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONArray;
import org.json.JSONObject;

import entity.Item;
import entity.Item.ItemBuilder;


public class GitHubClient {
	private static final String URL_TEMPLATE = "https://jobs.github.com/positions.json?description=%s&lat=%s&long=%s";
	private static final String DEFAULT_KEYWORD = "developer";
	
	public List<Item> search(double lat,double lon, String keyword) {
		if(keyword == null) {
			keyword = DEFAULT_KEYWORD;
		}
		
		try {
			keyword = URLEncoder.encode(keyword,"UTF-8");//rick sun > rick%20sun
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		String url = String.format(URL_TEMPLATE, keyword,lat,lon);
		CloseableHttpClient httpClient = HttpClients.createDefault();// create a client
		
		try {
			CloseableHttpResponse response = httpClient.execute(new HttpGet(url));
			if(response.getStatusLine().getStatusCode() != 200) {
				return new ArrayList<>();
			}
			
			HttpEntity entity = response.getEntity(); //get body
			if(entity == null) {
				return new ArrayList<>();
			}
			BufferedReader reader = new BufferedReader(new InputStreamReader(entity.getContent()));
			StringBuilder responseBody = new StringBuilder();
			String line = null;
			while((line = reader.readLine())!= null) {
				responseBody.append(line);
			}
			JSONArray array = new JSONArray(responseBody.toString());
			return getItemList(array);
			
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return new ArrayList<>();
	}
	
	private List<Item> getItemList(JSONArray array){
		List<Item> itemList = new ArrayList<>();
		List<String> descriptionList = new ArrayList<>();

		for(int i = 0; i< array.length(); i++) {
			JSONObject object = array.getJSONObject(i);
			ItemBuilder builder = new ItemBuilder();
			builder.setItemId(object.isNull("id")? "" :object.getString("id"));
			builder.setName(object.isNull("title")? "" : object.getString("title"));
			builder.setAddress( object.isNull("location")? "" :object.getString("location"));
			builder.setUrl(object.isNull("url")? "" :object.getString("url"));
			builder.setImageUrl( object.isNull("company_logo")? "" :object.getString("company_logo"));
			
			if(object.getString("description").equals("\n")) {
				descriptionList.add(object.getString("title"));
			}else {
				descriptionList.add(object.getString("description"));
			}
			
			Item item = builder.build();
			itemList.add(item);
		}
		
		if(descriptionList.size() > 0) {
			String[] text = descriptionList.toArray(new String[descriptionList.size()]);
			List<List<String>> keywordsList = MonkeyLearnClient.extractKeywords(text);
			for(int i = 0; i < keywordsList.size(); i++) {
				List<String> keywords = keywordsList.get(i);
				Set<String> set = new HashSet<String>(keywords);
				itemList.get(i).setKeywords(set);
			}

		}
		
		return itemList;
	}
	
	
	
	public static void main(String[] args) {
		GitHubClient client = new GitHubClient();
		List<Item> jobs = client.search(37.38, -122.08, null);
		try {
			for (Item item : jobs) {
				JSONObject jsonObject = item.toJSONObject();
				System.out.println(jsonObject);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}


}
