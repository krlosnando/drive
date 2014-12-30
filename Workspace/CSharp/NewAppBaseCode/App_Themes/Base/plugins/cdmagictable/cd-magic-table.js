/*
* Magic Table Plugin
* Copyright (c) 2014 Carlos Dominguez
* Released under the MIT license
*/

//Implement the Array.insert method by doing this:
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

var MAGIC_TABLES_DATA = [];
var MAGIC_TABLES_EVENTS = {};
var MAGIC_TABLE_INDEX = 0;

$.cdCreateMagicTable = function (option) {
    //Default Options.
    var defaultOptions = {
        sourceBaseUrl: "CDMagicTableAJAX.aspx",
        actionList: "getHTMLTable",
        actionInsert: "getObjJsonNewRow",
        actionDelete: "deleteRow",
        actionSave: "saveRow",
        actionCallProcedure: "callProcedure",
        actionGetTableEmployees: "getHTMLTableSOEID",
        config: {
            magicTableIndex: MAGIC_TABLE_INDEX,
            height: "600px",
            hasCustomWidth: false,
            showTo: "#" + $(".boxContainerArea[main='true']").find(':first-child').attr('id')
        }
    };

    //En algunos browser no existe Object.keys
    if (!Object.keys) {
        Object.keys = function (obj) {
            var keys = [];

            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    keys.push(i);
                }
            }

            return keys;
        };
    }

    //Hacer un merge con las opciones que nos enviaron y las default.
    var defaultKeys = Object.keys(defaultOptions);
    $(defaultKeys).each(function (index, value) {
        if (typeof defaultOptions[value] == 'object') {
            var dafaultKeysValue = Object.keys(defaultOptions[value]);

            $(dafaultKeysValue).each(function (iV, propertyValue) {
                if (option[value]) {
                    if (typeof option[value][propertyValue] == "undefined") {
                        //Si no tiene algun valor lo asignamos y salimos.
                        option[value][propertyValue] = defaultOptions[value][propertyValue];
                    }
                } else {
                    //Si no tiene algun valor lo asignamos y salimos.
                    option[value] = defaultOptions[value];

                    return false;
                }
            });
        } else {
            if (typeof option[value] == "undefined") {
                //Si no tiene algun valor lo asignamos y salimos.
                option[value] = defaultOptions[value];
            }
        }
    });

    //Validate data
    var allOk = true;
    var message = "";
    var existIDRow = false;
    var colsDBToSelectNames = {};

    //Add columns to select from database
    option.colsDBToSelect = [];

    if (!option.config.idRowColDbToBind) {
        allOk = false;
        message += "cdCreateMagicTable plugin have a missing parameter: <pre>config.idRowColDbToBind</pre>";
    }

    //ID Table is required
    if (!option.config.idTable) {
        allOk = false;
        message += "cdCreateMagicTable plugin have a missing parameter: <pre>config.idTable</pre>";
    }

    //actios is required
    if (!option.config.actions) {
        allOk = false;
        message += "cdCreateMagicTable plugin have a missing parameter: <pre>config.actions</pre>";
    } else {
        //Check List, insert, edit and delete sp params
        var existSPToList = false;

        $(Object.keys(option.config.actions)).each(function (index, actionName) {
            var actionKey = actionName;
            var actionData = option.config.actions[actionName];

            //Validate actions name
            if (actionKey != "List" && actionKey != "Insert" && actionKey != "Edit" && actionKey != "Delete" && actionKey != "Expand") {
                allOk = false;
                message += "cdCreateMagicTable plugin have a wrong attribute name in actions, valid names List, Insert, Edit, Delete, Expand: <pre>option.config.actions['" + actionKey + "']</pre>";
            }

            //Procedure to list data is required
            if (actionKey == "List" && actionData.spDBToListName) {
                existSPToList = true;
            }

            //Check sp params
            $(actionData["spDBTo" + actionKey + "Params"]).each(function (indexParam, dataParam) {
                if (!dataParam["Value"] && dataParam["Value"] !== "" && dataParam["Value"] !== false) {
                    allOk = false;
                    message += "cdCreateMagicTable plugin have a missing 'Value'parameter: <pre>option.config.actions." + actionKey + ".spDBTo" + actionKey + "Params, JSON: " + JSON.stringify(dataParam) + "</pre>";
                }
                if (!dataParam["Name"]) {
                    allOk = false;
                    message += "cdCreateMagicTable plugin have a missing 'Name' parameter: <pre>option.config.actions." + actionKey + ".spDBTo" + actionKey + "Params, JSON: " + JSON.stringify(dataParam) + "</pre>";
                }
            });
        });

        //Procedure to list data is required
        if (!existSPToList) {
            allOk = false;
            message += "cdCreateMagicTable plugin have a missing parameter: <pre>config.actions.List.spDBToListName</pre>";
        }
    }

    //Check config.titleOnDelete when "option.config.actions.Delete" is defined
    if (option.config.actions.Delete) {
        if (!option.config.titleOnDelete) {
            allOk = false;
            message += "cdCreateMagicTable plugin have a missing parameter: <pre>config.titleOnDelete</pre>";
        }
    }

    //Important to access to attr and col values
    if (!option.config.idRowToGetAttrs) {
        allOk = false;
        message += "cdCreateMagicTable plugin have a missing parameter: <pre>config.idRowToGetAttrs</pre>";
    }

    //ID to access to Attributes
    if (!option.config.idRowToGetAttrs) {
        allOk = false;
        message += "cdCreateMagicTable plugin have a missing parameter: <pre>config.idRowToGetAttrs</pre>";
    }

    //By default add to the table the class "full-width" = width: 100%
    if (option.config.addFullWidthClass == undefined) {
        option.config.addFullWidthClass == true;
    }

    //By default add the width of 80px to Edit, Save, and Expand icons
    if (!option.config["configColWidth"]) {
        option.config["configColWidth"] = "80px";
    }

    //Set default color row of childs
    if (option.config.hasChilds) {
        if (!option.config.childRowColor) {
            option.config.childRowColor = "#E0EBFF";
        }
    }

    //Validate Attr 
    $(option.attrs).each(function (index, dataAttr) {

        //Validate id
        if (!dataAttr.id) {
            allOk = false;
            message += "cdCreateMagicTable plugin have a missing parameter 'id' in : <pre>option.attrs</pre>";
        }

        //Validate colDbToBind
        if (!dataAttr.colDbToBind && !dataAttr.value) {
            allOk = false;
            message += "cdCreateMagicTable plugin have a missing parameter 'colDbToBind' or 'value' in : <pre>option.attrs</pre>";
        } else {

            //Add to colsDBToSelect
            if (dataAttr.colDbToBind) {
                if (!colsDBToSelectNames[dataAttr.colDbToBind]) {
                    option.colsDBToSelect.push({ Name: dataAttr.colDbToBind });
                    colsDBToSelectNames[dataAttr.colDbToBind] = true;
                }
            }

        }

        if (!existIDRow && dataAttr.id == "attrRowID") {
            existIDRow = true;
        }
    });

    //Al table must have IDRow Attribute
    if (!existIDRow) {
        allOk = false;
        message += "cdCreateMagicTable plugin have a missing parameter 'attrRowID' in : <pre>option.attrs.attrRowID</pre>";
    }

    var optionsColsToSend = JSON.parse(JSON.stringify(option.cols));
    //Add default values for cols
    $(optionsColsToSend).each(function (index, dataCol) {
        if (!dataCol["id"]) {
            allOk = false;
            message += "cdCreateMagicTable plugin have a missing parameter 'id' in: <pre>option.cols</pre>";
        }

        //This information isn't necesary for the server
        if (dataCol.linkedTable) {
            delete dataCol["linkedTable"];
        }

        if (dataCol["canFilter"]) {
            option.config.hasFilter = true;
        } else {
            option.cols[index]["canFilter"] = false;
            optionsColsToSend[index]["canFilter"] = false;
        }

        if (!dataCol["hideCol"]) {
            option.cols[index]["hideCol"] = false;
            optionsColsToSend[index]["hideCol"] = false;
        }

        /*if (!dataCol["colWidth"]) {
        option.cols[index]["colWidth"] = "140px";
        optionsColsToSend[index]["colWidth"] = "140px";
        }
        if (dataCol["colWidth"]) {
        option.config.hasCustomWidth = true;
        }*/

        if (!dataCol["colTextAlign"]) {
            option.cols[index]["colTextAlign"] = "left";
            optionsColsToSend[index]["colTextAlign"] = "left";
        }

        if (!dataCol["colHeaderTitle"]) {
            if (dataCol["colDbToBind"]) {
                option.cols[index]["colHeaderTitle"] = dataCol["colDbToBind"];
                optionsColsToSend.cols[index]["colHeaderTitle"] = dataCol["colDbToBind"];
            } else {
                allOk = false;
                message += "cdCreateMagicTable plugin have a missing parameter 'colHeaderTitle' in: <pre>option.cols</pre>";
            }
        }

        if ((dataCol["colValue"] !== "") && !dataCol["colDbToBind"] && !dataCol["colValue"]) {
            allOk = false;
            message += "cdCreateMagicTable plugin have a missing parameter 'colDbToBind' or 'colValue' in " + ((dataCol["id"]) ? "col id:" + dataCol["id"] : "") + ": <pre>option.cols</pre>";
        }

        if (dataCol["colDbToBind"]) {
            //Add to colsDBToSelect
            if (!colsDBToSelectNames[dataCol["colDbToBind"]]) {
                option.colsDBToSelect.push({ Name: dataCol["colDbToBind"] });
                colsDBToSelectNames[dataCol["colDbToBind"]] = true;
            }
        }
    });

    //Save magic table configuration
    var copyOptions = JSON.parse(JSON.stringify(option));

    //Add Events because JSON.stringify doesn't work with functions
    magicTableReviveFunctions(option, copyOptions);
    MAGIC_TABLES_DATA.insert(MAGIC_TABLE_INDEX, copyOptions);

    MAGIC_TABLE_INDEX++;

    if (allOk) {
        //Call to get list of data
        $.ajax({
            url: option.sourceBaseUrl,
            data: {
                paction: option.actionList,
                config: option.config,
                attrs: option.attrs,
                cols: JSON.stringify(optionsColsToSend),
                colsDBToSelect: option.colsDBToSelect,
                tableIndex: MAGIC_TABLE_INDEX
            },
            beforeSend: function () {
                $.showFullLoading(option.config.idTable);
            },
            success: function (response) {
                var CURRENT_MAGIC_TABLE = MAGIC_TABLES_DATA[option.config.magicTableIndex];
                CURRENT_MAGIC_TABLE.LastEventsAction = "";
                //Sometimes showTo have format like "AfterRow:#attrs-reports-{{attrRowID}}"
                var dataSplit = CURRENT_MAGIC_TABLE.config.showTo.split(":");
                var showTo = "";
                var afterRowId = "";

                if (dataSplit.length == 1) {
                    showTo = dataSplit[0];
                } else {
                    showTo = dataSplit[0];
                    afterRowId = dataSplit[1];
                }

                switch (showTo) {

                    case "DefaultPopup":
                        magicTableCreatePopup(CURRENT_MAGIC_TABLE.config.idTable, "Information", response);
                        break;

                    case "AfterRow":
                        $(afterRowId).after("<tr id='" + afterRowId.replace("#", "") + "-children'><td colspan='" + ($(afterRowId).find('td').length) + "' style='padding-left: 35px;'>" + response + "</td></tr>");
                        break;

                    case "BottomTable":

                        break;

                    default:
                        $(CURRENT_MAGIC_TABLE.config.showTo).hide();
                        $(CURRENT_MAGIC_TABLE.config.showTo).html(response);
                        $(CURRENT_MAGIC_TABLE.config.showTo).show();
                        break;
                }

                //Get current magic table in jquery object
                var $magicTable = $("#" + CURRENT_MAGIC_TABLE.config.idTable);

                //If need Grid View Scroll
                if (CURRENT_MAGIC_TABLE.config.isGridViewScroll) {
                    $magicTable.gridviewScroll({
                        width: option.config.width,
                        height: option.config.height
                    });
                }

                //Add selected class event
                $magicTable.find("tr").click(function () {
                    $magicTable.find(".selected").removeClass("selected");
                    $(this).addClass("selected");
                });

                //Add click event to Delete button
                //--------------------------------------------------------
                if (CURRENT_MAGIC_TABLE.config.actions.Delete) {
                    CURRENT_MAGIC_TABLE.onClickDeleteBtn = function (e, btnEvent) {
                        e.preventDefault();

                        var $btnDelete = $(btnEvent);
                        var idRowToGetAttrs = $btnDelete.attr("idRow");
                        var $row = $("#" + idRowToGetAttrs);
                        var titleOnDelete = magicTableReplaceDynamicValues(CURRENT_MAGIC_TABLE, $row, CURRENT_MAGIC_TABLE.config.titleOnDelete);

                        showJSConfirmModal("Are you sure to delete this row " + ((titleOnDelete) ? "[" + titleOnDelete + "]" : "") + "?", function () {
                            //Create a copy of the deleted params bacause we don't need update the original values
                            var spDBToDeleteParams = JSON.parse(JSON.stringify(CURRENT_MAGIC_TABLE.config.actions.Delete.spDBToDeleteParams));

                            //Replace attrs and cols values in params
                            $(spDBToDeleteParams).each(function (indexParam, dataParam) {
                                dataParam["Value"] = magicTableReplaceDynamicValues(CURRENT_MAGIC_TABLE, $row, dataParam["Value"]);
                            });

                            //Delete row in the database
                            $.ajax({
                                url: CURRENT_MAGIC_TABLE.sourceBaseUrl,
                                data: {
                                    paction: CURRENT_MAGIC_TABLE.actionDelete,
                                    spDBToDeleteName: CURRENT_MAGIC_TABLE.config.actions.Delete.spDBToDeleteName,
                                    spDBToDeleteParams: spDBToDeleteParams
                                },
                                beforeSend: function () {
                                    $.showFullLoading(CURRENT_MAGIC_TABLE.config.idTable);
                                },
                                success: function (response) {
                                    if (CURRENT_MAGIC_TABLE.config.actions.Expand) {
                                        $("#" + $row.attr("id") + "-children").remove();
                                    }
                                    $row.remove();
                                    magicTableShowMessage({
                                        type: 'success',
                                        magicTable: CURRENT_MAGIC_TABLE,
                                        content: response,
                                        animateScrollTop: false
                                    });

                                    $.hideFullLoading(CURRENT_MAGIC_TABLE.config.idTable);
                                },
                                error: function (xhr, textStatus, thrownError) {
                                    magicTableShowMessage({
                                        "xhr": xhr,
                                        "error": thrownError,
                                        "magicTable": CURRENT_MAGIC_TABLE
                                    });
                                },
                                type: "POST"
                            });
                        });
                    }

                    $("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-delete").click(function (e) {
                        CURRENT_MAGIC_TABLE.onClickDeleteBtn(e, this);

                        CURRENT_MAGIC_TABLE.LastEventsAction += ",Delete";
                    });
                }

                //Add click event to Save button
                //--------------------------------------------------------
                if (CURRENT_MAGIC_TABLE.config.actions.Edit) {

                    //Save Button
                    CURRENT_MAGIC_TABLE.onClickSaveBtn = function (e, btnEvent) {
                        e.preventDefault();

                        var $btnSave = $(btnEvent);
                        var idRowToGetAttrs = $btnSave.attr("idRow");
                        var $row = $("#" + idRowToGetAttrs);

                        var $btnReturn = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-return");
                        var $btnDelete = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-delete");
                        var $btnEdit = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-edit");

                        if ($row.attr("isEditing") == "1") {
                            var cols = CURRENT_MAGIC_TABLE.cols;
                            $(cols).each(function (indexCol, dataCol) {
                                var $col = $("#" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["id"]);

                                if (dataCol["canEdit"]) {

                                    switch (dataCol["typeEditField"]) {

                                        case "checkbox":
                                            $col.html($col.attr("colValue"));
                                            break;

                                        case "text":
                                            $col.html($col.attr("colValue"));
                                            break;

                                        case "selectSOEID":
                                            $col.html($col.attr("colValue"));
                                            break;
                                    }
                                }
                            });

                            //Gather data of row to save
                            //Create a copy of the edit params bacause we don't need update the original values
                            var spDBToEditParams = JSON.parse(JSON.stringify(CURRENT_MAGIC_TABLE.config.actions.Edit.spDBToEditParams));

                            //Replace attrs and cols values in params
                            $(spDBToEditParams).each(function (indexParam, dataParam) {
                                dataParam["Value"] = magicTableReplaceDynamicValues(CURRENT_MAGIC_TABLE, $row, dataParam["Value"]);
                            });

                            //Save information row in the database
                            $.ajax({
                                url: CURRENT_MAGIC_TABLE.sourceBaseUrl,
                                data: {
                                    paction: CURRENT_MAGIC_TABLE.actionSave,
                                    spDBToEditName: CURRENT_MAGIC_TABLE.config.actions.Edit.spDBToEditName,
                                    spDBToEditParams: spDBToEditParams
                                },
                                beforeSend: function () {
                                    $.showFullLoading(CURRENT_MAGIC_TABLE.config.idTable);
                                },
                                success: function (response) {
                                    magicTableShowMessage({
                                        type: 'success',
                                        magicTable: CURRENT_MAGIC_TABLE,
                                        content: response,
                                        animateScrollTop: false
                                    });

                                    $row.attr("isEditing", "0");

                                    $btnEdit.show();
                                    $btnDelete.show();
                                    $btnReturn.hide();
                                    $btnSave.hide();

                                    $.hideFullLoading(CURRENT_MAGIC_TABLE.config.idTable);
                                },
                                error: function (xhr, textStatus, thrownError) {
                                    //If error ocurred and was inserting a new row delete it
                                    if (CURRENT_MAGIC_TABLE.config.deleteRowOnError && CURRENT_MAGIC_TABLE.LastEventsAction.indexOf("Insert") > -1) {
                                        $row.remove();
                                        CURRENT_MAGIC_TABLE.LastEventsAction = "";
                                    } else {
                                        //Return to old values
                                        $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-return").click();
                                    }
                                    magicTableShowMessage({
                                        "xhr": xhr,
                                        "error": thrownError,
                                        "magicTable": CURRENT_MAGIC_TABLE
                                    });
                                },
                                type: "POST"
                            });
                        }
                    }

                    $("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-save").click(function (e) {
                        CURRENT_MAGIC_TABLE.onClickSaveBtn(e, this);

                        CURRENT_MAGIC_TABLE.LastEventsAction += ",Save";
                    });
                }

                //Add click event to Edit button
                //--------------------------------------------------------
                if (CURRENT_MAGIC_TABLE.config.actions.Edit) {

                    //Edit fields in the same row
                    CURRENT_MAGIC_TABLE.editFieldsInRow = function (e, btnEvent) {
                        e.preventDefault();

                        var $btnEdit = $(btnEvent);
                        var idRowToGetAttrs = $btnEdit.attr("idRow");
                        var $row = $("#" + idRowToGetAttrs);
                        var $btnReturn = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-return");
                        var $btnDelete = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-delete");
                        var $btnSave = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-save");

                        if (!$row.attr("isEditing") || $row.attr("isEditing") == "0") {
                            var cols = CURRENT_MAGIC_TABLE.cols;

                            $(cols).each(function (indexCol, dataCol) {
                                var $col = $("#" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["id"]);
                                var colValue = $col.attr("colValue");
                                var fieldId = $row.attr("id") + "-" + dataCol["id"] + "-edit";

                                if (dataCol["canEdit"]) {

                                    switch (dataCol["typeEditField"]) {

                                        case "checkbox":
                                            var valCol = $col.attr("colValue");
                                            var idInput = $col.attr("id") + "-colValue";

                                            var htmlInputCheckbox = "<input type='checkbox' id='" + idInput + "' idCol='" + $col.attr("id") + "' value='" + valCol + "'>";
                                            $col.html(htmlInputCheckbox);

                                            //Save old value
                                            $col.attr("colValueOld", valCol);

                                            //Get created input checkbox
                                            var $inputCheck = $col.find("#" + idInput);

                                            //Set default value
                                            if (valCol == "False" || valCol == "0") {
                                                $inputCheck.prop("checked", false);
                                            } else {
                                                $inputCheck.prop("checked", true);
                                            }

                                            //Bind with colValue attr in Col
                                            $inputCheck.change(function () {
                                                var $el = $(this);
                                                var v = $el.is(':checked') ? "True" : "False";
                                                var idCol = $el.attr("idCol");
                                                $("#" + idCol).attr("colValue", v);
                                            });
                                            break;

                                        case "text":
                                            var valCol = $col.attr("colValue");
                                            var idInput = $col.attr("id") + "-colValue";
                                            var htmlInput = "<input type='text' id='" + idInput + "' idCol='" + $col.attr("id") + "' value='" + valCol + "'>";
                                            $col.html(htmlInput);

                                            //Save old value
                                            $col.attr("colValueOld", valCol);

                                            //Bind with colValue attr in Col
                                            $col.find("#" + idInput).keyup(function () {
                                                var $el = $(this);
                                                var v = $el.val();
                                                var idCol = $el.attr("idCol");
                                                $("#" + idCol).attr("colValue", v);
                                            });
                                            break;

                                        case "selectSOEID":
                                            var valCol = $col.attr("colValue");
                                            var idColToSetEmployeeName = dataCol["idColToSetEmployeeName"] ? " idElToSetName='" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["idColToSetEmployeeName"] + "' " : "";
                                            var idColToSetEmployeeWorkPhone = dataCol["idColToSetEmployeeWorkPhone"] ? " idElToSetWorkPhone='" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["idColToSetEmployeeWorkPhone"] + "' " : "";
                                            var idColToSetEmployeeAlternatePhone = dataCol["idColToSetEmployeeAlternatePhone"] ? " idElToSetAlternatePhone='" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["idColToSetEmployeeAlternatePhone"] + "' " : "";
                                            var idColToSetEmployeeEmail = dataCol["idColToSetEmployeeEmail"] ? " idElToSetEmail='" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["idColToSetEmployeeEmail"] + "' " : "";
                                            var idColToSetEmployeeCenter = dataCol["idColToSetEmployeeCenter"] ? " idElToSetCenter='" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["idColToSetEmployeeCenter"] + "' " : "";
                                            var text = colValue ? colValue : "Click to select";
                                            fieldHtml = "<a id='" + fieldId + "' href='#' " + idColToSetEmployeeName + idColToSetEmployeeWorkPhone + idColToSetEmployeeAlternatePhone + idColToSetEmployeeEmail + idColToSetEmployeeCenter + " idElementWithColValue='" + fieldId + "'>" + text + "</a>";

                                            $col.html(fieldHtml);

                                            //Save old value
                                            $col.attr("colValueOld", valCol);

                                            //Bind element to show popup to select a soeid
                                            $(document).on('click', '#' + fieldId, function (e) {
                                                e.preventDefault();

                                                var $el = $(this);

                                                magicTableCreatePopupToSelectEmployee({
                                                    userSOEID: CURRENT_MAGIC_TABLE.config.userSOEID,
                                                    idRow: $row.attr("attrRowID"),
                                                    idCol: dataCol["id"],
                                                    showInPopup: true,
                                                    onSelected: function (objEmployee, paramsOnSelected) {
                                                        $col.attr("colValue", objEmployee.colSOEID);
                                                        $el.attr("soeidSelected", objEmployee.colSOEID);
                                                        $el.text("[" + objEmployee.colSOEID + "]");
                                                        //$el.text("[" + objEmployee.colSOEID + "] - " + objEmployee.colNAME);

                                                        //Set Name to another column
                                                        if ($el.attr("idElToSetName")) {
                                                            var $elToSetName = $("#" + $el.attr("idElToSetName"));
                                                            $elToSetName.attr("colValueOld", $elToSetName.attr("colValue"));
                                                            $elToSetName.attr("colValue", objEmployee.colName);
                                                            $elToSetName.text(objEmployee.colName);
                                                        }

                                                        //Set WorkPhone to another column
                                                        if ($el.attr("idElToSetWorkPhone")) {
                                                            var $elToSetWorkPhone = $("#" + $el.attr("idElToSetWorkPhone"));
                                                            $elToSetWorkPhone.attr("colValueOld", $elToSetWorkPhone.attr("colValue"));
                                                            $elToSetWorkPhone.attr("colValue", objEmployee.attrWorkPhone);
                                                            $elToSetWorkPhone.text(objEmployee.attrWorkPhone);
                                                        }

                                                        //Set AlternatePhone to another column
                                                        if ($el.attr("idElToSetAlternatePhone")) {
                                                            var $elToSetAlternatePhone = $("#" + $el.attr("idElToSetAlternatePhone"));
                                                            $elToSetAlternatePhone.attr("colValueOld", $elToSetAlternatePhone.attr("colValue"));
                                                            $elToSetAlternatePhone.attr("colValue", objEmployee.attrAlternatePhone);
                                                            $elToSetAlternatePhone.text(objEmployee.attrAlternatePhone);
                                                        }

                                                        //Set Email to another column
                                                        if ($el.attr("idElToSetEmail")) {
                                                            var $elToSetEmail = $("#" + $el.attr("idElToSetEmail"));
                                                            $elToSetEmail.attr("colValueOld", $elToSetEmail.attr("colValue"));
                                                            $elToSetEmail.attr("colValue", objEmployee.colEmail);
                                                            $elToSetEmail.text(objEmployee.colEmail);
                                                        }

                                                        //Set Center to another column
                                                        if ($el.attr("idElToSetCenter")) {
                                                            var $elToSetCenter = $("#" + $el.attr("idElToSetCenter"));
                                                            $elToSetCenter.attr("colValueOld", $elToSetCenter.attr("colValue"));
                                                            $elToSetCenter.attr("colValue", objEmployee.attrCenter);
                                                            $elToSetCenter.text(objEmployee.attrCenter);
                                                        }

                                                        //Automatic save row information
                                                        if (CURRENT_MAGIC_TABLE.config.autoShowSave) {
                                                            $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-save").click();
                                                        }
                                                    }
                                                });
                                            });

                                            //Bind with colValue attr
                                            $(document).on('change', '#' + fieldId, function () {
                                                var $el = $(this);
                                                var v = $el.attr("soeidSelected");
                                                var idElement = $el.attr("idElementWithColValue");
                                                $("#" + idElement).attr("colValue", v);
                                            });
                                            break;

                                    }
                                }
                            });

                            $row.attr("isEditing", "1");

                            $btnEdit.hide();
                            $btnDelete.hide();
                            $btnReturn.show();
                            $btnSave.show();
                        }
                    }

                    //Edit fields in popup
                    CURRENT_MAGIC_TABLE.editFieldsInPopup = function (e, btnEvent) {
                        e.preventDefault();

                        var $btnEdit = $(btnEvent);
                        var idRowToGetAttrs = $btnEdit.attr("idRow");
                        var $row = $("#" + idRowToGetAttrs);

                        if (!$row.attr("isEditing") || $row.attr("isEditing") == "0") {
                            var cols = CURRENT_MAGIC_TABLE.cols;
                            var htmlFormEdit = "";
                            var idEditForm = $row.attr("attrRowID") + "-edit-form";
                            var fieldClass = "field";
                            htmlFormEdit += "<table id='" + idEditForm + "' class='table-full-width'>";

                            var formColumns = 2;
                            var counterFormColumns = 0;
                            var actualGroupName = "";
                            var LastGroupName = "";

                            var totalCols = cols.length;
                            $(cols).each(function (indexCol, dataCol) {
                                var $col = $("#" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["id"]);
                                var colHeader = dataCol["colHeaderTitle"];
                                var colValue = $col.attr("colValue");
                                var fieldId = $row.attr("id") + "-" + dataCol["id"] + "-edit";
                                var fieldHtml = "";

                                actualGroupName = dataCol["group"] ? dataCol["group"] : "Information";

                                //First iteration
                                if (indexCol == 0) {
                                    htmlFormEdit += "<tr><td>";
                                    htmlFormEdit += "<div class='magic-table-form-group-title'>" + actualGroupName + "</div>";
                                    htmlFormEdit += "<table><tr>";

                                }

                                //Middle iteration
                                if (indexCol > 0 && indexCol < totalCols - 1) {
                                    if (actualGroupName != LastGroupName) {

                                        //If don't complete two columns
                                        if (counterFormColumns == 1) {
                                            htmlFormEdit += "<td class='W20 magic-table-form-label'></td>";
                                            htmlFormEdit += "<td class='W30 magic-table-form-item'></td>";
                                        }

                                        htmlFormEdit += "</tr></table>";
                                        htmlFormEdit += "</td></tr>";
                                        htmlFormEdit += "<tr><td>";
                                        htmlFormEdit += "<div class='magic-table-form-group-title'>" + actualGroupName + "</div>";
                                        htmlFormEdit += "<table>";

                                        //Reset counter because we close the "tr"
                                        counterFormColumns = 0;
                                    }

                                    if (counterFormColumns == 0) {
                                        htmlFormEdit += "<tr>";
                                    } else {
                                        if (counterFormColumns == 2) {
                                            htmlFormEdit += "</tr><tr>";
                                            counterFormColumns = 0;
                                        }
                                    }
                                }


                                if (dataCol["canEdit"]) {

                                    switch (dataCol["typeEditField"]) {

                                        case "checkbox":
                                            //Set default value
                                            var propChecked = "";

                                            if (colValue == "True" || colValue == "1" || colValue == "x") {
                                                propChecked = "checked='true'";
                                                colValue = "True";
                                            } else {
                                                colValue = "False";
                                            }

                                            fieldHtml = "<input type='checkbox' id='" + fieldId + "' idElementWithColValue='" + fieldId + "-td' " + propChecked + ">";
                                            htmlFormEdit += "<td class='W20 magic-table-form-label'>" + colHeader + "</td>";
                                            htmlFormEdit += "<td class='W30 magic-table-form-item " + fieldClass + "' id='" + fieldId + "-td' idCol='" + dataCol["id"] + "' colValue='" + colValue + "' >" + fieldHtml + "</td>";
                                            counterFormColumns++;

                                            //Bind with colValue attr
                                            $(document).on('change', '#' + fieldId, function () {
                                                var $el = $(this);
                                                var v = $el.is(':checked') ? "True" : "False";
                                                var idElement = $el.attr("idElementWithColValue");
                                                $("#" + idElement).attr("colValue", v);
                                            });
                                            break;

                                        case "text":
                                            var htmlInput = "<input type='text' id='" + fieldId + "' idElementWithColValue='" + fieldId + "-td' value='" + colValue + "'>";
                                            htmlFormEdit += "<td class='W20 magic-table-form-label'>" + colHeader + "</td>";
                                            htmlFormEdit += "<td class='W30 magic-table-form-item " + fieldClass + "' id='" + fieldId + "-td' idCol='" + dataCol["id"] + "' colValue='" + colValue + "'>" + htmlInput + "</td>";
                                            counterFormColumns++;

                                            //Bind with colValue attr
                                            $(document).on('keyup', '#' + fieldId, function () {
                                                var $el = $(this);
                                                var v = $el.val();
                                                var idElement = $el.attr("idElementWithColValue");
                                                $("#" + idElement).attr("colValue", v);
                                            });
                                            break;

                                        case "select":
                                            fieldHtml = "<select id='" + fieldId + "' idElementWithColValue='" + fieldId + "-td'><option value='0'>-- Select --</option>";

                                            //Loading default data if it was set
                                            if (dataCol["onEditDataSource"] && dataCol["onEditDataSource"]["defaultValues"]) {
                                                var defaultValues = dataCol["onEditDataSource"]["defaultValues"];
                                                $(defaultValues).each(function (index, data) {
                                                    fieldHtml += "<option value='" + data["Value"] + "' " + (data["Value"] == colValue ? "selected='true'" : "") + ">" + data["Text"] + "</option>";
                                                });
                                            } else {
                                                magicTableRefreshSelectEditDataSource({
                                                    "CURRENT_MAGIC_TABLE": CURRENT_MAGIC_TABLE,
                                                    "$row": $row,
                                                    "dataCol": dataCol,
                                                    "sourceBaseUrl": option.sourceBaseUrl,
                                                    "actionCallProcedure": option.actionCallProcedure,
                                                    "colValue": colValue,
                                                    "fieldId": fieldId,
                                                    "refreshWithFormData": false,
                                                    "idFormEdit": idEditForm,
                                                    "fieldClass": fieldClass
                                                });
                                            }

                                            fieldHtml += "</select>";

                                            htmlFormEdit += "<td class='W20 magic-table-form-label'>" + colHeader + "</td>";
                                            htmlFormEdit += "<td class='W30 magic-table-form-item " + fieldClass + "' id='" + fieldId + "-td' idCol='" + dataCol["id"] + "' colValue='" + colValue + "'>" + fieldHtml + "</td>";
                                            counterFormColumns++;

                                            //Bind with colValue attr
                                            $(document).on('change', '#' + fieldId, function () {
                                                var $el = $(this);
                                                var v = $el.val();
                                                var idElement = $el.attr("idElementWithColValue");
                                                $("#" + idElement).attr("colValue", v);
                                            });
                                            break;

                                        case "selectSOEID":
                                            var idColToSetEmployeeName = dataCol["idColToSetEmployeeName"] ? " idElToSetName='" + $row.attr("id") + "-" + dataCol["idColToSetEmployeeName"] + "-edit-td" + "' " : "";
                                            var idColToSetEmployeeWorkPhone = dataCol["idColToSetEmployeeWorkPhone"] ? " idElToSetWorkPhone='" + $row.attr("id") + "-" + dataCol["idColToSetEmployeeWorkPhone"] + "-edit-td" + "' " : "";
                                            var idColToSetEmployeeAlternatePhone = dataCol["idColToSetEmployeeAlternatePhone"] ? " idElToSetAlternatePhone='" + $row.attr("id") + "-" + dataCol["idColToSetEmployeeAlternatePhone"] + "-edit-td" + "' " : "";
                                            var idColToSetEmployeeEmail = dataCol["idColToSetEmployeeEmail"] ? " idElToSetEmail='" + $row.attr("id") + "-" + dataCol["idColToSetEmployeeEmail"] + "-edit-td" + "' " : "";
                                            var idColToSetEmployeeCenter = dataCol["idColToSetEmployeeCenter"] ? " idElToSetCenter='" + $row.attr("id") + "-" + dataCol["idColToSetEmployeeCenter"] + "-edit-td" + "' " : "";
                                            var text = colValue ? colValue : "Click to select";
                                            fieldHtml = "<a id='" + fieldId + "' href='#' " + idColToSetEmployeeName + idColToSetEmployeeWorkPhone + idColToSetEmployeeAlternatePhone + idColToSetEmployeeEmail + idColToSetEmployeeCenter + " idElementWithColValue='" + fieldId + "-td'>" + text + "</a>";

                                            htmlFormEdit += "<td class='W20 magic-table-form-label'>" + colHeader + "</td>";
                                            htmlFormEdit += "<td class='W30 magic-table-form-item " + fieldClass + "' id='" + fieldId + "-td' idCol='" + dataCol["id"] + "' colValue='" + colValue + "'>" + fieldHtml + "</td>";
                                            counterFormColumns++;

                                            //Bind element to show popup to select a soeid
                                            $(document).on('click', '#' + fieldId, function (e) {
                                                e.preventDefault();
                                                var $el = $(this);

                                                magicTableCreatePopupToSelectEmployee({
                                                    userSOEID: CURRENT_MAGIC_TABLE.config.userSOEID,
                                                    idCol: dataCol["id"],
                                                    showInPopup: true,
                                                    onSelected: function (objEmployee) {
                                                        $el.attr("soeidSelected", objEmployee.colSOEID);
                                                        $el.text("[" + objEmployee.colSOEID + "]");
                                                        //$el.text("[" + objEmployee.colSOEID + "] - " + objEmployee.colNAME);

                                                        //Set Name to another column
                                                        if ($el.attr("idElToSetName")) {
                                                            var $elToSetName = $("#" + $el.attr("idElToSetName"));
                                                            $elToSetName.attr("colValue", objEmployee.colName);
                                                            $elToSetName.text(objEmployee.colName);
                                                        }

                                                        //Set WorkPhone to another column
                                                        if ($el.attr("idElToSetWorkPhone")) {
                                                            var $elToSetWorkPhone = $("#" + $el.attr("idElToSetWorkPhone"));
                                                            $elToSetWorkPhone.attr("colValue", objEmployee.attrWorkPhone);
                                                            $elToSetWorkPhone.text(objEmployee.attrWorkPhone);
                                                        }

                                                        //Set AlternatePhone to another column
                                                        if ($el.attr("idElToSetAlternatePhone")) {
                                                            var $elToSetAlternatePhone = $("#" + $el.attr("idElToSetAlternatePhone"));
                                                            $elToSetAlternatePhone.attr("colValue", objEmployee.attrAlternatePhone);
                                                            $elToSetAlternatePhone.text(objEmployee.attrAlternatePhone);
                                                        }

                                                        //Set Email to another column
                                                        if ($el.attr("idElToSetEmail")) {
                                                            var $elToSetEmail = $("#" + $el.attr("idElToSetEmail"));
                                                            $elToSetEmail.attr("colValue", objEmployee.colEmail);
                                                            $elToSetEmail.text(objEmployee.colEmail);
                                                        }

                                                        //Set Center to another column
                                                        if ($el.attr("idElToSetCenter")) {
                                                            var $elToSetCenter = $("#" + $el.attr("idElToSetCenter"));
                                                            $elToSetCenter.attr("colValue", objEmployee.attrCenter);
                                                            $elToSetCenter.text(objEmployee.attrCenter);
                                                        }
                                                    }
                                                });
                                            });

                                            //Bind with colValue attr
                                            $(document).on('change', '#' + fieldId, function () {
                                                var $el = $(this);
                                                var v = $el.attr("soeidSelected");
                                                var idElement = $el.attr("idElementWithColValue");
                                                $("#" + idElement).attr("colValue", v);
                                            });
                                            break;
                                    }

                                } else {
                                    if (!dataCol["hideEditField"]) {
                                        htmlFormEdit += "<td class='W20 magic-table-form-label'>" + colHeader + "</td>";
                                        htmlFormEdit += "<td class='W30 magic-table-form-item " + fieldClass + "' id='" + fieldId + "-td' idCol='" + dataCol["id"] + "' colValue='" + colValue + "'>" + colValue + "</td>";
                                        counterFormColumns++;
                                    }
                                }

                                LastGroupName = dataCol["group"] ? dataCol["group"] : "Information";

                                //Last iteration
                                if (indexCol == totalCols - 1) {

                                    //If don't close the Tr
                                    if (counterFormColumns == 1) {
                                        htmlFormEdit += "<td class='W20 magic-table-form-label'></td>";
                                        htmlFormEdit += "<td class='W30 magic-table-form-item'></td>";
                                    }

                                    htmlFormEdit += "</tr>";
                                    htmlFormEdit += "</table></td></tr>";
                                }
                            });


                            htmlFormEdit += "</table>";
                            $row.attr("isEditing", "1");

                            var idPopup = CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("id");
                            magicTableCreatePopup(idPopup, "Edit row information", htmlFormEdit, {
                                onClose: function () {
                                    $row.attr("isEditing", "0");
                                },
                                onCreated: function ($popup) {
                                    //On Created Event
                                }
                            });
                        }
                    }

                    $("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-edit").click(function (e) {
                        if (CURRENT_MAGIC_TABLE.config.actions.Edit.showInPopup) {
                            CURRENT_MAGIC_TABLE.editFieldsInPopup(e, this);
                        } else {
                            CURRENT_MAGIC_TABLE.editFieldsInRow(e, this);
                        }

                        if (CURRENT_MAGIC_TABLE.config.autoShowSave) {
                            var $row = $(this).parent().parent();
                            $row.find("#" + $row.attr("id") + "-" + CURRENT_MAGIC_TABLE.config.autoShowSave + "-edit").click();
                        }

                        CURRENT_MAGIC_TABLE.LastEventsAction += ",Edit";
                    });
                }

                //Add click event to Expand Childs Button
                if (CURRENT_MAGIC_TABLE.config.actions.Expand) {

                    CURRENT_MAGIC_TABLE.expandChildRow = function (event, btnEvent) {
                        event.preventDefault();
                        var $el = $(btnEvent);
                        var idRowToGetAttrs = $el.attr("idRowToGetAttrs");
                        var $row = $("#" + idRowToGetAttrs);

                        if ($el.attr('forceRefresh')) {
                            $("." + idBtnToggle + "-row").remove();
                            $el.removeAttr('forceRefresh');
                        }

                        var $rowWithChildren = $("#" + $row.attr("id") + "-children");

                        //if exist panel skill items expanded remove it
                        if ($rowWithChildren.size() > 0) {
                            $rowWithChildren.toggle();

                            if ($rowWithChildren.is(":visible")) {
                                $el.attr("src", "App_Themes/Base/images/toggle-collapse-green.png");
                            } else {
                                $el.attr("src", "App_Themes/Base/images/toggle-expand-blue.png");
                            }
                            $el.removeAttr("disabled");
                        } else {
                            //Copy cdMagicTableOptions, because {{triger.[param]}} was replacing for all rows
                            var childrenTableOptions = JSON.parse(JSON.stringify(CURRENT_MAGIC_TABLE.config.actions.Expand.cdMagicTableOptions));
                            magicTableReviveFunctions(CURRENT_MAGIC_TABLE.config.actions.Expand.cdMagicTableOptions, childrenTableOptions);

                            //Reemplace params values if is necesary in sp List params
                            if (childrenTableOptions.config.actions.List) {
                                $(childrenTableOptions.config.actions.List.spDBToListParams).each(function (paramIndex, paramData) {
                                    paramData["Value"] = magicTableReplaceTextWithTriggerValue(paramData["Value"], CURRENT_MAGIC_TABLE.config.actions.Expand.trigger, $el);
                                });
                            }

                            //Reemplace params values if is necesary in sp Edit params
                            if (childrenTableOptions.config.actions.Edit) {
                                $(childrenTableOptions.config.actions.Edit.spDBToEditParams).each(function (paramIndex, paramData) {
                                    paramData["Value"] = magicTableReplaceTextWithTriggerValue(paramData["Value"], CURRENT_MAGIC_TABLE.config.actions.Expand.trigger, $el);
                                });
                            }

                            //Reemplace params values if is necesary in sp Insert params
                            if (childrenTableOptions.config.actions.Insert) {
                                $(childrenTableOptions.config.actions.Insert.spDBToInsertParams).each(function (paramIndex, paramData) {
                                    paramData["Value"] = magicTableReplaceTextWithTriggerValue(paramData["Value"], CURRENT_MAGIC_TABLE.config.actions.Expand.trigger, $el);
                                });
                            }

                            //Reemplace params values if is necesary in sp Delete params
                            if (childrenTableOptions.config.actions.Delete) {
                                $(childrenTableOptions.config.actions.Delete.spDBToDeleteParams).each(function (paramIndex, paramData) {
                                    paramData["Value"] = magicTableReplaceTextWithTriggerValue(paramData["Value"], CURRENT_MAGIC_TABLE.config.actions.Expand.trigger, $el);
                                });
                            }

                            //config.showTo "AfterRow:#attrs-reports-{{attrRowID}}": This format only with Linked or Expand tables that have trigger
                            if (childrenTableOptions.config.showTo.indexOf(":") >= 0) {
                                var idParentElAttrs = $el.attr(CURRENT_MAGIC_TABLE.config.actions.Expand.trigger.attrToGetParams);
                                var $parentElAttrs = $("#" + idParentElAttrs);
                                childrenTableOptions.config.showTo = magicTableReplaceDynamicValues(CURRENT_MAGIC_TABLE, $parentElAttrs, childrenTableOptions.config.showTo);
                            }

                            //config.idTable "tblReports-{{trigger.IDCategory}}": This format only with Linked or Expand tables that have trigger
                            if (childrenTableOptions.config.idTable.indexOf("{{trigger") >= 0) {
                                childrenTableOptions.config.idTable = magicTableReplaceTextWithTriggerValue(childrenTableOptions.config.idTable, CURRENT_MAGIC_TABLE.config.actions.Expand.trigger, $el);
                            }

                            $el.attr("src", "App_Themes/Base/images/toggle-collapse-green.png");
                            $.cdCreateMagicTable(childrenTableOptions);
                        }

                        if (CURRENT_MAGIC_TABLE.events && CURRENT_MAGIC_TABLE.events.onToggleExpand) {
                            CURRENT_MAGIC_TABLE.events.onToggleExpand(CURRENT_MAGIC_TABLE);
                        }
                    }

                    //TODO: change to use CURRENT_MAGIC_TABLE.config.actions.Expand.trigger.idElement {{idTable}}-btn-toggle-childs
                    var idBtnToggle = CURRENT_MAGIC_TABLE.config.idTable + "-btn-toggle-childs";
                    $("." + idBtnToggle).click(function (event) {
                        CURRENT_MAGIC_TABLE.expandChildRow(event, this);

                        CURRENT_MAGIC_TABLE.LastEventsAction += ",Expand";
                    });

                    //Need to show all childs expanded
                    if (CURRENT_MAGIC_TABLE.config.showExpandedChilds) {
                        $("." + idBtnToggle).click();
                    }

                    //Calculate showIf condition
                    if (CURRENT_MAGIC_TABLE.config.actions.Expand.showIf) {
                        var strOriginalCondition = CURRENT_MAGIC_TABLE.config.actions.Expand.showIf;
                        var strTempCondition = "";

                        $("." + idBtnToggle).each(function (index, element) {
                            var $el = $(element);
                            var idRowToGetAttrs = $el.attr("idRowToGetAttrs");
                            var $row = $("#"+idRowToGetAttrs);
                            strTempCondition = strOriginalCondition;

                            //Reemplace string condition in showIf: "{{attrEmployeesAssigned}} > 0"
                            strTempCondition = magicTableReplaceDynamicValues(CURRENT_MAGIC_TABLE, $row, strTempCondition);

                            //eval condition for true or false
                            if(eval(strTempCondition) == false){
                                $el.hide();
                            }
                        });
                    }
                }

                //Add click event to Return button
                //--------------------------------------------------------
                if (CURRENT_MAGIC_TABLE.config.actions.Edit) {

                    //Return Button
                    CURRENT_MAGIC_TABLE.onClickReturnBtn = function (e, btnEvent) {
                        e.preventDefault();

                        var $btnReturn = $(btnEvent);
                        var idRowToGetAttrs = $btnReturn.attr("idRow");
                        var $row = $("#" + idRowToGetAttrs);
                        var $btnSave = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-save");
                        var $btnDelete = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-delete");
                        var $btnEdit = $row.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-edit");

                        if ($row.attr("isEditing") == "1") {
                            var cols = CURRENT_MAGIC_TABLE.cols;
                            $(cols).each(function (indexCol, dataCol) {
                                var $col = $("#" + CURRENT_MAGIC_TABLE.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["id"]);

                                $col.attr("colValue", $col.attr("colValueOld"));
                                $col.html($col.attr("colValue"));

                            });

                            $row.attr("isEditing", "0");

                            $btnEdit.show();
                            $btnDelete.show();
                            $btnReturn.hide();
                            $btnSave.hide();

                        }
                    }

                    $("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-return").click(function (e) {
                        CURRENT_MAGIC_TABLE.onClickReturnBtn(e, this);
                        CURRENT_MAGIC_TABLE.LastEventsAction += ",Return";
                    });
                }

                //Add click event to Insert button
                //--------------------------------------------------------
                if (CURRENT_MAGIC_TABLE.config.actions.Insert) {

                    CURRENT_MAGIC_TABLE.insertNewRow = function (objNewRow) {
                        var $table = $("#" + CURRENT_MAGIC_TABLE.config.idTable);
                        var columnsName = Object.keys(objNewRow);
                        var strTemplateNewRow = $table.attr("strTemplateNewRow");
                        var idRowToGetAttrs = CURRENT_MAGIC_TABLE.config.idRowToGetAttrs;
                        var attrsToReplaceInStrTemplateNewRow = magicTableGetAttrsFromText(strTemplateNewRow);
                        var attrsToReplaceInIdRowToGetAttrs = magicTableGetAttrsFromText(idRowToGetAttrs);
                        var tempDataAttr;

                        if (CURRENT_MAGIC_TABLE.config.actions.Insert.createIDInDB === false) {
                            //Example "strTemplateNewRow" add T_Temp01_T to id elements
                            //<tr class="GridviewScrollItem" attrrowid="{{attrRowID}}=>T_Temp01_T" id="attrs-user-{{attrRowID}}=>T_Temp01_T">
                            //  <td style="text-align: left;" id="tblRolesXUsers-{{attrRowID}}=>T_Temp01_T-colSOEID" colvalue="{{colSOEID}}">{{colSOEID}}</td>
                            //  <td style="text-align: left;" id="tblRolesXUsers-{{attrRowID}}=>T_Temp01_T-colName" colvalue="{{colName}}">{{colName}}</td>
                            //  <td style="text-align: left;" id="tblRolesXUsers-{{attrRowID}}=>T_Temp01_T-colEmail" colvalue="{{colEmail}}">{{colEmail}}</td> 
                            //</tr>

                            //Temps ID Rows
                            if (!CURRENT_MAGIC_TABLE.tempIDRow) {
                                CURRENT_MAGIC_TABLE.tempIDRow = 1;
                            } else {
                                CURRENT_MAGIC_TABLE.tempIDRow++;
                            }

                            //REPLACE {{attrRowID}} to $Temp01$
                            strTemplateNewRow = magicTableReplaceAll("{{attrRowID}}", "T_Temp" + CURRENT_MAGIC_TABLE.tempIDRow + "_T", strTemplateNewRow);
                            idRowToGetAttrs = magicTableReplaceAll("{{attrRowID}}", "T_Temp" + CURRENT_MAGIC_TABLE.tempIDRow + "_T", idRowToGetAttrs);
                        }

                        //Example "strTemplateNewRow" Replace with BD Values {{attrRowID}}, {{colSOEID}}, {{colName}}, {{colEmail}}
                        //<tr class="GridviewScrollItem" attrrowid="{{attrRowID}}" id="attrs-user-{{attrRowID}}">
                        //  <td style="text-align: left;" id="tblRolesXUsers-{{attrRowID}}-colSOEID" colvalue="{{colSOEID}}">{{colSOEID}}</td>
                        //  <td style="text-align: left;" id="tblRolesXUsers-{{attrRowID}}-colName" colvalue="{{colName}}">{{colName}}</td>
                        //  <td style="text-align: left;" id="tblRolesXUsers-{{attrRowID}}-colEmail" colvalue="{{colEmail}}">{{colEmail}}</td> 
                        //</tr>

                        //REPLACE {{attr..}} in cell template
                        //<td style="text-align: left;" id="tblRolesXUsers-{{attrRowID}}-colEmail" colvalue="{{colEmail}}">{{colEmail}}</td>
                        //Replace special cases with id different from colDbToBind like id: "attrRowID", colDbToBind: "RoleID"
                        $(attrsToReplaceInStrTemplateNewRow).each(function (indexAttrs, idAttrs) {
                            tempDataAttr = magicTableLookForIDProperty(CURRENT_MAGIC_TABLE.attrs, idAttrs);
                            if (tempDataAttr) {
                                strTemplateNewRow = magicTableReplaceAll("{{" + idAttrs + "}}", objNewRow[tempDataAttr.colDbToBind], strTemplateNewRow);
                            }
                        });

                        //REPLACE {{attr..}} in config.idRowToGetAttrs = "attrs-user-{{attrRowID}}"
                        $(attrsToReplaceInIdRowToGetAttrs).each(function (indexAttrs, idAttrs) {
                            tempDataAttr = magicTableLookForIDProperty(CURRENT_MAGIC_TABLE.attrs, idAttrs);
                            if (tempDataAttr) {
                                idRowToGetAttrs = magicTableReplaceAll("{{" + idAttrs + "}}", objNewRow[tempDataAttr.colDbToBind], idRowToGetAttrs);
                            }
                        });

                        //REPLACE {{col...}} in cell template and config.idRowToGetAttrs
                        $(columnsName).each(function (keyIndex, keyName) {
                            idRowToGetAttrs = magicTableReplaceAll("{{attr" + keyName + "}}", objNewRow[keyName], idRowToGetAttrs);
                            idRowToGetAttrs = magicTableReplaceAll("{{col" + keyName + "}}", objNewRow[keyName], idRowToGetAttrs);

                            strTemplateNewRow = magicTableReplaceAll("{{attr" + keyName + "}}", objNewRow[keyName], strTemplateNewRow);
                            strTemplateNewRow = magicTableReplaceAll("{{col" + keyName + "}}", objNewRow[keyName], strTemplateNewRow);
                        });

                        strTemplateNewRow = magicTableReplaceAll("{{idRowToGetAttrs}}", idRowToGetAttrs, strTemplateNewRow);
                        strTemplateNewRow = magicTableReplaceAll("{{idRowToGetAttrs}}", idRowToGetAttrs, strTemplateNewRow);

                        //Remove No data found row if exist
                        $("." + CURRENT_MAGIC_TABLE.config.idTable + "-row-no-data").remove();

                        $table.append(strTemplateNewRow);
                        var $HTMLNewRow = $table.find("#" + idRowToGetAttrs);

                        //Add click event to Edit button
                        $HTMLNewRow.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-edit").click(function (e) {
                            if (CURRENT_MAGIC_TABLE.config.actions.Edit.showInPopup) {
                                CURRENT_MAGIC_TABLE.editFieldsInPopup(e, this);
                            } else {
                                CURRENT_MAGIC_TABLE.editFieldsInRow(e, this);
                            }

                            if (CURRENT_MAGIC_TABLE.config.autoShowSave) {
                                var $row = $(this).parent().parent();
                                $row.find("#" + $row.attr("id") + "-" + CURRENT_MAGIC_TABLE.config.autoShowSave + "-edit").click();
                            }

                            CURRENT_MAGIC_TABLE.LastEventsAction += ",Edit";
                        });

                        //Add click event to Expand button
                        $HTMLNewRow.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-toggle-childs").click(function (e) {
                            CURRENT_MAGIC_TABLE.expandChildRow(e, this);

                            CURRENT_MAGIC_TABLE.LastEventsAction += ",Expand";
                        });

                        //Add click event to Delete button
                        $HTMLNewRow.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-delete").click(function (e) {
                            CURRENT_MAGIC_TABLE.onClickDeleteBtn(e, this);

                            CURRENT_MAGIC_TABLE.LastEventsAction += ",Delete";
                        });

                        //Add click event to Return button
                        $HTMLNewRow.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-return").click(function (e) {
                            CURRENT_MAGIC_TABLE.onClickReturnBtn(e, this);

                            CURRENT_MAGIC_TABLE.LastEventsAction += ",Return";
                        });

                        //Add click event to Save button
                        $HTMLNewRow.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-save").click(function (e) {
                            CURRENT_MAGIC_TABLE.onClickSaveBtn(e, this);

                            CURRENT_MAGIC_TABLE.LastEventsAction += ",Save";
                        });

                        $HTMLNewRow.hide().show("slow");

                        //Automatic Show SOEID Popup
                        if (CURRENT_MAGIC_TABLE.config.autoShowSave) {
                            $HTMLNewRow.find("." + CURRENT_MAGIC_TABLE.config.idTable + "-btn-edit").click();
                            $HTMLNewRow.find("#" + idRowToGetAttrs + "-" + CURRENT_MAGIC_TABLE.config.autoShowSave + "-edit").click();
                        }
                    };

                    $("#" + CURRENT_MAGIC_TABLE.config.idTable + "-btn-insert").click(function (e) {

                        if (typeof CURRENT_MAGIC_TABLE.config.actions.Insert.createIDInDB === "undefined" || CURRENT_MAGIC_TABLE.config.actions.Insert.createIDInDB) {
                            //Insert new row to the database
                            $.ajax({
                                url: CURRENT_MAGIC_TABLE.sourceBaseUrl,
                                data: {
                                    paction: CURRENT_MAGIC_TABLE.actionInsert,
                                    spDBToInsertName: CURRENT_MAGIC_TABLE.config.actions.Insert.spDBToInsertName,
                                    spDBToInsertParams: CURRENT_MAGIC_TABLE.config.actions.Insert.spDBToInsertParams,
                                    colsDBToSelect: CURRENT_MAGIC_TABLE.colsDBToSelect
                                },
                                beforeSend: function () {
                                    $.showFullLoading(CURRENT_MAGIC_TABLE.config.idTable);
                                },
                                success: function (objNewRow) {
                                    CURRENT_MAGIC_TABLE.insertNewRow(objNewRow);
                                    $.hideFullLoading(CURRENT_MAGIC_TABLE.config.idTable);
                                },
                                error: function (xhr, textStatus, thrownError) {
                                    magicTableShowMessage({
                                        "xhr": xhr,
                                        "error": thrownError,
                                        "magicTable": CURRENT_MAGIC_TABLE
                                    });
                                },
                                dataType: "json",
                                type: "POST"
                            });

                        } else {
                            var objNewRow = {};

                            //Create default Object
                            $.each(CURRENT_MAGIC_TABLE.colsDBToSelect, function (index, col) {
                                objNewRow[col.Name] = "";
                            });

                            CURRENT_MAGIC_TABLE.insertNewRow(objNewRow);
                        }

                        CURRENT_MAGIC_TABLE.LastEventsAction += ",Insert";

                        //$HTMLNewRow.find('.datepicker').datepicker();
                        e.preventDefault();
                    });
                }

                //Add events of LinkedTables for each cols
                //--------------------------------------------------------
                $(CURRENT_MAGIC_TABLE.cols).each(function (index, dataCol) {

                    //Only if have linked table
                    if (dataCol.linkedTable) {

                        //Add Onclick event to the trigger
                        $magicTable.find(dataCol.linkedTable.trigger.idElement).click(function (e) {
                            var $el = $(this);

                            //Copy cdMagicTableOptions, because {{triger.[param]}} was replacing for all rows
                            var linkedTableOptions = JSON.parse(JSON.stringify(dataCol.linkedTable.cdMagicTableOptions));

                            //Reemplace params values if is necesary in sp List params
                            if (linkedTableOptions.config.actions.List) {
                                $(linkedTableOptions.config.actions.List.spDBToListParams).each(function (paramIndex, paramData) {
                                    paramData["Value"] = magicTableReplaceTextWithTriggerValue(paramData["Value"], dataCol.linkedTable.trigger, $el);
                                });
                            }

                            //Reemplace params values if is necesary in sp List params
                            if (linkedTableOptions.config.actions.Edit) {
                                $(linkedTableOptions.config.actions.Edit.spDBToEditParams).each(function (paramIndex, paramData) {
                                    paramData["Value"] = magicTableReplaceTextWithTriggerValue(paramData["Value"], dataCol.linkedTable.trigger, $el);
                                });
                            }

                            //Reemplace params values if is necesary in sp List params
                            if (linkedTableOptions.config.actions.Delete) {
                                $(linkedTableOptions.config.actions.Delete.spDBToDeleteParams).each(function (paramIndex, paramData) {
                                    paramData["Value"] = magicTableReplaceTextWithTriggerValue(paramData["Value"], dataCol.linkedTable.trigger, $el);
                                });
                            }

                            //"AfterRow:#attrs-reports-{{attrRowID}}": This format only with Linked or Expand tables that have trigger
                            if (linkedTableOptions.config.showTo.indexOf(":") >= 0) {
                                var idParentElAttrs = $el.attr(dataCol.linkedTable.trigger.attrToGetParams);
                                var $parentElAttrs = $("#" + idParentElAttrs);
                                linkedTableOptions.config.showTo = magicTableReplaceDynamicValues(CURRENT_MAGIC_TABLE, $parentElAttrs, linkedTableOptions.config.showTo);
                            }

                            $.cdCreateMagicTable(linkedTableOptions);

                            e.preventDefault();
                        });
                    }
                });

                //Add events to "Filter table data"
                if (CURRENT_MAGIC_TABLE.config.hasFilter) {
                    //Map filter field to filterValue attrs
                    $("#" + CURRENT_MAGIC_TABLE.config.idTable + "-filters .filterElement").each(function () {
                        var $el = $(this);
                        //Inputs
                        if ($el.is("input")) {
                            //Bind with colValue attr
                            $(document).on('keyup', '#' + $el.attr("id"), function () {
                                var $el = $(this);
                                var v = $el.val();
                                var idElement = $el.attr("idElementWithFilterValue");
                                $("#" + idElement).attr("filterValue", v);
                            });
                        }

                        //Select
                        if ($el.is("select")) {
                            //Bind with colValue attr
                            $(document).on('change', '#' + $el.attr("id"), function () {
                                var $el = $(this);
                                var v = $el.val();
                                var idElement = $el.attr("idElementWithFilterValue");
                                $("#" + idElement).attr("filterValue", v);
                            });
                        }

                        //Checkboxk
                        if ($el.is("checkboxk")) {
                            //Bind with colValue attr
                            $(document).on('change', '#' + $el.attr("id"), function () {
                                var $el = $(this);
                                var v = $el.is(':checked') ? "True" : "False";
                                var idElement = $el.attr("idElementWithFilterValue");
                                $("#" + idElement).attr("filterValue", v);
                            });
                        }
                    });

                    //On click "Filter table data" event
                    $("#" + CURRENT_MAGIC_TABLE.config.idTable + "-btn-filter").click(function () {

                        //Get data from filters
                        $("#" + CURRENT_MAGIC_TABLE.config.idTable + "-filters .filter").each(function () {
                            var $elFilter = $(this);
                            var found = false;
                            var paramName = magicTableReplaceAll("col", "", $elFilter.attr("idCol"));

                            //Reemplace params values
                            $(CURRENT_MAGIC_TABLE.config.actions.List.spDBToListParams).each(function (index, dataParam) {
                                if (dataParam["Name"] == '@' + paramName) {
                                    dataParam["Value"] = $elFilter.attr("filterValue") ? $elFilter.attr("filterValue") : "";
                                    found = true;
                                    return false;
                                }
                            });

                            //If param not exist add
                            if (!found) {
                                CURRENT_MAGIC_TABLE.config.actions.List.spDBToListParams.push({
                                    Name: "@" + paramName,
                                    Value: $elFilter.attr("filterValue") ? $elFilter.attr("filterValue") : ""
                                });
                            }
                        });

                        //Refres magic table with new values
                        $.cdCreateMagicTable(CURRENT_MAGIC_TABLE);
                    });
                }

                //Excecute OnSuccess Events
                if (CURRENT_MAGIC_TABLE.events && CURRENT_MAGIC_TABLE.events.onSuccess) {

                    CURRENT_MAGIC_TABLE.events.onSuccess(CURRENT_MAGIC_TABLE);
                }

                $.hideFullLoading(CURRENT_MAGIC_TABLE.config.idTable);
            },
            error: function (xhr, textStatus, thrownError) {
                magicTableShowMessage({
                    "xhr": xhr,
                    "error": thrownError,
                    "magicTable": option
                });
            },
            type: "POST"
        });
    } else {
        magicTableShowMessage({
            type: 'error',
            magicTable: option,
            content: message
        });
    }
}

