CtrlServiceProvider.moduleService = payrollService;
_.extend(vm, CtrlUtilsSrv);

vm.connector = {
    item: {},
    data: {}
};

vm.keepLoading = true;
vm.item = {};
vm.openSetting = false;
vm.userConfigExists = false;
vm.PayrollPermission = UserSrv.getPermissionForThis();
vm.currentUserId = localStorage.getItem('userId');
vm.switchLeftGrid = false;
vm.switchRightGrid = false;
vm.isGettingDragged = false;
vm.setWidgetPosition = CtrlUtilsSrv.setWidgetPosition = setWidgetPosition;
vm.enableGrid = enableGrid;
vm.showOneHideAll = showOneHideAll;
vm.headerResponsive = headerResponsive;

vm.init = init;
vm.setPayroll = setPayroll;
vm.updateWidget = updateWidget;

vm.templatorOptions = {
    columns: 12,
    pushing: true,
    floating: true,
    sparse: true,
    isMobile: true, // stacks the grid items if true
    mobileBreakPoint: 1024, // if the screen is not wider that this, remove the grid layout and stack the items
    mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
    draggable: {
        enabled: true, // whether dragging items is supported
        handle: 'div.handle', // optional selector for drag handle
        start: function(event, $element, widget) {
            vm.isGettingDragged = true;
            vm.widgetCopy = angular.copy(payrollService.item.module.widgets);
        },
        drag: function(event, $element, widget) {
            var className = event.target.className;
            if (className == 'leftDocker' || event.target.closest('.leftDocker')) {
                vm.switchLeftGrid = true;
            } else if (className == 'rightDocker' || event.target.closest('.rightDocker')) {
                vm.switchRightGrid = true;
            } else {
                vm.switchLeftGrid = false;
                vm.switchRightGrid = false;
            }
            vm.objectPosition = widget.position;
        },
        stop: function(event, $element, widget) {
            if (vm.switchLeftGrid) {
                vm.dragStop = true;
                vm.switchGrid(widget, 'left', widget.id, vm);
            } else if (vm.switchRightGrid) {
                vm.dragStop = true;
                vm.switchGrid(widget, 'right', widget.id, vm);
            } else {
                vm.dragStop = false;
                vm.resetGridPosition(event, $element, widget, vm);
            }
            vm.switchLeftGrid = false;
            vm.switchRightGrid = false;
            vm.isGettingDragged = false;
        }
    },
    resizable: {
        enabled: true,
        handles: ['n', 'e', 's', 'w', 'se', 'sw'],
        start: function(event, $element, widget) {},
        stop: function(event, $element, widget) {
            vm.resetGrid(widget, widget.id, vm);
        }
    }
};

function setWidgetPosition(widget) {
    var selectedWidget = _.find(payrollService.item.module.widgets, function(o) {
        return o.id == widget.id;
    });
    _.forEach(vm.standardItems, function(value) {
        if (value.id == widget.id) {
            value.position = selectedWidget.position;
            value.row = selectedWidget.row;
            value.col = selectedWidget.col;
            value.sizeX = selectedWidget.sizeX;
            value.sizeY = selectedWidget.sizeY;
            value.order = selectedWidget.order;
            if (value.title != 'Lookup' && vm.dragStop) {
                $timeout(function() {
                    vm[value.title].getData(vm.itemData);
                    if (_.get(vm[value.title], 'setInstance')) {
                        vm[value.title].setInstance();
                    }
                }, 100);
            }
        }
    });
};

function init() {
    payrollService.item = {};
    getWidget();
};

function getWidget() {
    var params = {
        UserID: localStorage.getItem('userId'),
        CompanyID: localStorage.getItem('companyId')
    };
    UserSrv.setWidget(params.UserID, params.CompanyID, $state.current.id).then(function() {
        let config = JSON.parse(localStorage.getItem(`config_${$state.current.id}`));
        CtrlUtilsSrv.userConfigExists = vm.userConfigExists = config.userConfigExists;
        getPayrollModule(config.Json);
    });
};

function getPayrollModule(value) {
    vm.modulePermission = UserSrv.getModulePermission(value.id);
    payrollService.item.module = value;
    CtrlUtilsSrv.module = vm.module = value;
    CtrlUtilsSrv.setWidget(payrollService.item.module.widgets);
    CtrlUtilsSrv.setInstance(vm);
    initializeObject(payrollService.item.module.widgets);
    setDirectives(payrollService.item.module);
};

