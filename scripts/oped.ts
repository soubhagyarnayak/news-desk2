const removeOpEd = function removeArticle(data:any){
    const element = document.getElementById(data.id);
    if(element != null){
        element.parentNode!.removeChild(element);
    }
};

const postDataToOpEd = function postData(url:string, data:any, onSuccess:Function){
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        console.log(data.id);
        onSuccess(data);
    }).catch(error => {
        console.error('Encountered error while posting data.', error);
        document.getElementById('errorMessage')!.style.display = "block";
    });
};

const readPostButtonClicked = function(event:any){
    const id = event.target.parentNode.getAttribute('id');
    const data = {'operation':'markRead', 'id':id};
    postData('/oped',data,removeArticle);
};

const removePostButtonClicked = function(event:any){
    const id = event.target.parentNode.getAttribute('id');
    const data = {'operation':'remove', 'id':id};
    postData('/oped',data,removeArticle);
};

const addAnnotateToPostButtonClicked = function(event:any){
    const notesContainer = document.getElementById("notesContainer");
    if(notesContainer == null){
        return;
    }
    const id = notesContainer.getAttribute("associatedId");
    const tags = (<HTMLInputElement>document.getElementById("tags")).value;
    const notes = (<HTMLInputElement>document.getElementById("notes")).value;
    const data = {'operation':'annotate', 'id':id, 'tags':tags, 'notes':notes};
    postData('/oped',data,()=>{
        notesContainer!.style.display = "none";
        (<HTMLInputElement>document.getElementById("tags")).value = "";
        (<HTMLInputElement>document.getElementById("notes")).value ="";
    });
};
const annotatePostButtonClicked = function(event:any){
    const id = event.target.parentNode.getAttribute('id');
    fetch(`oped/article?id=${id}`,{
        method: 'GET'
    }).then(function(response){
        return response.json();
    }).then(function(data){
        const notesContainer = document.getElementById("notesContainer");
        if(notesContainer != null){
            notesContainer.style.verticalAlign = "middle";
            notesContainer.style.display = "block";
            notesContainer.setAttribute("associatedId",id);
            console.log(data);
            (<HTMLInputElement>document.getElementById("tags")).value = data.tags||'';
            (<HTMLInputElement>document.getElementById('notes')).value = data.notes||'';
        }
    }).catch(error=>{
        console.error('Encountered error while getting annotations.', error);
        document.getElementById('errorMessage')!.style.display = "block";
    });
};

const dismissPostAlert = function dismissAlert(){
    document.getElementById('errorMessage')!.style.display = "none";
};
const dismissPostNotes = function dismissNotes(){
    document.getElementById('notesContainer')!.style.display = "none";
};

document.addEventListener("DOMContentLoaded", function(event){
    document.getElementById("addAnnotationButton")!.addEventListener("click",addAnnotateButtonClicked);
    const markReadButtons = document.querySelectorAll("input.readButton");
    markReadButtons.forEach(function(markReadButton:Element){
        markReadButton.addEventListener("click", readButtonClicked);
    });
    const removeButtons = document.querySelectorAll("input.removeButton");
    removeButtons.forEach(function(removeButton:Element){
        removeButton.addEventListener("click", removeButtonClicked);
    });
    const annotateButtons = document.querySelectorAll("input.annotateButton");
    annotateButtons.forEach(function(annotateButton:Element){
        annotateButton.addEventListener("click", annotateButtonClicked);
    });
    const archiveButtons = document.querySelectorAll("input.archiveButton");
    archiveButtons.forEach(function(archiveButton:Element){
        archiveButton.addEventListener("click", archiveButtonClicked);
    });
    document.getElementById("errorMessage")!.addEventListener("click",dismissAlert);
    document.getElementById("notesCloseButton")!.addEventListener("click",dismissNotes);
    document.getElementById("notesCrossButton")!.addEventListener("click",dismissNotes);
});