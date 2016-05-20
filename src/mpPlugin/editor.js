"use strict";
var Widget = require('./../ui/widget').Widget;
var util = require('../util');
var Template = require('./template').Template;
var $ = util.$;
var _t = util.gettext;
var Promise = util.Promise;
var NS = "annotator-editor";

// bring storage in
var HttpStorage = require('../storage').HttpStorage;

// id returns an identifier unique within this session
var id = (function () {
    var counter;
    counter = -1;
    return function () {
        return counter += 1;
    };
}());



// preventEventDefault prevents an event's default, but handles the condition
// that the event is null or doesn't have a preventDefault function.
function preventEventDefault(event) {
    if (typeof event !== 'undefined' &&
        event !== null &&
        typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
}


// Public: Creates an element for editing annotations.
//var mpEditor = exports.mpEditor = Editor.extend({
var mpEditor = exports.mpEditor = Widget.extend({

    constructor: function (options) {
        Widget.call(this, options);
        var editorSelf = this;
        this.fields = [];
        this.annotation = {};
        console.log("[INFO] mpeditor - constructor");

        if (this.options.defaultFields) {

            this.addField({
                type: 'div',
                label: _t('Comments') + '\u2026',
                id: 'quote',
                load: function (field, annotation, annotations) {
                    
                    var editorType = $("#mp-editor-type").html();
                    var annotationId = $("#mp-annotation-work-on").html();
                    console.log("mpeditor load annotation:");
                    console.log(annotation);

                    // load MP Claim
                    if(editorType == "claim"){

                        console.log("mpeditor - load - claim");
                        var claim = annotation.argues;                       
                        
                        $('#quote').empty();
                        var quoteobject = $("<div id='quotearea'/>");
                        $('#quote').append(quoteobject);
                        $('#quotearea').html(claim.hasTarget.hasSelector.exact || '');
                        $('#Drug1 option').remove();
                        $('#Drug2 option').remove();
                        var flag = 0;
                        
                        var anns = annotations.slice();
                        
                        var quoteobject = $('#quotearea');
                        var quotecontent = $('#quotearea').html();

                        var index = 0;
                        var list = [];
                        //filter out duplicates
                        for (var i = 0, len = anns.length; i < len; i++) {
                            if ((anns[i].annotationType == "DrugMention") && (list.indexOf(anns[i].argues.hasTarget.hasSelector.exact) < 0)) {
                                list.push(anns[i].argues.hasTarget.hasSelector.exact);
                            }
                        }
                        //console.log(list);
                        
                        for (var i = 0, len = list.length; i < len; i++) {
                            if (quotecontent.indexOf(list[i]) >= 0) {
                                index++;
                                quotecontent = quotecontent.replace(list[i], "<span class='highlightdrug'>" + list[i] + "</span>");
                                $('#Drug1').append($('<option>', {
                                    value: list[i],
                                    text: list[i]
                                }));
                                $('#Drug2').append($('<option>', {
                                    value: list[i],
                                    text: list[i]
                                }));
                                flag = flag + 1;
                            }
                        }
                        quoteobject.html(quotecontent);
                        
                        if (flag < 1) {
                            alert("Should highlight at least one drug.");
                            editorSelf.cancel();
                            $('.btn-success').click();
                        }
                        // highlight drug selections on text quote
                        if (claim.qualifiedBy != null){
                            if (claim.qualifiedBy.drug1 != "") {
                                var quotestring = quoteobject.html();
                                quotestring = quotestring.replace(claim.qualifiedBy.drug1, "<span class='selecteddrug'>" + claim.qualifiedBy.drug1 + "</span>");
                                quoteobject.html(quotestring);
                                //console.log(quotestring);
                            }
                            if (claim.qualifiedBy.Drug2 != "") {
                                var quotestring = quoteobject.html();
                                quotestring = quotestring.replace(claim.qualifiedBy.Drug2, "<span class='selecteddrug'>" + claim.qualifiedBy.Drug2 + "</span>");
                                quoteobject.html(quotestring);
                                //console.log(quotestring);
                            }
                            
                            $(field).find('#quote').css('background', '#EDEDED');
                            var signal = 1;
                            
                            //load fields from annotation.claim
                            $("#Drug1 > option").each(function () {
                                if (this.value === claim.qualifiedBy.drug1) $(this).attr('selected', true);
                            });
                            $('#Drug2 > option').each(function () {
                                if (this.value === claim.qualifiedBy.drug2) $(this).attr('selected', true);
                            });
                            $('#relationship option').each(function () {
                                if (this.value === claim.qualifiedBy.relationship) { 
                                    $(this).attr('selected', true);
                                    signal = 0;
                                }
                            });
                            
                            if (signal == 1) {
                                $('#relationship option')[0].selected = "selected";
                            } else {
                                signal = 1;
                            }
                        
                            if(claim.qualifiedBy.relationship == "inhibits" || claim.qualifiedBy.relationship == "substrate of")
                            {
                                // show enzyme field if relationship is inhibits or substrate of
                                $(document).ready(function() { showEnzyme(); });
                            $('#enzyme option').each(function () {
                                if (this.value === claim.qualifiedBy.enzyme) {
                                    $(this).attr('selected', true);
                                    signal = 0;
                                }
                            });
                                if (signal == 1) {
                                    $('#enzyme option')[0].selected = "selected";
                                } else {
                                    signal = 1;
                                }
                            }                                                
                        }
                        
                    } 

                    // load MP list of data 
                    if (annotation.argues.supportsBy.length > 0) {

                        console.log("mp editor load data");
                        // load first data for testing 
                        $("#participants").val(annotation.argues.supportsBy[0].supportsBy.supportsBy.participants.value);                                                 
                        $("#drug1Dose").val(annotation.argues.supportsBy[0].supportsBy.supportsBy.drug1Dose.value);
                        $("#drug1Duration").val(annotation.argues.supportsBy[0].supportsBy.supportsBy.drug1Dose.duration);
                        $("#drug1Formulation > option").each(function () {
                            if (this.value === annotation.argues.supportsBy[0].supportsBy.supportsBy.drug1Dose.formulation) {
                                $(this).attr('selected', true);                                                  }
                        });
                        $("#drug1Regimens > option").each(function () {
                            if (this.value === annotation.argues.supportsBy[0].supportsBy.supportsBy.drug1Dose.regimens) {
                                $(this).attr('selected', true);                                                  }
                        });
                        
                        $("#drug2Dose").val(annotation.argues.supportsBy[0].supportsBy.supportsBy.drug2Dose.value);
                        $("#drug2Duration").val(annotation.argues.supportsBy[0].supportsBy.supportsBy.drug2Dose.duration);
                        $("#drug2Formulation > option").each(function () {
                            if (this.value === annotation.argues.supportsBy[0].supportsBy.supportsBy.drug2Dose.formulation) {
                                $(this).attr('selected', true);                                                  }
                        });
                        $("#drug2Regimens > option").each(function () {
                            if (this.value === annotation.argues.supportsBy[0].supportsBy.supportsBy.drug2Dose.regimens) {
                                $(this).attr('selected', true);                                                  }
                        });
                    } else { // clean data editor
                        $("#participants").empty();
                        $("#drug1Dose").empty();
                        $("#drug1Duration").empty();
                        $("#drug1Formulation")[0].selectedIndex = -1;
                        $("#drug1Regimens")[0].selectedIndex = -1;
                        $("#drug2Dose").empty();
                        $("#drug2Duration").empty();
                        $("#drug2Formulation")[0].selectedIndex = -1;
                        $("#drug2Regimens")[0].selectedIndex = -1;
                    }
                    
                },
                
                submit:function (field, annotation) {

                    var editorType = $("#mp-editor-type").html();
                    var annotationId = $("#mp-annotation-work-on").html();

                    console.log("mpeditor - submit - type: " + editorType);
                    console.log(annotation);

                    if (editorType == "claim"){

                        // MP Claim
                        if($('#Drug1 option:selected').text()==$('#Drug2 option:selected').text()){
                            alert("Should highlight two different drugs.");
                            editorSelf.cancel();
                            $('.btn-success').click();
                        }
                        
                        annotation.annotationType = "MP";
                    
                        // MP argues claim, claim qualified by ?s ?p ?o
                        var qualifiedBy = {drug1 : "", drug2 : "", relationship : "", enzyme : ""};                    
                        qualifiedBy.drug1 = $('#Drug1 option:selected').text();
                        qualifiedBy.drug2 = $('#Drug2 option:selected').text();
                        qualifiedBy.relationship = $('#relationship option:selected').text();
                        var claimStatement = qualifiedBy.drug1 + "_" + qualifiedBy.relationship + "_" + qualifiedBy.drug2;
                        
                        if(qualifiedBy.relationship == "inhibits" || qualifiedBy.relationship == "substrate of") {
                            qualifiedBy.enzyme = $('#enzyme option:selected').text();
                        } 
                        annotation.argues.qualifiedBy = qualifiedBy;
                        annotation.argues.type = "mp:claim";
                        annotation.argues.label = claimStatement;
                        annotation.argues.supportsBy = [];                       

                    } else if (annotationId != null && annotation.dataTarget != null && annotation.dataRanges != null) { 
                        // MP add data-method-material 
                        var partTmp = annotation.argues.supportsBy[0].supportsBy.supportsBy.participants;
                        if (partTmp.value != $('#participants').val()) {                            
                            partTmp.value = $('#participants').val();
                            // if field not binded with text, then assign current span to it
                            if (partTmp.ranges == null && partTmp.hasTarget == null) {
                                partTmp.ranges = annotation.dataRanges;                     
                                partTmp.hasTarget = annotation.dataTarget;                                
                            }
                            annotation.argues.supportsBy[0].supportsBy.supportsBy.participants = partTmp;
                            console.log("mpeditor - submit - update participants");
                        }

                        var dose1Tmp = annotation.argues.supportsBy[0].supportsBy.supportsBy.drug1Dose;
                        if (dose1Tmp.value != $('#drug1Dose').val() || dose1Tmp.formulation != $('#drug1Formulation option:selected').text() || dose1Tmp.duration != $('#drug1Duration').val() || dose1Tmp.regimens != $('#drug1Regimens option:selected').text()) {
                            console.log("mpeditor - submit - add dose1");                                           
                            dose1Tmp.value = $('#drug1Dose').val(); 
                            dose1Tmp.formulation = $('#drug1Formulation option:selected').text();
                            dose1Tmp.duration = $('#drug1Duration').val();
                            dose1Tmp.regimens = $('#drug1Regimens option:selected').text();
                            if (dose1Tmp.ranges == null && dose1Tmp.hasTarget == null) {
                                dose1Tmp.hasTarget = annotation.dataTarget;
                                dose1Tmp.ranges = annotation.dataRanges;
                            }
                            annotation.argues.supportsBy[0].supportsBy.supportsBy.drug1Dose = dose1Tmp;   
                            console.log("mpeditor - submit - update drug 1 dose");             
                        }

                        var dose2Tmp = annotation.argues.supportsBy[0].supportsBy.supportsBy.drug2Dose;
                        if (dose2Tmp.value != $('#drug2Dose').val() || dose2Tmp.formulation != $('#drug2Formulation option:selected').text() || dose2Tmp.duration != $('#drug2Duration').val() || dose2Tmp.regimens != $('#drug2Regimens option:selected').text()) {
                            console.log("mpeditor - submit - add dose2");                                           
                            dose2Tmp.value = $('#drug2Dose').val(); 
                            dose2Tmp.formulation = $('#drug2Formulation option:selected').text();
                            dose2Tmp.duration = $('#drug2Duration').val();
                            dose2Tmp.regimens = $('#drug2Regimens option:selected').text();
                            if (dose2Tmp.ranges == null && dose2Tmp.hasTarget == null) {
                                dose2Tmp.hasTarget = annotation.dataTarget;
                                dose2Tmp.ranges = annotation.dataRanges;
                            }
                            annotation.argues.supportsBy[0].supportsBy.supportsBy.drug2Dose = dose2Tmp;   
                            console.log("mpeditor - submit - update drug 2 dose");     
                        }
                        // clean current text selection
                        delete annotation.dataTarget;
                        delete annotation.dataRanges;
                    }
                    
                    // clean editor status
                    $("#mp-editor-type").html('');
                }                
            });            
        }
        
        var self = this;
        
        this.element
            .on("submit." + NS, 'form', function (e) {
                self._onFormSubmit(e);
            })
            .on("click." + NS, '.annotator-save', function (e) {
                self._onSaveClick(e);
            })
            .on("click." + NS, '.annotator-save-close', function (e) {
                self._onSaveClick(e);
                self.hide();
            })
            .on("click." + NS, '.annotator-cancel', function (e) {
                self._onCancelClick(e);
            })
            .on("mouseover." + NS, '.annotator-cancel', function (e) {
                self._onCancelMouseover(e);
            })
            .on("keydown." + NS, 'textarea', function (e) {
                self._onTextareaKeydown(e);
            });
    },



    destroy: function () {
        this.element.off("." + NS);
        Widget.prototype.destroy.call(this);
    },

    // Public: Show the editor.
    //
    // position - An Object specifying the position in which to show the editor
    //            (optional).
    //
    // Examples
    //
    //   editor.show()
    //   editor.hide()
    //   editor.show({top: '100px', left: '80px'})
    //
    // Returns nothing.
    show: function (position) {

        //if (typeof position !== 'undefined' && position !== null) {
        if (typeof position !== 'undefined') {
            this.element.css({
                //top: position.top,
                //left: position.left
                bottom:50,
                right:100
            });

            $( window ).resize(function() {
                $( "body" ).css('height','600px');
            });

            //console.log(window.screen.height);
            //console.log(window.screen.availHeight);
        }

        this.element
            .find('.annotator-save')
            .addClass(this.classes.focus);

        Widget.prototype.show.call(this);

        // give main textarea focus
        this.element.find(":input:first").focus();

        this._setupDraggables();
    },

    // Public: Load an annotation into the editor and display it.
    //
    // annotation - An annotation Object to display for editing.
    // position - An Object specifying the position in which to show the editor
    //            (optional).
    //
    // Returns a Promise that is resolved when the editor is submitted, or
    // rejected if editing is cancelled.
    load: function (position, annotation) {
        this.annotation = annotation;

        var claim = annotation.argues;        

        if(claim.hasTarget.hasSelector.exact.length>1600){
            alert("[INFO] Exceeding max lengh of text 1600!");
            $('.btn-success').click();
            this.cancel();
        }
        
        var annotations;
        if(getURLParameter("sourceURL")==null)
            var sourceURL = getURLParameter("file").trim();
        else
            var sourceURL = getURLParameter("sourceURL").trim();
        var source = sourceURL.replace(/[\/\\\-\:\.]/g, "")
        var email = getURLParameter("email");

        var queryObj = JSON.parse('{"uri":"'+source+'","email":"'+email+'"}');

        var annhost = config.annotator.host;

        // call apache for request annotator store
        var queryOptStr = '{"emulateHTTP":false,"emulateJSON":false,"headers":{},"prefix":"http://' + annhost + '/annotatorstore","urls":{"create":"/annotations","update":"/annotations/{id}","destroy":"/annotations/{id}","search":"/search"}}';

        var queryOptions = JSON.parse(queryOptStr);
        var storage = new HttpStorage(queryOptions);

        //console.log("editor call storage");
        var self = this;
        storage.query(queryObj)
            .then(function(data){
                annotations = data.results;
                for (var i = 0, len = self.fields.length; i < len; i++) {
                    var field = self.fields[i];
                    field.load(field.element, self.annotation,annotations);
                }
            });
        //console.log(r.length);

        var self = this;
        return new Promise(function (resolve, reject) {
            self.dfd = {resolve: resolve, reject: reject};
            self.show(position);
        });

    },

    // Public: Submits the editor and saves any changes made to the annotation.
    //
    // Returns nothing.
    submit: function () {
        for (var i = 0, len = this.fields.length; i < len; i++) {
            var field = this.fields[i];

            field.submit(field.element, this.annotation);
        }
        if (typeof this.dfd !== 'undefined' && this.dfd !== null) {
            this.dfd.resolve();
        }
        // submit will not hide the editor
        //this.hide();
    },

    // Public: Cancels the editing process, discarding any edits made to the
    // annotation.
    //
    // Returns itself.
    cancel: function () {
        if (typeof this.dfd !== 'undefined' && this.dfd !== null) {
            this.dfd.reject('editing cancelled');

            // clean editor status
            $("#mp-editor-type").html('');
        }
        this.hide();
    },

    // Public: Adds an additional form field to the editor. Callbacks can be
    // provided to update the view and anotations on load and submission.
    //
    // options - An options Object. Options are as follows:
    //           id     - A unique id for the form element will also be set as
    //                    the "for" attribute of a label if there is one.
    //                    (default: "annotator-field-{number}")
    //           type   - Input type String. One of "input", "textarea",
    //                    "checkbox", "select" (default: "input")
    //           label  - Label to display either in a label Element or as
    //                    placeholder text depending on the type. (default: "")
    //           load   - Callback Function called when the editor is loaded
    //                    with a new annotation. Receives the field <li> element
    //                    and the annotation to be loaded.
    //           submit - Callback Function called when the editor is submitted.
    //                    Receives the field <li> element and the annotation to
    //                    be updated.

    // Returns the created <li> Element.
    addField: function (options) {
        var field = $.extend({
            id: 'annotator-field-' + id(),
            type: 'input',
            label: '',
            load: function () {},
            submit: function () {}
        }, options);

        var input = null,
            element = $('<li class="annotator-item" />');


        field.element = element[0];

        if (field.type === 'textarea') {
            input = $('<textarea />');
        } else if (field.type === 'checkbox') {
            input = $('<input type="checkbox" />');
        } else if (field.type === 'input') {
            input = $('<input />');
        } else if (field.type === 'select') {
            input = $('<select />');
        } else if (field.type === 'div') {
            input = $('<div class = "quoteborder" />');
        }

        element.append(input);

        input.attr({
            id: field.id,
            placeholder: field.label
        });


        if (field.type === 'div') {
            input.attr({

                html: field.label
            });
        }

        if (field.type === 'checkbox') {
            element.addClass('annotator-checkbox');
            element.append($('<label />', {
                'for': field.id,
                'html': field.label
            }));
        }

        this.element.find('ul:first').append(element);
        this.fields.push(field);

        return field.element;
    },

    checkOrientation: function () {
        Widget.prototype.checkOrientation.call(this);

        var list = this.element.find('ul').first();
        var controls = this.element.find('.annotator-controls1');
        var tabs = this.element.find('#tabs');
        controls.insertAfter(tabs);
        /*if (this.element.hasClass(this.classes.invert.y)) {
         controls.insertBefore(list);
         } else if (controls.is(':first-child')) {
         controls.insertAfter(list);
         }*/

        return this;
    },

    // Event callback: called when a user clicks the editor form (by pressing
    // return, for example).
    //
    // Returns nothing
    _onFormSubmit: function (event) {
        preventEventDefault(event);
        this.submit();
    },

    // Event callback: called when a user clicks the editor's save button.
    //
    // Returns nothing
    _onSaveClick: function (event) {
        preventEventDefault(event);
        this.submit();
    },

    // Event callback: called when a user clicks the editor's cancel button.
    //
    // Returns nothing
    _onCancelClick: function (event) {
        preventEventDefault(event);
        this.cancel();
    },

    // Event callback: called when a user mouses over the editor's cancel
    // button.
    //
    // Returns nothing
    _onCancelMouseover: function () {
        this.element
            .find('.' + this.classes.focus)
            .removeClass(this.classes.focus);
    },

    // Event callback: listens for the following special keypresses.
    // - escape: Hides the editor
    // - enter:  Submits the editor
    //
    // event - A keydown Event object.
    //
    // Returns nothing
    _onTextareaKeydown: function (event) {
        if (event.which === 27) {
            // "Escape" key => abort.
            this.cancel();
        } else if (event.which === 13 && !event.shiftKey) {
            // If "return" was pressed without the shift key, we're done.
            this.submit();
        }
    },

    // Sets up mouse events for resizing and dragging the editor window.
    //
    // Returns nothing.
    _setupDraggables: function () {
        if (typeof this._resizer !== 'undefined' && this._resizer !== null) {
            this._resizer.destroy();
        }
        if (typeof this._mover !== 'undefined' && this._mover !== null) {
            this._mover.destroy();
        }

        this.element.find('.annotator-resize').remove();

        // Find the first/last item element depending on orientation
        var cornerItem;
        if (this.element.hasClass(this.classes.invert.y)) {
            cornerItem = this.element.find('.annotator-item:last');
        } else {
            cornerItem = this.element.find('.annotator-item:first');
        }

        /*if (cornerItem) {
            $('<span class="annotator-resize"></span>').appendTo(cornerItem);
        }*/

        //var controls = this.element.find('.annotator-controls')[0];
 /*        var   textarea = this.element.find('textarea:first')[0],
            resizeHandle = this.element.find('.annotator-resize')[0],
            self = this;

        this._resizer = resizer(textarea, resizeHandle, {
            invertedX: function () {
                return self.element.hasClass(self.classes.invert.x);
            },
            invertedY: function () {
                return self.element.hasClass(self.classes.invert.y);
            }
        });
*/
        //this._mover = mover(this.element[0], controls);
    }
});


mpEditor.template = Template.content;

// Configuration options
mpEditor.options = {
    // Add the default field(s) to the editor.
    defaultFields: true,
    appendTo: '.mpeditorsection'
};

// dragTracker is a function which allows a callback to track changes made to
// the position of a draggable "handle" element.
//
// handle - A DOM element to make draggable
// callback - Callback function
//
// Callback arguments:
//
// delta - An Object with two properties, "x" and "y", denoting the amount the
//         mouse has moved since the last (tracked) call.
//
// Callback returns: Boolean indicating whether to track the last movement. If
// the movement is not tracked, then the amount the mouse has moved will be
// accumulated and passed to the next mousemove event.
//
var dragTracker = exports.dragTracker = function dragTracker(handle, callback) {
    var lastPos = null,
        throttled = false;

    // Event handler for mousemove
    function mouseMove(e) {
        if (throttled || lastPos === null) {
            return;
        }

        var delta = {
            //y: e.pageY - lastPos.top,
            //x: e.pageX - lastPos.left
            y:200,
            x:200
        };
        //console.log(e.pageX);

        var trackLastMove = true;
        // The callback function can return false to indicate that the tracker
        // shouldn't keep updating the last position. This can be used to
        // implement "walls" beyond which (for example) resizing has no effect.
        if (typeof callback === 'function') {
            trackLastMove = callback(delta);
        }

        if (trackLastMove !== false) {
            lastPos = {
                //top: e.pageY,
                //left: e.pageX
                top:200,
                left:200
            };
        }

        // Throttle repeated mousemove events
        throttled = true;
        setTimeout(function () { throttled = false; }, 1000 / 60);
    }


    // Event handler for mouseup
    function mouseUp() {
        lastPos = null;
        $(handle.ownerDocument)
            .off('mouseup', mouseUp)
            .off('mousemove', mouseMove);
    }

    // Event handler for mousedown -- starts drag tracking
    function mouseDown(e) {
        if (e.target !== handle) {
            return;
        }

        lastPos = {
            //top: e.pageY,
            //left: e.pageX
            top:200,
            left:200
        };

        $(handle.ownerDocument)
            .on('mouseup', mouseUp)
            .on('mousemove', mouseMove);

        e.preventDefault();
    }

    // Public: turn off drag tracking for this dragTracker object.
    function destroy() {
        $(handle).off('mousedown', mouseDown);
    }

    $(handle).on('mousedown', mouseDown);

    return {destroy: destroy};
};


// resizer is a component that uses a dragTracker under the hood to track the
// dragging of a handle element, using that motion to resize another element.
//
// element - DOM Element to resize
// handle - DOM Element to use as a resize handle
// options - Object of options.
//
// Available options:
//
// invertedX - If this option is defined as a function, and that function
//             returns a truthy value, the horizontal sense of the drag will be
//             inverted. Useful if the drag handle is at the left of the
//             element, and so dragging left means "grow the element"
// invertedY - If this option is defined as a function, and that function
//             returns a truthy value, the vertical sense of the drag will be
//             inverted. Useful if the drag handle is at the bottom of the
//             element, and so dragging down means "grow the element"
var resizer = exports.resizer = function resizer(element, handle, options) {
    var $el = $(element);
    if (typeof options === 'undefined' || options === null) {
        options = {};
    }

    // Translate the delta supplied by dragTracker into a delta that takes
    // account of the invertedX and invertedY callbacks if defined.
    function translate(delta) {
        var directionX = 1,
            directionY = -1;

        if (typeof options.invertedX === 'function' && options.invertedX()) {
            directionX = -1;
        }
        if (typeof options.invertedY === 'function' && options.invertedY()) {
            directionY = 1;
        }

        return {
            x: delta.x * directionX,
            y: delta.y * directionY
        };
    }

    // Callback for dragTracker
    function resize(delta) {
        var height = $el.height(),
            width = $el.width(),
            translated = translate(delta);

        if (Math.abs(translated.x) > 0) {
            $el.width(width + translated.x);
        }
        if (Math.abs(translated.y) > 0) {
            $el.height(height + translated.y);
        }

        // Did the element dimensions actually change? If not, then we've
        // reached the minimum size, and we shouldn't track
        var didChange = ($el.height() !== height || $el.width() !== width);
        return didChange;
    }

    // We return the dragTracker object in order to expose its methods.
    return dragTracker(handle, resize);
};


// mover is a component that uses a dragTracker under the hood to track the
// dragging of a handle element, using that motion to move another element.
//
// element - DOM Element to move
// handle - DOM Element to use as a move handle
//
var mover = exports.mover = function mover(element, handle) {
    function move(delta) {
        $(element).css({
            top: parseInt($(element).css('top'), 10) + delta.y,
            left: parseInt($(element).css('left'), 10) + delta.x
        });
    }

    // We return the dragTracker object in order to expose its methods.
    return dragTracker(handle, move);
};