function magicTableReviveFunctions(originalObject, jsonCopyObject){
    //Hacer un merge con las opciones que nos enviaron y las default.
    var defaultKeys = Object.keys(originalObject);
    $(defaultKeys).each(function (index, value) {
        if (typeof originalObject[value] == 'object') {
            magicTableReviveFunctions(originalObject[value], jsonCopyObject[value]);
        }

        if (typeof originalObject[value] == 'function') {
            jsonCopyObject[value] = originalObject[value];
        }
    });
}

function magicTableReplaceTextWithTriggerValue(text, triggerData, $el) {
    var startIndex = text.indexOf("{{trigger.");
    var lastIndex = text.indexOf("}}");

    if (startIndex > -1) {

        var paramName = text.substring(startIndex + 10, lastIndex);
        var attrName = triggerData.params[paramName].replace("{{", "").replace("}}", "");

        var idParentElAttrs = $el.attr(triggerData.attrToGetParams);
        var $parentElAttrs = $("#" + idParentElAttrs);

        text = magicTableReplaceAll("{{trigger." + paramName + "}}", $parentElAttrs.attr(attrName), text);
    }

    return text;
}

function magicTableRefreshSelectEditDataSource(options) {
    //    options = {
    //        CURRENT_MAGIC_TABLE
    //        $row
    //        dataCol
    //        sourceBaseUrl
    //        actionCallProcedure
    //        colValue
    //        fieldId
    //        refreshWithFormData
    //        idFormEdit
    //        field
    //    }

    //Loading data from database with AJAX
    var onEditDataSourceOptions = JSON.parse(JSON.stringify(options["dataCol"]["onEditDataSource"]));

    //Reemplace params values if is necesary in sp params
    $(onEditDataSourceOptions["spParams"]).each(function (paramIndex, paramData) {

        if (options["refreshWithFormData"]) {
            //When some select change in form, we need to reemplace the data liked it with form fields
            paramData["Value"] = magicTableReplaceValuesWithCurrentFormData(paramData["Value"], options["idFormEdit"], options["fieldClass"]);
        } else {
            //When first loading of form happend we call this function
            paramData["Value"] = magicTableReplaceDynamicValues(options["CURRENT_MAGIC_TABLE"], options["$row"], paramData["Value"], options);
        }

    });


    $.ajax({
        url: options["sourceBaseUrl"],
        data: {
            paction: options["actionCallProcedure"],
            dataSourceOptions: onEditDataSourceOptions
        },
        beforeSend: function () {
            $.showFullLoading(options["fieldId"]);
        },
        success: function (resultList) {
            var $sel = $("#" + options["fieldId"]);
            $sel.find('option').remove();
            $sel.append($("<option value='0'>-- Select --</option>"));

            $(resultList).each(function (index, dataRow) {
                var expResultValue = magicTableGetResultExpressionByObject(onEditDataSourceOptions["Value"], dataRow);
                var expResultText = magicTableGetResultExpressionByObject(onEditDataSourceOptions["Text"], dataRow);
                var selectedAttr = "";

                if (expResultValue == options["colValue"]) {
                    selectedAttr = "selected='true'";
                }

                $sel.append($("<option value='" + expResultValue + "' " + selectedAttr + ">" + expResultText + "</option>"));
            });

            $.hideFullLoading(options["fieldId"]);
        },
        error: function (xhr, textStatus, thrownError) {
            magicTableShowMessage({
                "xhr": xhr,
                "error": thrownError,
                "magicTable": options["CURRENT_MAGIC_TABLE"],
                "fieldId": options["fieldId"]
            });
        },
        type: "POST"
    });
}

