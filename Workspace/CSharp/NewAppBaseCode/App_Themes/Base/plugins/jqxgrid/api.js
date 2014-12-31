/*
* Magic Table Plugin
* Copyright (c) 2014 Carlos Dominguez
* Released under the MIT license
*/
var _jqxGrids = {};
$.jqxGridApi = {};

//Default pconfigurations.
$.jqxGridApi.colProperties = [
    "cellsformat",
    "filteritems",
    "columntype",
    "filtertype",
    "pinned",
    "cellsrenderer",
    "align",
    "editable"
];
$.jqxGridApi.defaultOptions = {
    url: 'JqxGridAJAX.aspx?paction=list',
    widgets: {
        jqxListBox: {
            width: '100%',
            height: '500'
        }
    },
    options: {
        width: '100%',
        height: '500',
        theme: 'energyblue'
    },
    source: {
        pagesize: 20
    }
};
    
// Create the grid in the interface
$.jqxGridApi.generateJqxGrid = function (pcurrentGrid) {
    // Prepare the data and configuration
    var source = null;
    var jqxGridOptions = {};
    var pconfiguration = pcurrentGrid["configuration"];
    var fnRenderGridRows = function (params) {
        var data = {};
        for (var i = params.startindex; i < params.endindex; i++) {
            data[i] = pcurrentGrid.localStorage[i];
        }
        return data;
    }

    switch (pconfiguration.source.dataBinding) {
        //Data Binding Large Data Set Mode
        case "Large Data Set":
            source = {
                localdata: pcurrentGrid.localStorage,
                //Data field's type. Possible values: 'string', 'date', 'number', 'float', 'int', 'bool'.
                datafields: pcurrentGrid.datafields,
                datatype: "array"
            };

            jqxGridOptions = {
                showfilterrow: true,
                filterable: true,
                sortable: true,
                autoheight: true
            };
            break;

            //Data Binding Virtual Paging Mode
        case "Virtual Paging":
            source = {
                datatype: "array",
                localdata: {},
                pagesize: pconfiguration.source.pagesize,
                totalrecords: pcurrentGrid.localStorage.length
            };

            jqxGridOptions = {
                virtualmode: true,
                pageable: true,
                pagermode: 'simple',
                rendergridrows: fnRenderGridRows
            };
            break;

            //Data Binding Virtual Scrolling Mode
        case "Virtual Scrolling":
            source = {
                datatype: "array",
                localdata: {},
                totalrecords: pcurrentGrid.localStorage.length
            };

            jqxGridOptions = {
                virtualmode: true,
                rendergridrows: fnRenderGridRows
            };
            break;


        //Data Binding Server Paging Mode
        case "Server Paging":
            source =
            {
                datatype: "json",
                datafields: pcurrentGrid.datafields,
                url: pconfiguration.url,
                type: "POST",
                data: {
                    pjqxGridJson: JSON.stringify(pconfiguration)
                },
                filter: function () {
                    // update the grid and send a request to the server.
                    $(pconfiguration.showTo).jqxGrid('updatebounddata');
                },
                sort: function () {
                    // update the grid and send a request to the server.
                    $(pconfiguration.showTo).jqxGrid('updatebounddata');
                },
                pagesize: pconfiguration.source.pagesize,
                root: 'Rows',
                beforeprocessing: function (data) {
                    //source.totalrecords = data[0].TotalRows;
                    source.totalrecords = 39548;
                    //console.log(data);
                }
            };

            jqxGridOptions = {
                //showfilterrow: true,
                filterable: true,
                sortable: true,
                //groupable: true,
                pageable: true,
                pagermode: 'simple',
                virtualmode: true
            };
            break;

        //Data Binding Server Scrolling Mode
        case "Server Scrolling":
            source =
            {
                datatype: "json",
                datafields: pcurrentGrid.datafields,
                url: pconfiguration.url,
                type: "POST",
                data: {
                    pjqxGridJson: JSON.stringify(pconfiguration)
                },
                filter: function () {
                    // update the grid and send a request to the server.
                    $(pconfiguration.showTo).jqxGrid('updatebounddata');
                },
                sort: function () {
                    // update the grid and send a request to the server.
                    $(pconfiguration.showTo).jqxGrid('updatebounddata');
                },
                root: 'Rows',
                pagesize: pconfiguration.source.pagesize,
                //totalrecords: 50000,
                beforeprocessing: function (data) {
                    //source.totalrecords = data[0].TotalRows;
                    source.totalrecords = 39548;
                }
            };

            jqxGridOptions = {
                //showfilterrow: true,
                filterable: true,
                sortable: true,
                //groupable: true,
                virtualmode: true
            };
            break;

            //Data Binding Normal Mode
        default:
            source = {
                datatype: "json",
                url: pconfiguration.url,
                type: "POST",
                data: {
                    pjqxGridJson: JSON.stringify(pconfiguration)
                },
                //Data field's type. Possible values: 'string', 'date', 'number', 'float', 'int', 'bool'.
                datafields: pcurrentGrid.datafields
            };

            jqxGridOptions = {
                showfilterrow: true,
                filterable: true,
                sortable: true
            };
            break;
    }

    //Create dataAdapter
    var dataAdapter = new $.jqx.dataAdapter(source, {
        loadError: function (xhr, status, error) {
            $.jqxGridApi.showMessage({
                "xhr": xhr,
                "error": error
            });
        }
    });

    //Only for Server Paging or Server Scrolling
    if (pconfiguration.source.dataBinding == "Server Paging" || pconfiguration.source.dataBinding == "Server Scrolling") {
        jqxGridOptions.rendergridrows = function () {
            return dataAdapter.records;
        }
    }

    // Default configuration for all types of jqxGrid
    jqxGridOptions.width = pconfiguration.options.width;
    jqxGridOptions.height = pconfiguration.options.height;
    jqxGridOptions.source = dataAdapter;
    jqxGridOptions.columns = pcurrentGrid.columns;
    jqxGridOptions.theme = pconfiguration.options.theme;
    jqxGridOptions.columnsresize = true;
    //jqxGridOptions.autoshowfiltericon = true;

    //Filter row
    if (pconfiguration.options.showfilterrow) {
        jqxGridOptions.filterable = true;
        jqxGridOptions.showfilterrow = true;
    }
    
    //Auto Row Height
    if (typeof pconfiguration.options.autorowheight != "undefined") {
        jqxGridOptions.autorowheight = pconfiguration.options.autorowheight;
    }

    //Auto Height
    if (typeof pconfiguration.options.autoheight != "undefined") {
        jqxGridOptions.autoheight = pconfiguration.options.autoheight;
    }

    //Selection Mode
    if (pconfiguration.options.selectionmode) {
        jqxGridOptions.selectionmode = pconfiguration.options.selectionmode;
    }

    //Editable
    if (pconfiguration.options.editable) {
        jqxGridOptions.editable = true;
        jqxGridOptions.editmode = 'selectedrow';
    }

    console.log(jqxGridOptions);
    $(pconfiguration.showTo).jqxGrid(jqxGridOptions);

    //Create Hide and Show col Widget
    var idGrid = pcurrentGrid.configuration.showTo;

    if (pconfiguration.widgets.jqxListBox.showTo) {
        var listSource = pcurrentGrid.listSourceColWidget;
        var idJqxListBox = pconfiguration.widgets.jqxListBox.showTo;

        $(idJqxListBox).jqxListBox({
            source: listSource,
            width: pconfiguration.widgets.jqxListBox.width,
            height: pconfiguration.widgets.jqxListBox.height,
            checkboxes: true,
            theme: pconfiguration.options.theme
        });
        $(idJqxListBox).on('checkChange', function (event) {
            $(idGrid).jqxGrid('beginupdate');
            if (event.args.checked) {
                $(idGrid).jqxGrid('showcolumn', event.args.value);
            }
            else {
                $(idGrid).jqxGrid('hidecolumn', event.args.value);
            }
            $(idGrid).jqxGrid('endupdate');
        });

        //Uncheck button configuration
        if (pconfiguration.widgets.jqxListBox.btnUncheckID) {
            var idBtnUncheck = pconfiguration.widgets.jqxListBox.btnUncheckID;
            $(idBtnUncheck).click(pconfiguration.widgets.jqxListBox.btnUncheckClick);
        }
    }

    //Create Context Menu
    if (pconfiguration.widgets.jqxMenu && pconfiguration.widgets.jqxMenu.showTo) {
        pcurrentGrid.contextMenu = $(pconfiguration.widgets.jqxMenu.showTo).jqxMenu({
            width: '100%',
            //height: 60,
            autoOpenPopup: false,
            mode: 'popup',
            theme: pconfiguration.options.theme
        });

        $(idGrid).on('contextmenu', function () {
            return false;
        });

        // handle context menu clicks.
        $(idGrid).on('rowclick', function (event) {
            if (event.args.rightclick) {
                $(idGrid).jqxGrid('selectrow', event.args.rowindex);
                var scrollTop = $(window).scrollTop();
                var scrollLeft = $(window).scrollLeft();
                pcurrentGrid.contextMenu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 5 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
                return false;
            }
        });
        $(pconfiguration.widgets.jqxMenu.showTo).on('itemclick', pconfiguration.widgets.jqxMenu.itemclick);
    }
};

