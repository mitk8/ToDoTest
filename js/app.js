function initBackendless(){
  const APP_ID = '2ABBA567-729D-C36E-FF11-05FC07B91600';
  const API_KEY = '1BBCEB8A-2CC0-4133-B6E9-F79CFCE8C174';

  Backendless.serverURL = 'https://api.backendless.com';
  Backendless.initApp(APP_ID, API_KEY);
 }

 const todoTable = Backendless.Data.of('todoTable');
 initBackendless();

//PAGE ELEMENTS
const todoListUl = document.getElementById("todoListUl");
const completListUl = document.getElementById("completListUl");
const todoListLi = document.querySelector('.todoListLi');
const newItemInput = document.getElementById("newItemInput");
const addItemButton = document.getElementById("addItemButton");
const moveUpButton = document.querySelector('.moveUp');
const moveDownButton = document.querySelector('.moveDown');
const editButton = document.querySelector('.editItem');
const btnUpDown = document.getElementById("btnUpDown");
const clearAll = document.getElementById("clearAll");
const noToDos = document.getElementById('noToDos');
let editingEvent;
//MODAL ELEMENTS
const saveChangesButton = document.querySelector('#saveChanges');
const toDoValueInput = document.querySelector('#toDoValue');

const buttonsToLi = `
<div>
    <div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
      <button type="button" class="btn btn-secondary moveUp">Up</button>
      <button type="button" class="btn btn-secondary moveDown">Down</button>
    </div>
    <button type="button" class="btn btn-sm btn-primary editing" data-toggle="modal" data-target="#editItem">Edit</button>
</div>
`;

let upNo = `
<div>
    <div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
      <button type="button" class="btn btn-secondary moveUp disabled">Up</button>
      <button type="button" class="btn btn-secondary moveDown">Down</button>
    </div>
    <button type="button" class="btn btn-sm btn-primary editing" data-toggle="modal" data-target="#editItem">Edit</button>
</div> 
`;

let downNo = `
<div>
    <div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
      <button type="button" class="btn btn-secondary moveUp">Up</button>
      <button type="button" class="btn btn-secondary moveDown disabled">Down</button>
    </div>
    <button type="button" class="btn btn-sm btn-primary editing" data-toggle="modal" data-target="#editItem">Edit</button>
</div> 
`;

let bothNo = `
<div>
    <div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
      <button type="button" class="btn btn-secondary moveUp disabled">Up</button>
      <button type="button" class="btn btn-secondary moveDown disabled">Down</button>
    </div>
    <button type="button" class="btn btn-sm btn-primary editing" data-toggle="modal" data-target="#editItem">Edit</button>
</div> 
`;
//EVENT HANDLERS

addItemButton.addEventListener('click', () => {
  createNewTodoItem(newItemInput.value);
  
});

newItemInput.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {
  createNewTodoItem(newItemInput.value);
  
  }
});


todoListUl.addEventListener('click', (event) => {

     if (event.target.classList.contains("moveUp")) {
      let li = event.target.parentNode.parentNode.parentNode.parentNode.parentNode;
      let prevLi = li.previousElementSibling;
      let ul = li.parentNode;
       
      if (prevLi) {
        ul.insertBefore(li, prevLi);
      }
      checkIfMoveButtonsNeedRemove();
     }
    
     if (event.target.classList.contains("moveDown")) {
      let li = event.target.parentNode.parentNode.parentNode.parentNode.parentNode;
      console.log(li);
      let nextLi = li.nextElementSibling;
      let ul = li.parentNode;
      
      if (nextLi) {
       ul.insertBefore(nextLi, li);
      }
      checkIfMoveButtonsNeedRemove();
     }

     if (event.target.className == 'form-check-input') {
        let li = event.target.parentNode.parentNode.parentNode;
        let ul = li.parentNode;
        ul.removeChild(li);
        li.children[0].removeChild(li.children[0].children[1]);
        completListUl.appendChild(li);
        checkIfClearButtonIsNeeded();
        checkIfNoToDoLabelIsNeeded();
        checkIfMoveButtonsNeedRemove();
        changeState('complete', li.querySelector("label").id)
     }
     
     if (event.target.className == 'btn btn-sm btn-primary editing'){
      
      editingEvent = event.target.parentNode.parentNode.parentNode.children[0].children[1];
      console.log(`EditingEvent ${editingEvent}`)
      toDoValueInput.value = editingEvent.textContent;

      let reminder = document.querySelector('#todoHelp');
      let showAllGood = document.querySelector('#changesSavedAllGood');
      showAllGood.className = 'form-text text-success d-none';
      reminder.className = 'form-text text-muted';

     }
});