function magicTableReplaceValuesWithCurrentFormData(ptext, idEditForm, elementClass) {
    var startIndex = ptext.indexOf("{{");
    var lastIndex = 0;
    var idTempAttr = "";
    var isFound = false;
    var $fields = $('#' + idEditForm).find('.' + elementClass);

    while (startIndex >= 0) {
        lastIndex = ptext.indexOf("}}");
        idTempAttr = ptext.substring(startIndex + 2, lastIndex);

        $fields.each(function () {
            var $el = $(this);

            if (idTempAttr == $el.attr('idCol')) {
                ptext = magicTableReplaceAll("{{" + idTempAttr + "}}", $el.attr('colValue'), ptext);
                isFound = true;
                return false;
            }

        });

        if (isFound) {
            //Look for next expression
            startIndex = ptext.indexOf("{{");
        } else {
            //Hide popup
            $('#btnClosePopup').click();

            $.showAlert({
                type: 'error',
                content: "The expression '{{" + idTempAttr + "}}' in the text " + ptext + " not found in idCol attributes for jQuery Selector"
            });

            startIndex = -1;
        }
    }

    return ptext;
}

function magicTableReplaceDynamicValues(ptable, $prow, ptext, optionsToRefreshSelect) {
    ptext = magicTableReplaceAll("{{", "", ptext);
    ptext = magicTableReplaceAll("}}", "", ptext);

    //Replace procedure params with attribute values
    $(ptable.attrs).each(function (index, dataAttr) {
        if (ptext.indexOf(dataAttr["id"]) > -1) {
            ptext = magicTableReplaceAll(dataAttr["id"], $prow.attr(dataAttr["id"]), ptext);
        }
    });

    //Replace procedure params with column values
    $(ptable.cols).each(function (index, dataCol) {
        if (ptext.indexOf(dataCol["id"]) > -1) {

            //Example of td id: tblProcesss-1408-colCenter
            ptext = magicTableReplaceAll(dataCol["id"], $("#" + ptable.config.idTable + "-" + $prow.attr("attrRowID") + "-" + dataCol["id"]).attr("colValue"), ptext);

            if (optionsToRefreshSelect) {
                //Example of select id: attrs-process-1408-colCenter-edit
                var idFieldToMapEvent = $prow.attr("id") + "-" + dataCol["id"] + "-edit";

                //If this element have some other element liked with {{colProcess}} if this change we need to refresh liked element in procedure params example:
                //spName: "STPR_CPR_GET_SUB_PROCESS",
                //spParams: [{ Name: "@PROCESS", Value: "{{colProcess}}" }]

                $(document).on('change', '#' + idFieldToMapEvent, function () {
                    optionsToRefreshSelect["refreshWithFormData"] = true;
                    magicTableRefreshSelectEditDataSource(optionsToRefreshSelect);
                });
            }
        }
    });

    return ptext;
}

