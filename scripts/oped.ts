type OpEdData = {
    'id': string,
    'operation': OpEdOperation,
};

type OpEdOperation = 'markRead' | 'remove' | 'archive' | 'annotate';

type OpEdSuccessResponseHandler = (data: OpEdData) => void;

const getAssociatedOpEdId= function(event: Event): string {
    const target = event.target as HTMLButtonElement;
    const parentElement = target.parentNode as HTMLElement;
    const id = parentElement.getAttribute('id') as string;
    return id;
}

const removeOpEd = function removeArticle(data:OpEdData){
    const element = document.getElementById(data.id);
    if(element != null){
        element.parentNode!.removeChild(element);
    }
};

const postDataToOpEd = function postData(url:string, data:OpEdData, onSuccess:OpEdSuccessResponseHandler){
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(function() {
        console.log(data.id);
        onSuccess(data);
    }).catch(error => {
        console.error('Encountered error while posting data.', error);
        document.getElementById('errorMessage')!.style.display = "block";
    });
};

const readPostButtonClicked = function(event: Event){
    const id = getAssociatedOpEdId(event);
    const data = {'operation':'markRead' as OpEdOperation, 'id':id};
    postDataToOpEd('/oped',data,removeOpEd);
};

const removePostButtonClicked = function(event: Event){
    const id = getAssociatedOpEdId(event);
    const data = {'operation':'remove' as OpEdOperation, 'id':id};
    postDataToOpEd('/oped',data,removeOpEd);
};

const addAnnotateToPostButtonClicked = function(){
    const notesContainer = document.getElementById("notesContainer");
    if(notesContainer == null){
        return;
    }
    const id = notesContainer.getAttribute("associatedId") as string;
    const tags = (<HTMLInputElement>document.getElementById("tags")).value;
    const notes = (<HTMLInputElement>document.getElementById("notes")).value;
    const data = {'operation':'annotate' as OpEdOperation, 'id':id, 'tags':tags, 'notes':notes};
    postDataToOpEd('/oped',data,()=>{
        notesContainer!.style.display = "none";
        (<HTMLInputElement>document.getElementById("tags")).value = "";
        (<HTMLInputElement>document.getElementById("notes")).value ="";
    });
};
const annotatePostButtonClicked = function(event: Event){
    const id = getAssociatedOpEdId(event);
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

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("addAnnotationButton")!.addEventListener("click",addAnnotateToPostButtonClicked);
    const markReadButtons = document.querySelectorAll("input.readButton");
    markReadButtons.forEach(function(markReadButton:Element){
        markReadButton.addEventListener("click", readPostButtonClicked);
    });
    const removeButtons = document.querySelectorAll("input.removeButton");
    removeButtons.forEach(function(removeButton:Element){
        removeButton.addEventListener("click", removePostButtonClicked);
    });
    const annotateButtons = document.querySelectorAll("input.annotateButton");
    annotateButtons.forEach(function(annotateButton:Element){
        annotateButton.addEventListener("click", annotatePostButtonClicked);
    });
    const archiveButtons = document.querySelectorAll("input.archiveButton");
    archiveButtons.forEach(function(archiveButton:Element){
        archiveButton.addEventListener("click", archiveButtonClicked);
    });
    document.getElementById("errorMessage")!.addEventListener("click",dismissPostAlert);
    document.getElementById("notesCloseButton")!.addEventListener("click",dismissPostNotes);
    document.getElementById("notesCrossButton")!.addEventListener("click",dismissPostNotes);
});