completListUl.addEventListener('click', (event) => {

  if (event.target.className == 'form-check-input') {
     let li = event.target.parentNode.parentNode.parentNode;
     let ul = li.parentNode;
     ul.removeChild(li);
     let addButtonsBack = li.children[0].innerHTML;
     addButtonsBack += buttonsToLi
     li.children[0].innerHTML = addButtonsBack;
     todoListUl.appendChild(li);
    changeState('notComplete', li.querySelector("label").id);
    li.querySelector('input').checked = false;
     clearAll.style.display = 'block';
     checkIfClearButtonIsNeeded();
     checkIfNoToDoLabelIsNeeded();
     checkIfMoveButtonsNeedRemove();
  }

});


clearAll.addEventListener('click', () => {
  let completeItems = completListUl.children;
  while (completeItems[0]){
    completListUl.removeChild(completeItems[0]);
  }
  checkIfClearButtonIsNeeded();

  deleteItem();
});

saveChangesButton.addEventListener('click', () => {
  if (toDoValueInput.value != '' && toDoValueInput.value != editingEvent.textContent) {
    console.log(editingEvent.parentNode.querySelector('label').id)

    editingEvent.textContent = toDoValueInput.value;
    changeValue(toDoValueInput.value, editingEvent.parentNode.querySelector('label').id)
  let reminder = document.querySelector('#todoHelp');
  let showAllGood = document.querySelector('#changesSavedAllGood');
  showAllGood.className = 'form-text text-success';
  reminder.className = 'd-none';
}
});
//FUNCTIONS FOR REUSE
function checkIfClearButtonIsNeeded(){
if (completListUl.children.length === 0){ 
  clearAll.className = 'btn btn-danger mt-2 d-none';
} else {
  clearAll.className= 'btn btn-danger mt-2';
}
}

function checkIfNoToDoLabelIsNeeded(){
  if (todoListUl.children.length === 0){ 
    noToDos.style.display = 'inline-block';
  } else {
    noToDos.style.display = 'none';
  }
}

function createNewTodoItem (value, ObId) {
  let savedObjId;
  if (!ObId){
    if (value) {


    var todoElement = {
      value:`${value}`,
      type:"notComplete",
  }
    Backendless.Data.of( "todoTable" ).save( todoElement )
    .then( function( savedObject ) {
      savedObjId = savedObject.objectId;
      let newLi = document.createElement('li');
      newLi.className = 'list-group-item todoListLi';
      newLi.innerHTML = `
        <div class="form-group form-check d-flex justify-content-between align-items-center">
          <div>
            <input type="checkbox" class="form-check-input" id="done">
            <label class="form-check-label" for="exampleCheck1" id="${savedObjId}">${value}</label>
          </div>
          ${buttonsToLi}
        </div>
    `;
    todoListUl.appendChild(newLi);
    checkIfClearButtonIsNeeded();
    checkIfNoToDoLabelIsNeeded();
    checkIfMoveButtonsNeedRemove();
      })
    .catch( function( error ) {
        console.log( "an error has occurred " + error.message );
      });
    newItemInput.value = '';
    }
  } else {
    let newLi = document.createElement('li');
      newLi.className = 'list-group-item todoListLi';
      newLi.innerHTML = `
        <div class="form-group form-check d-flex justify-content-between align-items-center">
          <div>
            <input type="checkbox" class="form-check-input" id="done">
            <label class="form-check-label" for="exampleCheck1" id="${ObId}">${value}</label>
          </div>
          ${buttonsToLi}
        </div>
    `;
    todoListUl.appendChild(newLi);
    checkIfClearButtonIsNeeded();
    checkIfNoToDoLabelIsNeeded();
    checkIfMoveButtonsNeedRemove();
  }
}


