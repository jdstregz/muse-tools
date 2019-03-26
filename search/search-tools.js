//Imports
const axios = require("axios");
const token =
  "BQAkZZV1yzg7YShUGE831q3NaDMWGRej0TVy9VZbVmIblwuW7_VULs6UBn-Agon4RY9az1DQcS6MKWEHMJXP8gdJ9nsUWVA7ONPTIuQveyHHPs53XCWduSLdeMYrhOOYNGhVe1ygldOA1gCky_jvYMp0JpG2X6aKQPlgx55EZ7CBcTwd8QHnrra6pz0nu96aAGlPa44VbW_TNRg9JGRrADdWiMUxbSqWhdGcXFU-fVhh3nBN1GqISwnHBms";

const authHeader = access_token => {
  header = { Authorization: "Bearer " + access_token };
  return header;
};

const searchEndpoint = `https://api.spotify.com/v1/search`;

// returns data
// tracks....href, next, limit (20), total (results), offset, previous, items
const search = async (access_token, query, type) => {
  const searchString = `${searchEndpoint}?q=${query}+&type=${type}`;
  const search = await axios({
    method: "get",
    url: searchString,
    headers: authHeader(access_token),
    json: true
  });

  return search.data;
};

const getSongByName = async (access_token, name) => {
  const searchResults = await search(access_token, name, "track");
  const tracks = searchResults.tracks.items;
  for (const track of tracks) {
    if (track.name.trim().toLowerCase() == name.trim().toLowerCase()) {
      return track;
    }
  }
  return null;
};

// example: Hello my name is joshua
// "hello" "my" "name" "is" "joshua"
// "hello" "my name" "is" "joshua"
// "hello my" "name" "is" "joshua"
// "hello my" "name is" "joshua"
// "hello my name" "is" "joshua"
// "hello my name is" "joshua"
// "hello my name is joshua"

/*
public class PrintAllSubArrays {

    public void printSubArrays(int [] arrA){

        int arrSize = arrA.length;
        //start point
        for (int startPoint = 0; startPoint <arrSize ; startPoint++) {
            //group sizes
            for (int grps = startPoint; grps <=arrSize ; grps++) {
                //if start point = 1 then
                //grp size = 1 , print 1
                //grp size = 2, print 1 2
                //grp size = 3, print 1 2 3 ans so on
                for (int j = startPoint ; j < grps ; j++) {
                    System.out.print(arrA[j] + " ");
                }
                System.out.println();
            }
        }
    }

    public static void main(String[] args) {
        int [] arrA = {1,2,3, 4};
        new PrintAllSubArrays().printSubArrays(arrA);
    }

}
*/

const findAllSubArrays = stringArray => {
  var subsets = [];
  for (var i = 0; i < stringArray.length; i++) {
    var subset2 = [];
    for (var j = i; j <= stringArray.length; j++) {
      var subset = [];
      for (var k = i; k < j; k++) {
        subset.push(stringArray[k]);
      }
      var stringSub = subset.join(" ");
      subset2.push(stringSub);
    }
    subsets.push(subset2);
  }
  return subsets;
};

const getSongsViaSentence = async (access_token, name) => {};

const test = async () => {
  const returnValue = findAllSubArrays(["Hello", "my", "name", "is", "josh"]);
  console.log(returnValue);
};
test();

module.exports = {
  search
};
