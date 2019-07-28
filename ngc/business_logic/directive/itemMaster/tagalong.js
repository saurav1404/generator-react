vm.changed = changed;
vm.selectedTagAlong = selectedTagAlong;
vm.add = add;
vm.openLookup = openLookup;
vm.checker = [{}];
vm.TagAlongInserted = false;
vm.save = save;

vm.validator = [{
    disabled: {},
    required: {}
}];

function setDefaults(tagalong){
    var tag = 0;
    _.forEach(tagalong, function(value, key){
        refactor(value.TagAlong.TagalongType, tag);
        tag++;
    });
};

function changed(data, index, name, arrayIds){
    if(name == 'TagalongType'){
        refactor(data, index);
    }
};

function refactor(data, index){
    if(data == 'C'){
        var obj = {
            disabled: {
                TagalongType: false,
                ItemNo: true,
                Description: true
            },
            required: {
                TagalongType: true,
                ItemNo: false,
                Description: false
            }
        };
        vm.validator[index] = obj;
    }else if(data == 'O'){
        var obj = {
            disabled: {
                TagalongType: false,
                ItemNo: false,
                Description: true
            },
            required: {
                TagalongType: true,
                ItemNo: true,
                Description: false
            }
        };
        vm.validator[index] = obj;
    }else if(data == 'R'){
        var obj = {
            disabled: {
                TagalongType: false,
                ItemNo: false,
                Description: true
            },
            required: {
                TagalongType: true,
                ItemNo: true,
                Description: false
            }
        };
        vm.validator[index] = obj;
    }
};

function selectedTagAlong(data){
    vm.selectedTAData = data;
};

function add(){
    var obj = {
        TagAlong: {
            TagalongType: 'C',
            ItemId: vm.itemData.Id
        }
    };
    if(!vm.TagAlongInserted){
        vm.tagalong.push(obj);
    }
    vm.TagAlongInserted = true;
};

function openLookup(data, index){
    $modal.open({
        scope: scope,
        templateUrl: 'app/components/fileMaintenance/inventory/itemMaster/templates/itemLookUpModal.html',
        controller: 'itemLookUpController as $itlk',
        resolve: {
            item: function() {
                return data.RelatedItemId;
            }
        }
    }).result.then(function(result) {
        vm.tagalong[index].TagAlong.ItemNo = result.ItemNo;
        vm.tagalong[index].TagAlong.Description = result.Description;
        vm.tagalong[index].TagAlong.RelatedItemId = result.Id;
    });
};

function save(){
    if(vm.selectedTAData.TagAlong.TagalongId){
        updateTagAlong(vm.selectedTAData);
    }else{
        saveTagAlong(vm.selectedTAData);
    }
};

function updateTagAlong(tagAlong){
    var params = {
        id: vm.itemData.Id,
        tagId: tagAlong.TagAlong.TagalongId
    };
    var index = _.findIndex(vm.widget.buttonList, function(o) { 
        return o.url.type == 'put'; 
    });
    var url = vm.widget.buttonList[index].url.value;
    itemMasterFactory.callStart(url, params, tagAlong.TagAlong, 'error', 'put').then(function(response) {
        console.log(response)
    });
};

function saveTagAlong(tagAlong){
    var params = {
        id: vm.itemData.Id
    };
    var index = _.findIndex(vm.widget.buttonList, function(o) { 
        return o.url.type == 'post'; 
    });
    var url = vm.widget.buttonList[index].url.value;
    itemMasterFactory.callStart(url, params, tagAlong.TagAlong, 'error', 'post').then(function(response) {
        console.log(response)
    });
    vm.TagAlongInserted = false;
};