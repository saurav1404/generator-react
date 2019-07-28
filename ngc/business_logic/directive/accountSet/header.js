vm.add = add;
vm.save = save;
vm.selectedHeader = selectedHeader;

function add(){
    var obj = {
        HasDetail: "N"
    }
    vm.header.push(obj);
};

function selectedHeader(data){
    vm.selectedData = data;
};

function save(){
    if(vm.selectedData.GlSetId){
        updateHeader(vm.selectedData);
    }else{
        saveHeader(vm.selectedData);
    }
};

function updateHeader(header){
    var params = {
        id: header.GlSetId
    };
    var index = _.findIndex(vm.widget.buttonList, function(o) { 
        return o.url.type == 'put'; 
    });
    console.log(header)
    var url = vm.widget.buttonList[index].url.value;
    accountSetFactory.callStart(url, params, header, 'error', 'put').then(function(response) {
        console.log(response)
    });
};

function saveHeader(header){
    var index = _.findIndex(vm.widget.buttonList, function(o) { 
        return o.url.type == 'post'; 
    });
    var url = vm.widget.buttonList[index].url.value;
    accountSetFactory.callStart(url, null, header, 'error', 'post').then(function(response) {
        console.log(response)
    });
    vm.TagAlongInserted = false;
};