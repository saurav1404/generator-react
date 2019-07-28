
vm.isDropOpen = false;

vm.hide = hide;
vm.edit = edit;
vm.change = change;
vm.dropOpen = dropOpen;

vm.item.getData = function(data){  
    getInformationData(data.Id);
};

function init(){
    vm.widget = vm.item.Information; 
    applyLogicalFilter(vm.widget);
    
};

function getInformationData(itemId){
    var params = {
        id: itemId
    };
    itemMasterFactory.getItemById(params).then(function(response){
        vm.information =  response.Result;
        vm.Id = response.Result.Id;
        vm.information.DateAdded = new Date(vm.information.DateAdded);
        vm.information.LastPoDate = new Date(vm.information.LastPoDate);
        vm.information.LastReceiptDate = new Date(vm.information.LastReceiptDate);
        vm.information.LastSaleDate = new Date(vm.information.LastSaleDate);
        vm.information.DateLastPriced = new Date(vm.information.LastSaleDate);
        _.assignIn(itemMasterService.item, {commodity: vm.information.IsCommodity});
        resetListPrice();
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

function change(data, name){
    if(name == 'IsCommodity'){
        _.assignIn(itemMasterService.item, {commodity: data});
        resetListPrice()
    }
};

function hide(){
    vm.widget.visible = false;
    vm.item.getWidget(vm.widget);
    scope.updateWidgetFn(vm.widget);
};

vm.item.getWidget = function(widget) {
    vm.item.widget = widget;
    return vm.item;
};

function dropOpen(){
    vm.isDropOpen = !vm.isDropOpen;
};

function updateItem(item){
    var params = {
        id: item.Id
    }
    itemMasterFactory.editItems(params, item).then(function(response){
        console.log(response);
    });
};

function edit(){
    var params = {
        id: vm.information.Id
    };
    var body = {
        "StatusId": vm.information.StatusId,
        "UPCNo": vm.information.UPCNo,
        "PSRNo": vm.information.PSRNo,
        "ManufacturingId": vm.information.ManufacturingId,
        "CountryId": vm.information.CountryId,
        "DateAdded": vm.information.DateAdded,
        "ConsignmentRate": vm.information.ConsignmentRate,
        "ConsignmentMethodId": vm.information.ConsignmentMethodId,
        "SEQPrifix": vm.information.SEQPrifix,
        "SEQSuffix": vm.information.SEQSuffix
    };
    
    itemMasterFactory.updateInformation(params, body).then(function(response){
        console.log(response)
    });
};