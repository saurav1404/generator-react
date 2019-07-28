DirectiveServiceProvider.moduleService = payrollService;
_.extend(vm, DirUtilsSrv);
vm.oneTimeData = DirUtilsSrv.oneTimeData = true;
vm.limit = DirUtilsSrv.limit = 5;
vm.pageNumber = DirUtilsSrv.pageNumber = 1;
vm.currentPage = DirUtilsSrv.currentPage = 1;
vm.itemsPerPage = DirUtilsSrv.itemsPerPage = 5;
vm.totalItems = DirUtilsSrv.totalItems = 0;

vm.init = init;
vm.callAgain = DirUtilsSrv.callAgain = callAgain;
vm.saveWidget = DirUtilsSrv.saveWidget = saveWidget;
vm.selectRow = selectRow;
vm.saveRowData = saveRowData;
vm.getList = getList;
vm.changed = changed;
vm.openLog = openLog;
vm.edit = edit;
vm.save = save;
vm.new = newItem;
vm.cancel = cancel;
vm.deleteRow = deleteRow;
vm.isEditing = false;
vm.columnStart = {};
vm.columnEnd = {};
vm.colArrange = true;
vm.isPageChange = false;
vm.deletePop = true;
vm.lastRow = 0;
var isResizing = false;
vm.isLookupClose = true;
vm.isSmall = false;
vm.blur = blur;

vm.options = {
    onColumnResized: function(event) {
        vm.changeColSize(vm, event);
    },
    onRowEditingStopped: function(event) {
        vm.save(event.node.data);
    },
    onRowClicked: function(event) {
        //vm.selectRow();
        event.node.setSelected(true);
        uiGridSrv.setInstance(vm);
        if ((event.rowIndex === 0 || event.rowIndex + 1 === vm.limit)) {
            vm.isPageChange = true
        } else {
            vm.isPageChange = false
        }
    },
    tabToPreviousCell: function(event) {
        return uiGridSrv.tabToPreviousCell(event, vm);
    },
    tabToNextCell: function(event) {
        return uiGridSrv.tabToNextCell(event, vm);
    },
    navigateToNextCell: function(event) {
        return uiGridSrv.navigateToNextCell(event, vm);
    },
    onSelectionChanged: function(event) {
        vm.richText = true;
        vm.selectRow();
    },
    onSortChanged: function(event) {
        if (vm.gridOptions && !isResizing) {
            uiGridSrv.setSortData(event, vm);
        }
    },
    onFilterChanged: function(event) {
        if (vm.gridOptions) {
            uiGridSrv.setFilterData(event, vm);
        }
    },
    onCellFocused: function(params) {
        vm.onFocusData = params;
        if (params && params.forceBrowserFocus) {
            var row = vm.gridOptions.api.getModel().getRow(params.rowIndex);
            if (row) {
                row.setSelected(true);
            }
        } else {
            if (params.column) {
                uiGridSrv.setInstance(vm);
            }
        }
        if (params.column) {
            vm.focusFieldIndex = {
                count: params.column.colDef.count,
                index: params.column.colDef.index
            };
        }
    },
    onColumnMoved: function(params) {
        vm.colId = params.column.colId;
        isResizing = true;
        if (vm.colId != '0') {
            if (vm.colArrange) {
                vm.columnStart = params;
                vm.colArrange = false;
            } else {
                vm.columnEnd = params;
            }
        }
    },
    onDragStopped: function(params) {
        if (vm.colId != '0') {
            vm.drop(vm);
            vm.colArrange = true;
        }
        $timeout(function() {
            isResizing = false;
        }, 3);
    },
    onGridReady: function(params) {
        if (_.get(params, 'api')) {
            vm.gridOptions.api = params.api;
        }
        if (_.get(params, 'columnApi')) {
            vm.gridOptions.columnApi = params.columnApi;
        }
        if (!vm.payrollChecks) {
            fetchData();
        }
    }
};

vm.gridOptions = {
    rowData: null
};

vm.gridOptions = _.extend(uiGridSrv.getAgGridOptions(), vm.options);

vm.item.getData = function(data) {

};

vm.item.getSideData = function() {

};

