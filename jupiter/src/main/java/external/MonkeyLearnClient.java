package external;
import java.util.*;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import com.monkeylearn.ExtraParam;
import com.monkeylearn.MonkeyLearn;
import com.monkeylearn.MonkeyLearnException;
import com.monkeylearn.MonkeyLearnResponse;

public class MonkeyLearnClient {
	private static final String API_KEY = "8b26b595fb437c3429ea9dcd4e693840c922d994";
	
	public static void main( String[] args ) throws MonkeyLearnException {
		String[] textList = {
		"software engineer front end Di Zhu, want to apply a job",
		"Elon Musk has shared a photo of the spacesuit designed by SpaceX. This is the second image shared of the new design and the first to feature the spacesuit’s full-body look."
				};
		List<List<String>> keywordsList = extractKeywords(textList);
		for (List<String> keywords : keywordsList) {
			for (String keyword : keywords) {
				System.out.println(keyword);
			}
			System.out.println();
		}



    }
	public static List<List<String>> extractKeywords(String[] text){
        // Use the API key from your account
        MonkeyLearn ml = new MonkeyLearn(API_KEY);

        // Use the keyword extractor
        ExtraParam[] extraParams = {new ExtraParam("max_keywords", "3")};
        MonkeyLearnResponse res = null;
		try {
			res = ml.extractors.extract("ex_YCya9nrn", text, extraParams);
		} catch (MonkeyLearnException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println(res.arrayResult.toString());
        return getKeywords(res.arrayResult);
		
	}
	
	private static List<List<String>> getKeywords(JSONArray array){
		List<List<String>> keywordsList = new ArrayList<>();
		for (int i = 0; i < array.size(); i++) {
			List<String> keywords = new ArrayList<>();
			JSONArray subArray = (JSONArray) array.get(i);
			for(int j = 0; j < subArray.size(); j++) {
				JSONObject obj = (JSONObject) subArray.get(j);
				String keyword = (String)obj.get("keyword");
				keywords.add(keyword);
			}
			keywordsList.add(keywords);
		}
		return keywordsList;
	}

}