function headerResponsive(widget) {
    _.forEach(payrollService.item.module.widgets, function(value, key) {
        var objectName = value.name;
        if (objectName == widget.title) {
            if (_.get(vm[objectName], 'headerRes')) {
                vm[objectName].headerRes();
            }
        }
    });
}

function initializeObject(widgets) {
    vm.disable = {};
    var leftOrder = 1;
    var rightOrder = 1;
    if (!_.isEmpty(widgets)) {
        _.forEach(widgets, function(value, key) {
            var objectName = value.name;
            if (value.name == '') { // add active grid here
                value.active = true;
            }
            vm[objectName] = CtrlUtilsSrv[objectName] = {};
            if (objectName == 'Lookup') {
                value.order = 0;
                vm.resetGrid(value, value.id, vm)
            } else {
                vm.disable[value.name] = true;
                if (value.position == 'left') {
                    value.order = leftOrder++;
                    value.show = false;
                } else if (value.position == 'right') {
                    value.order = rightOrder++;
                    value.show = false;
                } else {
                    value.show = true;
                }
            }
        });
    }
};

function setDirectives(modules) {
    if (vm.modulePermission) {
        addStandardItem(modules.widgets);
    } else {
        vm.keepLoading = false;
    }
};

function addStandardItem(widgets) {
    vm.standardItems = [];
    vm.leftItems = [];
    vm.rightItems = [];
    vm.gridTags = [];
    _.forEach(widgets, function(value, key) {
        if (value.position == "left" || value.position == "right") {
            value.width = value.sizeX * 125.75;
        }
        if (value.name == 'Lookup') {
            vm.connector.data = value;
            var obj = {
                id: value.id,
                sizeX: value.sizeX,
                sizeY: value.sizeY,
                row: value.row,
                col: value.col,
                type: _.get(value.components[0], 'type') || "keyvalue",
                width: value.width || 'auto',
                order: value.order || 0,
                title: value.name,
                visible: value.visible,
                position: value.position,
                directive: generateDirective(directiveName, value, 'lookup')
            };
            var directiveTagObj = {
                id: obj.id,
                directive: obj.directive
            }
            vm.gridTags.push(directiveTagObj);
            vm.standardItems.push(obj);
        } else {
            var directiveName = "payroll-" + _.kebabCase(value.name);
            vm[value.name][value.name] = value;
            var obj = {
                id: value.id,
                sizeX: value.sizeX,
                sizeY: value.sizeY,
                row: value.row,
                col: value.col,
                width: value.width || 'auto',
                type: _.get(value.components[0], 'type') || "keyvalue",
                order: value.order || 0,
                title: value.name,
                visible: value.visible,
                position: value.position,
                directive: generateDirective(directiveName, value, 'other')
            };
            if (value.name == 'Header') {
                vm.header = [];
                vm.header.push(obj);
            } else {
                var directiveTagObj = {
                    id: obj.id,
                    directive: obj.directive
                }
                vm.gridTags.push(directiveTagObj);
                if (value.visible) {
                    if (value.show) {
                        vm.standardItems.push(obj);
                    } else {
                        if (value.position == 'left') {
                            vm.leftItems.push(obj);
                        }
                        if (value.position == 'right') {
                            vm.rightItems.push(obj);
                        }
                    }
                }
            }
        }
        if (widgets.length == key + 1) {
            $timeout(function() {
                vm.keepLoading = false;
            }, 150, false);
            $timeout(function() {
                vm.gridsterHeight = angular.element("#gridster-height").height() + 96;
            }, 200, false);
        }
    });
};

vm.appendToStandardItem = function(instance, grid) {
    var directiveName = "payroll-" + _.kebabCase(grid.name);
    vm[grid.name][grid.name] = grid;
    var obj = {
        id: grid.id,
        controllerAs: CtrlUtilsSrv.getControllerAsNameDirective(directiveName),
        sizeX: grid.sizeX,
        sizeY: grid.sizeY,
        row: grid.row,
        col: grid.col,
        width: grid.width || 'auto',
        type: _.get(grid.components[0], 'type') || "keyvalue",
        order: grid.order || 0,
        title: grid.name,
        visible: grid.visible,
        position: grid.position,
        directive: generateDirective(directiveName, grid, 'other')
    };
    if (grid.visible) {
        vm.standardItems.push(obj);
        if (grid.position == 'left') {
            var index = _.findIndex(vm.leftItems, function(o) {
                return o.id == grid.id;
            });
            if (index >= 0) {
                vm.leftItems.splice(index, 1);
            }
        }
        if (grid.position == 'right') {
            var index = _.findIndex(vm.rightItems, function(o) {
                return o.id == grid.id;
            });
            if (index >= 0) {
                vm.rightItems.splice(index, 1);
            }
        }
    } else {
        var index = _.findIndex(vm.standardItems, function(o) {
            return o.id == grid.id;
        });
        if (index < 0) {
            if (grid.position == 'left') {
                var index = _.findIndex(vm.leftItems, function(o) {
                    return o.id == grid.id;
                });
                vm.leftItems.splice(index, 1);
            }
            if (grid.position == 'right') {
                var index = _.findIndex(vm.rightItems, function(o) {
                    return o.id == grid.id;
                });
                vm.rightItems.splice(index, 1);
            }
        } else {
            vm.standardItems.splice(index, 1);
        }
        if (_.get(grid.components[0], 'type') == 'table') {
            if (_.get(instance, 'gridOptions')) {
                instance.gridOptions.api.setRowData([]);
            }
        }
    }
    $timeout(function() {
        var objectName = grid.name;
        if (objectName && grid.visible) {
            vm.disable[objectName] = true;
            if (_.get(vm[objectName], 'getSideData')) {
                vm[objectName].getSideData();
            }
        } else {
            vm.disable[objectName] = false;
        }
    }, 300)
}

