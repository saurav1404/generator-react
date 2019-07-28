vm.openWarehouseEditor = openWarehouseEditor;

vm.query = {
    filter: '',
    limit: 5,
    order: 'ItemNo',
    page: 0,
    total: 1000
};

function getWarehouseData(itemId){
    var params = {
            id: itemId
    };
    itemMasterFactory.getWarehouse(params).then(function(response){
        vm.warehouse =  response.Result;
        if(vm.warehouse){
            vm.totalCount = vm.warehouse.length;
        }
    });
};

function openWarehouseEditor(){
    $modal.open({
        scope: scope,
        windowClass: 'app-modal-window',
        templateUrl: 'app/components/fileMaintenance/inventory/itemMaster/templates/editWarehouseModal.html',
        controller: 'editWarehouseController as $edwa',
        resolve: {
            itemData: function() {
                return vm.warehouse;
            }
        }
    }).result.then(function(result) {
        console.log(result)
        //vm.tagAlong.push(result)
    });
};