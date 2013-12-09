var notes
var noteList = document.getElementById('notes');
var noteNodes = document.getElementsByClassName("entry");
var noteField = document.getElementById("newNote");
var warning = document.getElementById("warning");
chrome.storage.sync.get("notes", function(result){
    notes = result.notes
    if(!notes){
        notes = [];
        console.log("notes initialized!");
    }
    else{
        notes = JSON.parse(notes);
    }
    for(var i = 0; i < notes.length; i++){
        noteLogic.update(notes[i]);
    }
});

var noteLogic = {
    deleteMode: 0,
    editing: undefined,
    createNote: function(text){
        if(this.deleteMode){
            deleteToggle();
        }
        value = text.value;
        text.value = "";
        text = value;
        if(text == ""){
            return;
        }
        if(notes.length >=512){
            warning.innerHTML = "Max Notes Reached! Try Deleting Some.";
            return;
        }
        notes.push(text);
        chrome.storage.sync.set({"notes": JSON.stringify(notes)});
        this.update(text);
    },
    update: function(text){
        var notecont = document.createElement('li');
        notecont.className = "entry";
        notecont.appendChild(document.createTextNode(text));
        notecont.appendChild(document.createElement('hr'));
        notecont.onclick= function(event){
            noteLogic.editNote(event.target);
        }
        if(noteList.innerHTML == ""){
            noteList.appendChild(notecont);
        }
        else{
            noteList.insertBefore(notecont, noteList.childNodes[0]);
        }
    },
    deleteToggle: function(){
            if(this.deleteMode){

                this.deleteMode = 0;
                warning.innerHTML = "Click Note to Edit";
                warning.style.color = "black";
                for(var i = 0; i < noteNodes.length; i++){
                        noteNodes[i].onclick = function(event){noteLogic.editNote(event.target)};
                }
            }
            else{
                if(this.editing){
                    this.editing = undefined;
                    noteField.value = "";
                }
                this.deleteMode = 1;
                warning.innerHTML="Click Note to Delete";
                warning.style.color = "red";
                for(var i = 0; i < noteNodes.length; i++){
                    noteNodes[i].onclick = function(event){
                        noteLogic.deleteNote(event.target);
                    }
                }
            }
    },
    editNote: function(noteElement){
        if(this.editing){
            return;
        }
        this.editing = noteElement;
        noteField.value = cleanNote(noteElement.innerHTML);
        noteField.focus();
    },
    deleteNote: function(noteElement){
                        console.log(noteElement);
                        noteList.removeChild(noteElement);
                        removed = cleanNote(noteElement.innerHTML);
                        notes.splice(notes.indexOf(removed), 1);
                        chrome.storage.sync.set({"notes": JSON.stringify(notes)});

        }

}

function cleanNote(object){
    return object.split("<hr>").slice(0,object.split("<hr>").length-1).join();
}

document.getElementById("save").onclick = function(){
    if(noteLogic.editing){
        noteLogic.deleteNote(noteLogic.editing);
        noteLogic.editing = undefined;
    }
        noteLogic.createNote(noteField)
    ;}

document.getElementById("delete").onclick = function(){noteLogic.deleteToggle();}

noteField.onkeydown = function(e){
    if(e.keyCode == 13 && !e.shiftKey){
        if(noteLogic.editing){
            noteLogic.deleteNote(noteLogic.editing);
            noteLogic.editing = undefined;
        }
        noteLogic.createNote(noteField);
        noteField.blur();
    }
}