vm.removeFromStandardItem = function(instance, grid) {
    var index = _.findIndex(vm.standardItems, function(o) {
        return o.id == grid.id;
    });
    if (index > 0) {
        vm.standardItems.splice(index, 1);
        if (_.get(grid.components[0], 'type') == 'table') {
            if (_.get(instance, 'gridOptions')) {
                instance.gridOptions.api.setRowData([]);
            }
        }
    }
}

vm.appendSideGrids = function(item) {
    var grid = _.find(payrollService.item.module.widgets, function(o) {
        return o.id == item.id
    });
    if (grid.visible) {
        var directiveName = "payroll-" + _.kebabCase(grid.name);
        vm[grid.name][grid.name] = grid;
        var obj = {
            id: grid.id,
            controllerAs: CtrlUtilsSrv.getControllerAsNameDirective(directiveName),
            sizeX: grid.sizeX,
            sizeY: grid.sizeY,
            row: grid.row,
            col: grid.col,
            width: grid.width || 'auto',
            type: _.get(grid.components[0], 'type') || "keyvalue",
            order: grid.order || 0,
            title: grid.name,
            show: !item.show,
            visible: grid.visible,
            position: grid.position,
            directive: generateDirective(directiveName, grid, 'other')
        };
        vm.standardItems.push(obj);
        if (grid.position == 'left') {
            var index = _.findIndex(vm.leftItems, function(o) {
                return o.id == grid.id;
            });
            vm.leftItems.splice(index, 1);
        }
        if (grid.position == 'right') {
            var index = _.findIndex(vm.rightItems, function(o) {
                return o.id == grid.id;
            });
            vm.rightItems.splice(index, 1);
        }
    }
    $timeout(function() {
        var objectName = grid.name;
        if (objectName && grid.visible) {
            vm.disable[objectName] = false;
            if (_.get(vm[objectName], 'getSideData')) {
                vm[objectName].getSideData();
            }
        }
    }, 300)
}

function generateDirective(directiveName, value, type) {
    if (type === 'other') {
        return "<" + directiveName + " permission=" + JSON.stringify(vm.PayrollPermission[value.id]) + " item='$pa." + value.name + "' update-widget-fn='$pa.updateWidget(widget)'></" + directiveName + ">";
    } else {
        return "<payroll-lookup lookup='$pa.connector' item='$pa." + value.name + "' set-item-fn='$pa.setPayroll(item)' enable-disable-dock-fn = '$pa.enableDisableDock()' enable-grid-fn='$pa.enableGrid(widget)'></payroll-lookup>";
    }
}

function setPayroll(data) {
    if (vm.connector.getData || vm.connector.getTemplate) {
        vm.itemData = payrollService.item.itemData;
    }
    setItem(payrollService.item.module.widgets);
};

function setTemplate() {
    if (!_.isEmpty(payrollService.item.module.widgets)) {
        _.forEach(payrollService.item.module.widgets, function(value, key) {
            var objectName = value.name;
        });
    }
};

function setItem(widgets) {
    if (!_.isEmpty(widgets)) {
        _.forEach(widgets, function(value, key) {
            var objectName = value.name;
            if (objectName != 'Lookup') {
                vm.disable[objectName] = true;
                if (_.get(vm[objectName], 'getData')) {
                    vm[objectName].getData(vm.itemData);
                }
            }
        });
    }
};

