const request = require('request');
const _ = require('lodash');

const api_from_index = require('fs').readFileSync('./erp/public/index.html').toString().match(/(window.__erp_api_url = 'http:\/\/((\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})|(localhost))\/erp_api\/')/g);
let api_path = '';
if (api_from_index && api_from_index.length > 0) {
  // localhost
  api_match = api_from_index[0].match(/localhost/g);

  if (!api_match) {
    // some ip
    api_match = api_from_index[0].match(/(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})/g);
  }

  if (!api_match) {
    throw new Error("Api route not defined.")
  }

  api_path = api_match[0];

}

exports.getMenu = function (cb, viewName) {
  console.log(`Calling api to get menu.`);
  let response = {};

  request.get({url: `http://${api_path}/erp_api/api/menu`}, (err, headers, body)=>{
    menuRetVal = '';
    if (err) {
     // returns empty images array to client incase of error
     console.log(err);
     return;
   }
    let theMenu = getMenuId(JSON.parse(body), `app.${viewName}`);
    if (theMenu) {
      console.log(`**** fetched menu from menu api ****`);
      console.log(theMenu);
      console.log(`**********************************`);
      cb(theMenu);
    }
    else {
      console.log(`No menu found by name "${viewName}"`);
    }
  });

  // http.get({
  //   hostname: api_path,
  //   port: 80,
  //   path: '/erp_api/api/menu',
  //   agent: false,
  //   headers: {}
  // },(menuResponse)=>{
  //   var body = [];
  //   menuResponse.on('data', function(chunk) {
  //     body.push(chunk);
  //   }).on('end', function() {
  //     body = Buffer.concat(body).toString();
  //     menuRetVal = '';
  //     let theMenu = getMenuId(JSON.parse(body), `app.${viewName}`);
  //     if (theMenu) {
  //       console.log(`**** fetched menu from menu api ****`);
  //       console.log(theMenu);
  //       console.log(`**********************************`);
  //       cb(theMenu);
  //     }
  //     else {
  //       console.log(`No menu found by name "${viewName}"`);
  //     }
  //
  //   });
  // });
  return response;
}

let menuRetVal;
let getMenuId = function (nodes, menuHref) {
  _.forEach(nodes, (node)=>{
      if(node.nodes.length == 0){
          if((node.href || '').toLowerCase() == menuHref.toLowerCase()){
            menuRetVal = node;
          }
      }
      else{
          getMenuId(node.nodes, menuHref);
      }
  });
  return menuRetVal;
}

exports.getMenuId = getMenuId;
