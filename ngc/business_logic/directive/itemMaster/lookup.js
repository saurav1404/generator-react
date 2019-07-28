vm.init = init;
vm.whseId = '';
vm.type = '';
vm.userId = localStorage.getItem('userId');
vm.selectedTableRow = 0;

vm.getItems = getItems;
vm.getWhseId = getWhseId;
vm.getItemData = getItemData;
vm.setItem = setItem;
vm.paginate = paginate;

vm.itemDataModel = [];

vm.query = {
    filter: '',
    limit: 12,
    order: 'ItemNo',
    page: 0,
    total: 1000
};

function init(){
    vm.widget = scope.lookup.data;
    vm.query.totalPage = Math.ceil(vm.query.total/vm.query.limit);
    getWhseId();          
};

function getWhseId(){
    var params = {
        'userId': vm.userId
    }
    itemMasterFactory.getWhseId(params).then(function(data){
        vm.whseId = data;
        getItems(undefined, data, vm.query.page, vm.query.limit);
    });
};

function getItemData(type){
    vm.type = type;
    getItems(type, vm.whseId, vm.query.page, vm.query.limit);
};

function paginate(count){
    vm.selectedTableRow = null;
    vm.query.page = _.parseInt(vm.query.page) + _.parseInt(count);
    if(vm.query.page < 0){
        vm.query.page = 0;
    }
    vm.query.pageCount = _.parseInt(vm.query.page)*_.parseInt(vm.query.limit);
    var type = vm.type || undefined;
    getItems(type, vm.whseId, vm.query.pageCount, vm.query.limit);
};

function getItems(type, whseId, page, limit){
    var params = {
        keyword: type || undefined,
        whseId: whseId,
        offset: page,
        limit: limit
    }
    vm.promise = itemMasterFactory.getItems(params).then(function(data){
        vm.itemData = data.Result || [];
        scope.lookup.getData(vm.itemData[0]);
        setFirstData(vm.itemData[0]);
    });
};

function setFirstData(item){
    item.DateAdded = new Date(item.DateAdded);
    item.LastChangeDate = new Date(item.LastChangeDate);
    item.LastReceiptDate = new Date(item.LastReceiptDate);
    item.LastPoDate = new Date(item.LastPoDate);
    item.LastSaleDate = new Date(item.LastSaleDate);
    item.DateLastPriced = new Date(item.DateLastPriced);
};

function setItem(item, index){
    vm.selectedTableRow = index;
    scope.lookup.getData(item);
    scope.setItemFn(item);
    item.DateAdded = new Date(item.DateAdded);
    item.LastChangeDate = new Date(item.LastChangeDate);
    item.LastReceiptDate = new Date(item.LastReceiptDate);
    item.LastPoDate = new Date(item.LastPoDate);
    item.LastSaleDate = new Date(item.LastSaleDate);
    item.DateLastPriced = new Date(item.DateLastPriced);
};

scope.lookup.getData = function (item) {
    scope.lookup.item = item;
    return scope.lookup;
};