function updateWidget(widget) {
    _.forEach(payrollService.item.module.widgets, function(value, key) {
        var objectName = value.name;
        if (objectName != 'Lookup') {
            if (_.get(vm[objectName], 'getWidget')) {
                vm.widgetData = vm[objectName].widget;
                vm.gridVisibilityChange(vm.widgetData, vm);
            }
        }
    });
    return vm.saveWidget();
};

function enableGrid() {
    _.forEach(payrollService.item.module.widgets, function(value, key) {
        vm.disable[value.name] = true;
    });
}

function disableGrid() {
    _.forEach(payrollService.item.module.widgets, function(value, key) {
        vm.disable[value.name] = false;
    });
}

function showOneHideAll(item) {
    vm.openSetting = false;
    var visible = angular.copy(item);
    var objectName = item.title;
    if (item.show == false) {
        if (_.get(vm[objectName], 'getSideData')) {
            vm[objectName].getSideData();
        }
    }
    var dirInstance = uiGridSrv.getInstance();
    var objectName = item.title;
    if (item.show == false) {
        if (_.get(vm[objectName], 'getSideData')) {
            vm[objectName].getSideData();
        }
    }
    if (_.get(dirInstance, 'saveRowData')) {
        dirInstance.saveRowData()
    }
    _.forEach(vm.standardItems, function(value) {
        if (_.includes(['left', 'right'], value.position)) {
            value.show = false
        }
    });
    if (_.includes(['left', 'right'], item.position)) {
        item.show = !visible.show
    };
    if (item.title == 'Lookup') {
        initiateFocusOnLookup();
    }
}

vm.showLookUp = function() {
    vm.openSetting = false;
    _.forEach(vm.standardItems, function(value) {
        if (_.includes(['left', 'right'], value.position)) {
            value.show = false
        }
    });
    var lookUpGridIndex = _.findIndex(vm.standardItems, function(o) {
        return o.title == 'Lookup';
    });
    if (lookUpGridIndex >= 0) {
        vm.standardItems[lookUpGridIndex].show = true;
    }
    $timeout(function() {
        initiateFocusOnLookup();
    }, 150);
};

vm.closeLookUp = function() {
    _.forEach(vm.standardItems, function(value) {
        if (_.includes(['left', 'right'], value.position)) {
            value.show = false
        }
    });
    var lookUpGridIndex = _.findIndex(vm.standardItems, function(o) {
        return o.title == 'Lookup';
    });
    if (lookUpGridIndex >= 0) {
        vm.standardItems[lookUpGridIndex].show = false;
    }
    $timeout(function() {
        initiateFocusOnLookup();
    }, 150);
};

function initiateFocusOnLookup() {
    _.forEach(payrollService.item.module.widgets, function(value, key) {
        var objectName = value.name;
        if (objectName == 'Lookup') {
            if (value.show == false) {
                if (_.get(vm[objectName], 'initiateFocus')) {
                    vm[objectName].initiateFocus();
                }
            }
        }
    });
};

vm.checkInfoChange = function() {
    var array = ['Header'];
    _.forEach(payrollService.item.module.widgets, function(value, key) {
        var objectName = value.name;
        if (_.includes(array, objectName)) {
            if (_.get(vm[objectName], 'setChange')) {
                vm[objectName].setChange();
            }
        }
    });
};

vm.updateLookup = function() {
    var array = ['Lookup'];
    _.forEach(payrollService.item.module.widgets, function(value, key) {
        var objectName = value.name;
        if (_.includes(array, objectName)) {
            if (_.get(vm[objectName], 'resetData')) {
                return vm[objectName].resetData();
            }
        }
    });
};

vm.createNew = function() {
    var array = ['Header'];
    _.forEach(payrollService.item.module.widgets, function(value, key) {
        var objectName = value.name;
        if (_.includes(array, objectName)) {
            if (_.get(vm[objectName], 'createNew')) {
                return vm[objectName].createNew();
            }
        }
    });
};

vm.movedAway = function(item) {
    vm.responseList = [];
    _.map(DirUtilsSrv.directivePeeker, function(v) {
        if (item.title == v().widget.name) {
            uiGridSrv.setInstance(v());
        }
    })
    CtrlUtilsSrv.directiveInstance = DirUtilsSrv.directivePeeker;
    CtrlUtilsSrv.validateUnsavedGrids().then(function(res) {
        vm.responseList.push(res);
        if (_.includes(vm.responseList, "error")) {
            DirUtilsSrv.errorLogged = true;
        } else {
            DirUtilsSrv.errorLogged = false;
        }
    });
};

vm.callme = function(id) {
    $('#' + id).effect("highlight", {}, 3000);
};