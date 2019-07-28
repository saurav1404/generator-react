vm.change = change;
vm.save = save;

function formatDate(information){
    vm.information.DateAdded = new Date(information.DateAdded);
    vm.information.LastPoDate = new Date(information.LastPoDate);
    vm.information.LastReceiptDate = new Date(information.LastReceiptDate);
    vm.information.LastSaleDate = new Date(information.LastSaleDate);
    vm.information.DateLastPriced = new Date(information.LastSaleDate);
};

function resetListPrice(){
    _.forEach(vm.widget.components, function(value, key){
        _.forEach(value.properties.columns, function(value1, key1){
            if(value1.name == 'ListPrice'){
                if(vm.information.IsCommodity=='Y'){
                    value1.filters.disabled = true;
                    value1.filters.required = false;
                }else if(vm.information.IsCommodity=='N'){
                    value1.filters.disabled = false;
                    value1.filters.required = true;
                }
            }
        });
    });
};

function applyLogicalFilter(widgets){
    _.forEach(widgets.components, function(value, key){
        _.forEach(value.properties.columns, function(value1, key1){
            if(value1.name == 'GlSetId'){
            value1.listItems = _.remove(value1.listItems, function(obj) {
                return obj.label == 'NON';
            });
            }
        });
    });
};

function change(data, name){
    if(name == 'IsCommodity'){
        _.assignIn(itemMasterService.item, {commodity: data});
        resetListPrice()
    }
};

function save(){
    var params = {
        id: vm.itemData.Id
    };
    var index = _.findIndex(vm.widget.buttonList, function(o) { 
        return o.url.type == 'put'; 
    });
    var url = vm.widget.buttonList[index].url.value;
    itemMasterFactory.callStart(url, params, vm.information, 'error', 'put').then(function(response) {
        console.log(response)
    });
};