function init() {
    vm.widget = vm.item.PayrollChecks;
    vm.widget = UserSrv.setPermissionForAttribute(vm.widget, scope.permission);
    if (_.get(vm.widget.components[0], 'properties')) {
        vm.gridOptions.columnDefs = vm.buildData(vm.gridOptions, vm.widget.components[0].properties.columns, '$papa');
        vm.itemsPerPage = vm.limit = vm.gridOptions.paginationPageSize = vm.widget.paginationPageSize || 5;
        vm.sort = _defineProperty({}, vm.gridOptions.columnDefs[1].field, 'desc');
        vm.filter = {};
        uiGridSrv.getFieldToFocus(vm);
    }
    DirUtilsSrv.directivePeeker[vm.widget.name + '_' + vm.widget.id] = function() {
        return vm;
    };
    uiGridSrv.hamburgerFun(vm.widget, vm);
};

vm.item.getSideData = function() {
    if (_.get(vm.widget.components[0], 'properties') && _.get(vm.gridOptions, 'columnDefs') == undefined) {
        vm.gridOptions = {
            rowData: null
        };
        vm.gridOptions = _.extend(uiGridSrv.getAgGridOptions(), vm.options);
        vm.gridOptions.columnDefs = vm.buildData(vm.gridOptions, vm.widget.components[0].properties.columns, '$papa');
        vm.itemsPerPage = vm.limit = vm.gridOptions.paginationPageSize = vm.widget.paginationPageSize || 5;
        vm.widget.sort = vm.widget.sort ? vm.widget.sort : _defineProperty({}, vm.gridOptions.columnDefs[1].field, 'desc');
        vm.filter = {};
        uiGridSrv.getFieldToFocus(vm);
    }
    fetchData();
};

function fetchData() {

}

function dropOpen() {
    vm.isDropOpen = !vm.isDropOpen;
};

function callStart(url, id, errorMessage) {
    var sort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : vm.sort || _defineProperty({}, vm.gridOptions.columnDefs[1].field, 'desc');
    var filter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : vm.filter || {};
    var params = {
        id: id,
        getOptions: JSON.stringify({
            offset: (vm.currentPage - 1) * vm.gridOptions.paginationPageSize,
            limit: vm.gridOptions.paginationPageSize,
            sorts: sort,
            filters: filter
        })
    };
    vm.loading = true;
    return payrollFactory.callStart(url, params, null, errorMessage, 'get').then(function(response) {
        vm.payrollChecks = response.Result;
        if (vm.payrollChecks) {
            vm.totalCount = vm.payrollChecks.length;
        }
        vm.totalItems = response.Total || 0;
        if (_.get(vm.gridOptions, 'api')) {
            vm.gridOptions.api.setRowData(vm.payrollChecks);
            if (vm.widget.active) {
                uiGridSrv.focusOnFirstCell(vm, vm.payrollChecks);
            }
            uiGridSrv.setFirstData(vm.payrollChecks, vm);
        }
        vm.loading = false;
    }, function(error) {
        vm.loading = false;
    });
}

function callAgain() {
    callStart(vm.widget.components[0].properties.route.url, id, '').then(function() {
        uiGridSrv.focusOnFirstCell(vm, vm.payrollChecks);
    })
};

function saveWidget() {
    vm.item.getWidget(vm.widget);
    scope.updateWidgetFn(vm.widget);
};

vm.item.getWidget = function(widget) {
    vm.item.widget = widget;
    return vm.item;
};

function getList(listData, column) {
    var url = listData.api;
    payrollFactory.getList(url).then(function(response) {
        column.lists = response.Result || [];
        return response.Result || [];
    }, function(error) {

    });
};

function selectRow() {

};

function changed() {

};

function blur(row, column) {
    uiGridSrv.setCurrentRow(vm, row, vm.payrollChecks);
};

function openLog() {

};

function saveRowData() {

};

function save() {

};

function newItem() {

};

function deleteRow() {

};

function cancel() {

};

function edit() {

};

vm.item.setInstance = function() {
    uiGridSrv.setInstance(vm);
};

vm.item.headerRes = function(widget) {
    uiGridSrv.hamburgerFun(widget, vm);
};