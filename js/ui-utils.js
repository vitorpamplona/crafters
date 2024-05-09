function toggleEdit(ev, currentValueFn, setNewValueFn, editObject) {
    let id = ev.target.id
    let current = currentValueFn();
    let editorId = id + 'editor';
    let editorComponent = "#" + editorId;
    let currentCode = $("#"+id).html()
    $("#"+id).html('');
    editObject
        .attr({
            'class': 'cool-field-area',
            'id': editorId,
            'rows': 5,
        })
        .on("focusout", function () {
            let newValue = $(editorComponent).val()
            console.log(current, newValue)
            if (current != newValue)
                setNewValueFn(newValue)
            else {
                // cancels
                $("#"+id).html(currentCode);
                $(editorComponent).remove()
            }
        })
        .on("click", function (ev1) {
            ev1.stopPropagation();
        })
        .on("keyup", function (ev2) {
            if (ev2.which == 13) this.blur();
            if (ev2.which == 17) this.blur();
        })
        .appendTo("#"+id);
    
    $(editorComponent).val(current)
    $(editorComponent).focus();

    ev.stopPropagation();
}

function toggleTextArea(ev, currentValueFn, setNewValueFn) {
    let obj = $('<textarea></textarea>')
    toggleEdit(ev, currentValueFn, setNewValueFn, obj)
}

function toggleTextEditBase(ev, currentValueFn, setNewValueFn, typeOfField) {
    let obj = $('<input></input>').attr({
        'type': typeOfField
    })

    toggleEdit(ev, currentValueFn, setNewValueFn, obj)
}

function toggleTextEdit(ev, currentValueFn, setNewValueFn) {
    toggleTextEditBase(ev, currentValueFn, setNewValueFn, "text")
}

function toggleDateTextEdit(ev, currentValueFn, setNewValueFn) {
    toggleTextEditBase(ev, currentValueFn, (dateStr) => { 
        let parsed = Date.parse(dateStr)
        if (isNaN(parsed)) {
            setNewValueFn("")
        } else {
            let local = new Date(Date.parse(dateStr)).fromDateInputValue()
            console.log(local)
            setNewValueFn((local/1000).toString())
        }
    }, "date")
}

function initAdd(hoverBase, addHost, onClick, placeHolder) {
    let inputId = addHost.replace("#", "input")
    let buttonId = addHost.replace("#", "button")

    let div = $('<div></div>')
    div.attr({ 'class': 'add-button row' })

    let input = $('<input></input>')
    input.attr({ 'type': 'text', 'class': 'cool-field-small space-right', 'id': inputId, 'placeholder':placeHolder })
    input.appendTo(div);

    let button = $('<button></button>')
    button.attr({ 'id': buttonId })
    button.on("click", function (ev) {
        onClick($("#" + inputId).val())
        $("#" + inputId).val("")
    })
    button.text("Add")
    button.appendTo(div);

    div.appendTo(addHost);

    $(hoverBase).addClass("add-marker")
}

function initDelete(hoverBase, buttonHost, onClick) {
    let button = $('<button></button>')
    button.attr({ 'class': 'delete-button space-left'})
    button.on("click", function(ev) {
        onClick()
        ev.stopPropagation();
    })
    button.text("Del")
    button.appendTo(buttonHost);

    $(hoverBase).addClass("delete-marker")
}