// Validate the configuration or wait for json in virtual mode, then execute generateJqxGrid
$.jqxGridApi.create = function (pconfiguration) {
    var allOk = true;
    var message = "";

    //Hacer un merge con las opciones que nos enviaron y las default.
    _mergeObject($.jqxGridApi.defaultOptions, pconfiguration);

    //Validate pconfiguration
    if (!pconfiguration.sp.Name) {
        allOk = false;
        message += "$.jqxGridApi have a missing parameter: <pre>pconfiguration.sp.Name</pre>";
    }

    if (!pconfiguration.showTo) {
        allOk = false;
        message += "$.jqxGridApi have a missing parameter: <pre>pconfiguration.showTo</pre>";
    }

    //Create pcurrentGrid.datafields and pcurrentGrid.columns
    var tempCol = null;

    //Init default variables
    var _currentGrid = {};
    _currentGrid.datafields = [];
    _currentGrid.columns = [];
    _currentGrid.listSourceColWidget = [];
    _currentGrid.configuration = pconfiguration;
    _jqxGrids[pconfiguration.showTo] = _currentGrid;

    for (var i = 0; i < pconfiguration.columns.length && allOk; i++) {
        //Validate
        if (!pconfiguration.columns[i].name) {
            allOk = false;
            message += "$.jqxGridApi have a missing parameter: <pre>pconfiguration.columns[" + i + "].name</pre>";
        } else {
            if (!pconfiguration.columns[i].type) {
                allOk = false;
                message += "$.jqxGridApi have a missing parameter: <pre>pconfiguration.columns[" + i + "].type</pre>";
            } else {

                //Add data field
                _currentGrid.datafields.push({
                    name: pconfiguration.columns[i].name,
                    type: pconfiguration.columns[i].type
                });

                //Add Column
                tempCol = {};

                //Add Column Properties
                for (var p = 0; p < $.jqxGridApi.colProperties.length; p++) {
                    if (typeof pconfiguration.columns[i][$.jqxGridApi.colProperties[p]] != "undefined") {
                        tempCol[$.jqxGridApi.colProperties[p]] = pconfiguration.columns[i][$.jqxGridApi.colProperties[p]];
                    }
                }
                    
                //Add pcurrentGrid.columns Defaults Properties
                tempCol.text = pconfiguration.columns[i].text ? pconfiguration.columns[i].text : pconfiguration.columns[i].name;
                tempCol.datafield = pconfiguration.columns[i].name;
                tempCol.width = pconfiguration.columns[i].width ? pconfiguration.columns[i].width : '150';
                //tempCol.filtertype = pconfiguration.columns[i].filtertype ? pconfiguration.columns[i].filtertype : 'checkedlist';

                _currentGrid.columns.push(tempCol);

                //Add List Source to hide and show pcurrentGrid.columns
                _currentGrid.listSourceColWidget.push({
                    label: tempCol.text,
                    value: tempCol.datafield,
                    checked: true
                });
            }
        }
    }

    if (allOk) {
        //Validate Virtual Data
        if (pconfiguration.source.dataBinding && (pconfiguration.source.dataBinding == "Large Data Set" || pconfiguration.source.dataBinding == "Virtual Paging" || pconfiguration.source.dataBinding == "Virtual Scrolling")) {
            //Load JSon and wait for it
            $.ajax({
                url: pconfiguration.url,
                data: {
                    pjqxGridJson: JSON.stringify(pconfiguration)
                },
                beforeSend: function () {
                    $.showFullLoading();
                },
                success: function (response) {
                    _currentGrid.localStorage = response;
                    $.jqxGridApi.generateJqxGrid(_currentGrid);
                    $.hideFullLoading();
                },
                error: function (xhr, textStatus, thrownError) {
                    $.jqxGridApi.showMessage({
                        "xhr": xhr,
                        "error": thrownError
                    });
                },
                type: "POST"
            });
        } else {
            $.jqxGridApi.generateJqxGrid(_currentGrid);
        }
    } else {
        $.jqxGridApi.showMessage({
            type: 'error',
            content: message
        });
    }
};