function magicTableLookForIDProperty(parray, pidProperty) {
    var result;

    $(parray).each(function (indexArray, dataArray) {
        if (dataArray.id == pidProperty) {
            result = dataArray;
            return false;
        }
    });

    return result;
}

function magicTableGetAttrsFromText(text) {
    var startIndex = text.indexOf("{{");
    var lastIndex = 0;
    var attrs = [];
    var uniqueAttrs = {};
    var idTempAttr = "";

    while (startIndex > 0) {
        lastIndex = text.indexOf("}}");
        idTempAttr = text.substring(startIndex + 2, lastIndex);

        if (!uniqueAttrs[idTempAttr]) {
            attrs.push(text.substring(startIndex + 2, lastIndex));
            uniqueAttrs[text.substring(startIndex + 2, lastIndex)] = true;
        }

        text = text.replace("{{", "");
        text = text.replace("}}", "");

        startIndex = text.indexOf("{{");
    }

    return attrs;
}

function magicTableGetResultExpressionByObject(text, obj) {
    var startIndex = text.indexOf("{{");
    var lastIndex = 0;
    var idTempAttr = "";

    while (startIndex >= 0) {
        lastIndex = text.indexOf("}}");
        idTempAttr = text.substring(startIndex + 2, lastIndex);

        if (obj[idTempAttr]) {
            text = magicTableReplaceAll("{{" + idTempAttr + "}}", obj[idTempAttr], text);

            startIndex = text.indexOf("{{");
        } else {
            //Hide popup
            $('#btnClosePopup').click();

            $.showAlert({
                type: 'error',
                content: "The expression '{{" + idTempAttr + "}}' in the text " + text + " not found in Json: " + JSON.stringify(obj)
            });

            startIndex = -1;
        }
    }

    return text;
}

function magicTableReplaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function magicTableCreatePopupToSelectEmployee(configPopup) {
    var idPopupLookForEmployees = "PopupLookForEmployee";
    var listParams = [];

    if (configPopup.id) {
        idPopupLookForEmployees = configPopup.id;
    }

    var idPopupLookForEmployeesBody = "#" + idPopupLookForEmployees + "BodyPopup";

    if (configPopup.showTo) {
        idPopupLookForEmployeesBody = configPopup.showTo;
    }

    if (!configPopup.showInPopup) {
        configPopup.showInPopup = false;
    }

    //create popup to show the table
    if (configPopup.showInPopup) {
        magicTableCreatePopup(idPopupLookForEmployees, "Look for employee", "");
    }

    if (configPopup.userSOEID) {
        listParams = [
            { Name: "@ManagerSOEID", Value: configPopup.userSOEID }
        ]
    }

    $.cdCreateMagicTable({
        config: {
            idTable: "tblLookForEmployees",
            showTo: idPopupLookForEmployeesBody,
            idRowToGetAttrs: "attrs-employee-{{attrRowID}}",
            idRowColDbToBind: "SOEID",
            titleOnDelete: "{{colName}}",
            isGridViewScroll: true,
            height: $(idPopupLookForEmployeesBody).height(),
            width: $(idPopupLookForEmployeesBody).width() - 20,
            actions: {
                //List data configuration
                "List": {
                    spDBToListName: "[HRTTDB].[dbo].[FROU_spAdminEmployeeList]",
                    spDBToListParams: listParams
                }
            }
        },
        attrs: [{
            id: "attrRowID",
            colDbToBind: "SOEID"
        }, {
            id: "attrWorkPhone",
            colDbToBind: "WORK_PHONE"
        }, {
            id: "attrAlternatePhone",
            colDbToBind: "ALTN_PHONE"
        }, {
            id: "attrCenter",
            colDbToBind: "CENTER"
        }],
        cols: [
            {
                id: "colSelect",
                colHeaderTitle: "Select",
                colValue: "Select",
                cellTemplate: "<a href='#' class='{{idTable}}" + (configPopup.idRow ? '-' + configPopup.idRow + '-' : "") + (configPopup.idCol ? '-' + configPopup.idCol + '-' : "") + "select-row' idRowToGetAttrs='{{idRowToGetAttrs}}' >Select</a>",
                colWidth: '10%'
            },
            { id: 'colSOEID', colHeaderTitle: 'SOEID', colDbToBind: 'SOEID', colWidth: '20%', canFilter: true },
            { id: 'colName', colHeaderTitle: 'Name', colDbToBind: 'NAME', colWidth: '40%', canFilter: false },
            { id: 'colFirstName', colHeaderTitle: 'First Name', colDbToBind: 'FIRST_NAME', hideCol: true, canFilter: true },
            { id: 'colLastName', colHeaderTitle: 'Last Name', colDbToBind: 'LAST_NAME', hideCol: true, canFilter: true },
            { id: 'colEmail', colHeaderTitle: 'Email', colDbToBind: 'EMAIL_ADDR', colWidth: '30%', canFilter: true }
        ],
        events: {
            onSuccess: function (pmagicTableOptions) {
                var idSelector = '.' + pmagicTableOptions.config.idTable + (configPopup.idRow ? '-' + configPopup.idRow + '-' : "") + (configPopup.idCol ? '-' + configPopup.idCol + '-' : "") + 'select-row';

                //Validate to prevent duplicate handleres
                if (!magicTableExistsEvent('click', idSelector)) {

                    //Bind with select click event
                    $(document).on('click', idSelector, function (e) {
                        e.preventDefault();
                        var $el = $(this);
                        var idRowToGetAttrs = $el.attr("idRowToGetAttrs");
                        var $row = $("#" + idRowToGetAttrs);
                        var objEmployeeSelected = {};
                        var attrs = pmagicTableOptions.attrs;
                        var cols = pmagicTableOptions.cols;

                        $(attrs).each(function (indexAttr, dataAttr) {
                            objEmployeeSelected[dataAttr["id"]] = $row.attr(dataAttr["id"]);
                        });

                        $(cols).each(function (indexCol, dataCol) {
                            objEmployeeSelected[dataCol["id"]] = $row.find("#" + pmagicTableOptions.config.idTable + "-" + $row.attr("attrRowID") + "-" + dataCol["id"]).attr("colValue");
                        });

                        if (configPopup.onSelected) {
                            configPopup.onSelected(objEmployeeSelected);
                        }

                        if (configPopup.showInPopup) {
                            $('#' + idPopupLookForEmployees + 'btnClosePopup').click();
                        }
                    });
                }

                //Add eventos to "documentEvents" to prevent duplicate handlers
                magicTableAddEvent('click', idSelector);

            }
        }
    });
}

