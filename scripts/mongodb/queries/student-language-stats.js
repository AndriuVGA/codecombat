load('bower_components/lodash/dist/lodash.js');
userMap = {}; // userID -> array of programming languages by classroom

db.classrooms.find().forEach(function(classroom) {
  if(!classroom.members) return;
  if(!(classroom.aceConfig && classroom.aceConfig.language)) return;
  var lang = classroom.aceConfig.language;
  classroom.members.forEach(function(memberID) {
    key = memberID + '';
    if(!userMap[key]) userMap[key] = [];
    userMap[key].push(lang);
  })
});

langCount = {}

Object.keys(userMap).forEach(function(key) {
  langs = _.unique(userMap[key]);
  countKey = langs.length.toString();
  if(!langCount[countKey]) langCount[countKey] = 0;
  langCount[countKey] += 1;
  if(langs.length > 2) {
    print('error: '+ JSON.stringify(userMap[key]))
  }
});

print(JSON.stringify(langCount, null, '\t'));
