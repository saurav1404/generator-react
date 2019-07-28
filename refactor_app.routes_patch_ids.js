const fs= require('fs');
const http = require('http');
const _ = require('lodash');

http.get({
  hostname: '192.168.0.7',
  port: 80,
  path: '/erp_api/api/menu',
  agent: false,  // create a new agent just for this one request
  headers: {
      'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiI1MDdkMTQ5NC1iM2JjLTQyNjktOTZkMC0wYTdlZDg0NmZmMmYiLCJ1c2VySWQiOiI3ZDM1OTU5Zi1jMDMzLTQ0ZjgtYWIxMS03YTQ3ZGFjMGEyZTQiLCJyb2xlIjoiQWRtaW4iLCJzdWIiOiI3ZDM1OTU5Zi1jMDMzLTQ0ZjgtYWIxMS03YTQ3ZGFjMGEyZTQiLCJuYmYiOjE1MTM5NTA4NTMsImlhdCI6MTQ5ODEzOTY1MywiZXhwIjoxNDk4MTU0MDUzLCJpcCI6IjE5Mi4xNjguMC45IiwiY29tcGFueURCTmFtZSI6IkpTQyIsInVzZXJXYXJlaG91c2UiOiJkNzA0MmMwMy0yNTU3LTQ4MDgtYWJiYi02MDQ0OTNlMmVkODkifQ.Zl4yZOcupPR-zxht_1JjNf1NOvr7IRaULOo0_tJAITo'
    }
}, (request) => {
  // res.on('end', function (chunk) {
  //   console.log('BODY: ' + chunk);
  // });
  var body = [];
request.on('data', function(chunk) {
  body.push(chunk);
}).on('end', function() {
  body = Buffer.concat(body).toString();
  modifyMenu(body);
  // at this point, `body` has the entire request body stored in it as a string
});
});
let menuRetVal = '';
function modifyMenu(menu) {
  let data = fs.readFileSync('../erp/app/app.routes.js', 'utf8');
  let dataCopy = _.cloneDeep(data);
  let menuRet;
  _.forEach(dataCopy.match(/(.state\('app.*)/ig),(match)=>{
    // match.match(/app.+'/g).replace('\'','');
    //console.log(match);
    if (match.match(/app.+'/g)) {
      menuRetVal = null;
      menuRet = getMenuByhref(JSON.parse(menu), match.match(/app.+'/g)[0].replace('\'',''));
      //console.log(menuRet);
      if (menuRet) {
        data = data.replace(match, match+"\n\t\t\t\t\t\t\t\t"+`id: '${menuRet.id}',`);
      }

    }

  });

  console.log(data);
  fs.writeFileSync(`../erp/app/app.routes.js`, data);
}

function getMenuByhref(nodes, menuHref){

    _.forEach(nodes, (node)=>{
      //console.log(node);
        if(node.nodes.length == 0){
            if(node.href == menuHref){
              menuRetVal = node;
            }
        }
        else{
            getMenuByhref(node.nodes, menuHref);
        }
    });
    return menuRetVal;
}