function magicTableCreatePopup(pidPopup, ptextTitle, ptextBody, pcallBackFunctions) {
    $('#' + pidPopup + 'pnlPopup').remove();
    $('#' + pidPopup + 'backgroundElement').remove();

    var htmlPopup = "";
    htmlPopup += "<div id='" + pidPopup + "pnlPopup' style='height: 100%; width: 90%; position: fixed; z-index: 10001; left: 5%; top: 30px;'>";
    htmlPopup += "    <table class='popup table-full-width'>";
    htmlPopup += "        <tbody>";
    htmlPopup += "	        <tr>";
    htmlPopup += "		        <td>";
    htmlPopup += "			        <img id='imgBannerTopPopup' src='App_Themes/Base/images/citi_corp_logo.gif' style='border-width:0px;'>";
    htmlPopup += "		        </td>";
    htmlPopup += "		        <td>";
    htmlPopup += "			        <span id='lblTituloBannerTopPopup' class='titleBig'>" + ptextTitle + "</span>";
    htmlPopup += "		        </td>";
    htmlPopup += "		        <td align='right'>";
    htmlPopup += "			        <input type='image' name='btnClosePopup' id='" + pidPopup + "btnClosePopup' title='Return' class='AutoWH' src='App_Themes/Base/images/close.png' style='border-width:0px;'>";
    htmlPopup += "		        </td>";
    htmlPopup += "	        </tr>";
    htmlPopup += "        </tbody>";
    htmlPopup += "    </table>";
    htmlPopup += "    <div class='popup' id='" + pidPopup + "BodyPopup' style='padding: 10px; height: 100%; max-height: 75%;'>";
    htmlPopup += ptextBody;
    htmlPopup += "    </div>";
    htmlPopup += "</div>";
    htmlPopup += "<div id='" + pidPopup + "backgroundElement' class='popupBackground' style='position: fixed; left: 0px; top: 0px; z-index: 10000; width: 100%; height: 2045px;'></div>";

    var $popup = $('body').append($(htmlPopup));
    if (pcallBackFunctions && pcallBackFunctions.onCreated) {
        pcallBackFunctions.onCreated($popup);
    }

    $('#' + pidPopup + 'btnClosePopup').click(function (e) {
        e.preventDefault();

        $('#' + pidPopup + 'pnlPopup').remove();
        $('#' + pidPopup + 'backgroundElement').remove();

        if (pcallBackFunctions && pcallBackFunctions.onClose) {
            pcallBackFunctions.onClose();
        }
    });
}