// Show Messages
$.jqxGridApi.showMessage = function(options) {
    var optionsToShowAlert = {};
    var $showTo = "#" + $(".boxContainerArea[main='true']").find(':first-child').attr('id');

    if (options["type"]) {
        optionsToShowAlert.type = options["type"];
    } else {
        optionsToShowAlert.type = 'error';
    }

    if (options["animateScrollTop"]) {
        optionsToShowAlert.animateScrollTop = options["animateScrollTop"];
    }

    if (options["content"]) {
        optionsToShowAlert.content = options["content"];
    } else {
        if (options["xhr"] && options["xhr"]['responseText']) {
            optionsToShowAlert.content = options["xhr"]['responseText'];
        } else {
            if (options["thrownError"]) {
                optionsToShowAlert.content = options["thrownError"];
            }
        }
    }

    //Hide loading
    $.hideFullLoading();

    if (optionsToShowAlert.type == "error") {
        if ((typeof $showTo != 'string') && !$showTo.is(":visible")) {
            $showTo = "#" + $(".boxContainerArea[main='true']").find(':first-child').attr('id');
        }

        //Hide popups to see error message
        $('[name="btnClosePopup"]').click();
    } 

    optionsToShowAlert.showTo = $showTo;

    $.showAlert(optionsToShowAlert);
}