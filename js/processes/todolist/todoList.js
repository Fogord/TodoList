/**
  * First application by writed engien
  * All comunication of components implemented by pattern observer
  * The apps using model in todoModel.js file
  */

var todoList = (function () {

    // The height of parent
    var parentHeight;
    // The index of manipulated  item of model
    var currentIndexItemList;
    // The temporary  array of filtered model items
    var filteredModel = [];


    // The function which is creat the main item
    var todoListItemsPage = function() {

        // The element show the popup item and show information about apps
        var popupItem = {
            componentName: "Popup",
            property: {
                pading: 10,
                popupText: "<br>" + "Created by: <i>Artem Yerko</i>" + "<br>" + "Date: 20.04.2018" + "<br>" + "Version: 1.1" + "<br>"
            },
            publish: {
                closed: "closedPopup"
            },
            subscribe: {
                showPopupItem: function(publisher) {
                    this.open();
                }
            }
        }

        // The element contain items to manipulate stackView components
        var headerOfStackView =  {
            componentName: "Header",
            property: {
                heightPercent: 0.1
            },
            publish: {
                pressedBack:      "stackPop",
                showPopupItem:    "showPopupItem",
                pressedAdd:       "itemAdd"
            },
            subscribe: {
                stackDepthChanged: function(publisher) {
                    this.visibleBackBtn = publisher.depth > 1?true:false;
                    this.visibleAddBtn = !this.visibleBackBtn;
                }
            }
        };

        // searching the items of complicated model and push it in the temp arra
        // and cleaned model to show filtered model
        var searchAlgoritm = function(publisher){
            var needAppend = false;
            this.model.clear();
            if(publisher.textInput) {
                filteredModel = [];
                for(var key in todoModel){
                    if (todoModel.hasOwnProperty(key)){
                        needAppend = false;
                        for(var keyModelitem in todoModel[key]){
                            if (todoModel[key].hasOwnProperty(keyModelitem)){
                                var stringItemValue = "" + todoModel[key][keyModelitem];
                                if(stringItemValue.indexOf(publisher.textInput) !== -1) {
                                    needAppend = true;
                                }
                            }
                        }

                        if(needAppend) {
                            filteredModel.push({ modelIndex:key });
                            this.model.append(todoModel[key]);
                        }
                    }
                }
            } else {
                for(var key in todoModel){
                    if (todoModel.hasOwnProperty(key)){
                        this.model.append(todoModel[key]);
                    }
                }
            }
        }

        // This item show list of model and provide to manipulate data
        var listOfStackView = {
            componentName: "List",
            property: {
                clip: true,
                heightPercent: 0.9,
                margin: 4,
                iconRemoveSource: "qrc:./img/delete.png",
                iconChangeSource: "qrc:./img/edit.png",
                borderColor: "#808080"
            },
            model: todoModel,
            publish: {
                itemChanging: "itemChanging",
                itemRemove: "itemRemove",
                showSearchFild: "showSearchFild",
                hiddenSearchFild: "hiddenSearchFild"
            },
            subscribe: {
                itemRemove:function(publisher) {
                    currentIndexItemList = this.currentIndex;

                    if (filteredModel.length > 0) {
                        this.model.remove(filteredModel[currentIndexItemList].modelIndex);
                        todoModel.splice(filteredModel[currentIndexItemList].modelIndex, 1);
                        filteredModel = [];
                    }
                    else {
                        this.model.remove(currentIndexItemList);
                        todoModel.splice(currentIndexItemList, 1);
                    }
                },
                itemInserted:function(publisher) {
                    if(publisher.textInput) {
                        todoModel.push({name: publisher.textInput});
                        this.model.append({name: publisher.textInput});
                    }
                },
                itemChanged: function(publisher){
                    if(publisher.textInput) {
                        todoModel[currentIndexItemList].name = publisher.textInput;
                        this.model.get(currentIndexItemList).name = publisher.textInput;
                    }
                },
                textForSearchCnahged: searchAlgoritm
            }
        };

        // Item for search element in model
        var searchItem = {
            componentName:"Input",
            property: {
                placeholderTextInput: "Enter text for search",
                height: 0,
                btnVisible: false,
                visible: false
            },
            publish: {
                changed: "textForSearchCnahged"
            },
            subscribe: {
                showSearchFild: function(){
                    this.height = 40;
                    this.visible = true;
                    this.focus = true
                },
                hiddenSearchFild: function(){
                    this.height = 0;
                    this.visible = false;
                    this.focus = false
                    this.textInput = "";
                    filteredModel = [];
                },
            }
        }

        // Main element container
        // It has two subscribed action. This action publish pupup item.
        var item = [{
                        componentName: "Item",
                        property: {
                            height: parentHeight
                        },
                        elements: [
                            popupItem,
                            headerOfStackView,
                            {componentName:"Line"},
                            searchItem,
                            {componentName: "StackView",
                                property: {
                                    height: parentHeight
                                },
                                elements: [listOfStackView],
                                publish: {
                                    depthChanged: "stackDepthChanged",
                                },
                                subscribe: {
                                    itemChanged: function(){
                                        this.pop();
                                    },
                                    itemInserted: function() {
                                        this.pop();
                                    },
                                    itemChanging: function(publisher) {
                                        currentIndexItemList = publisher.currentIndex;
                                        var editItem = todoListEditItemPage();
                                        editItem[0].elements[0].property.textInput = todoModel[currentIndexItemList].name;
                                        createPage(editItem, this)
                                    },
                                    itemAdd: function() {
                                        createPage(todoListAddItemPage(), this)
                                    },
                                    stackPop:function() {
                                        this.pop();
                                    }
                                }
                            }],
                        subscribe: {
                            showPopupItem: function(){
                                this.opacity = 0.2
                            },
                            closedPopup: function() {
                                this.opacity = 1.0
                            }
                        }
                    }];

        return item;
    };

    // The additional item, which is created after emit signal to edit item of model
    var todoListEditItemPage = function(){
        var changeItem = [{
                              componentName: "Item",
                              elements: [{
                                      componentName:"Input",
                                      property: {
                                          btnText: "Change"
                                      },
                                      publish: {
                                          add: "itemChanged",
                                      }
                                  }]
                          }];

        return changeItem;
    };

    // The additional item, which is created after emit signal to add item to the model
    var todoListAddItemPage = function(){
        var inputNewItem = [{
                                componentName: "Item",
                                elements: [{
                                        componentName:"Input",
                                        property: {
                                            placeholderTextInput: "Enter text for searching",
                                            btnText: "Add"
                                        },
                                        publish: {
                                            add: "itemInserted",
                                        },
                                        subscribe: {
                                            stackPop: function (publisher) {
                                                for(var key in inputNewItem.subscribe) {
                                                    publisher.observer.algorithm.unsubscribe(key, inputNewItem.subscribe[key], this)
                                                }
                                            }
                                        }
                                    }]
                            }];

        return inputNewItem;
    };

    //The function for create main item and safe height of parent for the main item
    var start = function (parent){
//        parentHeight = parent.height;

        createPage(todoListItemsPage(), parent);
    }

    // The interface of todoList module
    return {
        start: start
    }
})()