function checkIfMoveButtonsNeedRemove() {
  
  for (let i = 0; i < todoListUl.children.length; i++) {

    console.log("Checking which buttons to do:");
    console.log(todoListUl.children[i].children[0].children[1]);

      let li = todoListUl.children[i].children[0].children[1];
      li.innerHTML = buttonsToLi;
    
    if (todoListUl.children[i] == todoListUl.firstElementChild) {
      console.log("It's first");
      let li = todoListUl.children[i].children[0].children[1];
      li.innerHTML = upNo;
    } 
    
    if (todoListUl.children[i] == todoListUl.lastElementChild) {
      console.log("It's last");
      let li = todoListUl.children[i].children[0].children[1];
      li.innerHTML = downNo;
    } 
    
    if (todoListUl.children[i] == todoListUl.lastElementChild && todoListUl.children[i] == todoListUl.firstElementChild) {
      console.log("It's middle");
      let li = todoListUl.children[i].children[0].children[1];
      li.innerHTML = bothNo;
    } 
  }
}

function loadItems(){

  Backendless.Data.of( "todoTable" ).find()
  .then( function( result ) {
     // every loaded object from the "Contact" table is now an individual untyped
     // JS object in the "result" array
     for (let i = 0; i < result.length; i++) {
       if (result[i].type == "notComplete"){
        createNewTodoItem(result[i].value, result[i].objectId);
       } else {
        let newLi = document.createElement('li');
        newLi.className = 'list-group-item todoListLi';
        newLi.innerHTML = `
        <div class="form-group form-check d-flex justify-content-between align-items-center">
          <div>
            <input type="checkbox" class="form-check-input" id="done" checked>
            <label class="form-check-label" for="exampleCheck1" id="${result[i].objectId}">${result[i].value}</label>
          </div>
        </div>
    `;
    completListUl.appendChild(newLi);
       }
        
      }
     
      checkIfClearButtonIsNeeded();
      checkIfNoToDoLabelIsNeeded();
      checkIfMoveButtonsNeedRemove();
      console.log(`todoLength = ${todoListUl.children.length}`)
   })
  .catch( function( error ) {
    // an error has occurred, the error code can be retrieved with fault.statusCode
   });
}

function deleteItem () {
  Backendless.Data.of( "todoTable" ).bulkDelete( "type = 'complete'" )
 .then( function( objectsDeleted ) {
    console.log("Complete are deleted!")
  })
 .catch( function( error ) {
    console.log("Cannot delete completed!")
  });
}

function retrieveObjectFrom(li){
  let objectIdFromLabel = li.children[0].children[0].children[1].id;
  console.log(objectIdFromLabel);
  Backendless.Data.of( "todoTable" ).findById( {objectId: objectIdFromLabel} )
 .then( function( contactObject ) {
    // contact instance has been found by its objectId
    return contactObject
  })
 .catch( function( error ) {
    // an error has occurred, the error code can be retrieved with fault.statusCode
    return null
  });
}

function changeValue(value, objId){
  
  Backendless.Data.of( "todoTable" ).findById( {objectId: objId} )
  .then( function( contactObject ) {
     // contact instance has been found by its objectId
     contactObject.value = value;
     Backendless.Data.of( "todoTable" ).save( contactObject )
  .then( function( savedObject ) {
      console.log( "Contact instance has been updated" );
    })
  .catch( function( error ) {
      console.log( "an error has occurred " + error.message );
    });
   })
  .catch( function( error ) {
     // an error has occurred, the error code can be retrieved with fault.statusCode
     return null
   });
}

function changeState(state, objId){
  
  Backendless.Data.of( "todoTable" ).findById( {objectId: objId} )
  .then( function( contactObject ) {
     // contact instance has been found by its objectId
     contactObject.type = state;
     Backendless.Data.of( "todoTable" ).save( contactObject )
  .then( function( savedObject ) {
      console.log( "Contact instance has been updated" );
    })
  .catch( function( error ) {
      console.log( "an error has occurred " + error.message );
    });
   })
  .catch( function( error ) {
     // an error has occurred, the error code can be retrieved with fault.statusCode
     return null
   });
}

//WHEN LOADS
loadItems();


// checkIfClearButtonIsNeeded();
// checkIfNoToDoLabelIsNeeded();
// checkIfMoveButtonsNeedRemove();