function magicTableAddEvent(eventName, selector) {

    if (MAGIC_TABLES_EVENTS[eventName]) {
        MAGIC_TABLES_EVENTS[eventName][selector] = true;
    } else {
        MAGIC_TABLES_EVENTS[eventName] = {};
        MAGIC_TABLES_EVENTS[eventName][selector] = true;
    }

}

function magicTableExistsEvent(eventName, selector) {
    var result = false;

    if (MAGIC_TABLES_EVENTS[eventName]) {
        if (MAGIC_TABLES_EVENTS[eventName][selector]) {
            result = true;
        }
    }

    return result;
}

//Options { xhr, error, magicTable, fieldId }
function magicTableShowMessage(options) {
    var optionsToShowAlert = {};
    var $showTo = null;

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

    if (options["magicTable"].config.isGridViewScroll) {

        $showTo = $("#" + options["magicTable"].config.idTable).parent().parent().parent().parent();

    } else {

        $showTo = $("#" + options["magicTable"].config.idTable).parent();
    }

    if (!$showTo.is(":visible")) {
        $showTo = "#" + $(".boxContainerArea[main='true']").find(':first-child').attr('id');
    }

    //Magic table some times send id like "AfterRow:#attrs-report-category-2" for parent row
    //So we need to get child row #attrs-report-category-2-children
    var dataSplit = options["magicTable"]["config"]["showTo"].split(":");
    var afterRowId = "";

    if (dataSplit.length > 1) {
        //Get children row and then "td" element to show the message
        //<tr id=​"attrs-report-category-2-children">
        //  <td colspan=​"2">​…​</td>​​
        if ($(dataSplit[1] + "-children").children().length > 0) {
            $showTo = $(dataSplit[1] + "-children").children();
            optionsToShowAlert.animateScrollTop = false;
        }
    }

    //Hide loading
    if (options["fieldId"]) {
        $.hideFullLoading(options["fieldId"]);
    } else {
        $.hideFullLoading(options["magicTable"].config.idTable);
    }

    if (optionsToShowAlert.type == "error") {
        if ((typeof $showTo != 'string') && !$showTo.is(":visible")) {
            $showTo = "#" + $(".boxContainerArea[main='true']").find(':first-child').attr('id');
        }

        //Hide popups to see error message
        $('[name="btnClosePopup"]').click();
    } else {
        //If we are in Popup Table
        if (options["magicTable"]["config"]["showTo"] == "DefaultPopup") {
            $showTo = $("#" + options["magicTable"].config.idTable).parent();
            optionsToShowAlert.animateScrollTop = false;
        }
    }

    optionsToShowAlert.showTo = $showTo;

    $.showAlert(optionsToShowAlert);
}