type Data = {
    'id': string,
    'operation': Operation,
};

type Operation = 'markRead' | 'remove' | 'archive' | 'annotate';

type SuccessResponseHandler = (data: Data) => void;

const removeArticle = function removeArticle(data:Data){
    const element = document.getElementById(data.id);
    if(element != null){
        const containerElement = element.closest(".articles-day-container");
        if(containerElement != null){
            const countElement = containerElement.querySelector(".article-day-count");
            if(countElement!=null && countElement.textContent != null){
                const count = parseInt(countElement.textContent);
                countElement.textContent = String(count-1);
            }
        }
        element.parentNode!.removeChild(element);
    }
};

const postData = function postData(url:string, data:Data, onSuccess:SuccessResponseHandler){
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        console.log(data.id);
        if(!response.ok){
            throw Error(response.statusText)
        }
        onSuccess(data);
    }).catch(error => {
        console.error('Encountered error while posting data.', error);
        document.getElementById('errorMessage')!.style.display = "block";
    });
};

const getAssociatedId= function(event: Event): string {
    const target = event.target as HTMLButtonElement;
    const parentElement = target.parentNode as HTMLElement;
    const id = parentElement.getAttribute('id') as string;
    return id;
}

const readButtonClicked = function(event: Event){
    const id = getAssociatedId(event);
    const data = {'operation':'markRead' as Operation, 'id':id};
    postData('/hn',data,removeArticle);
};

const removeButtonClicked = function(event: Event){
    const id = getAssociatedId(event);
    const data = {'operation':'remove' as Operation, 'id':id};
    postData('/hn',data,removeArticle);
};
const archiveButtonClicked = function(event: Event){
    const id = getAssociatedId(event);
    const data = {'operation':'archive' as Operation, 'id':id, 'url':"https://news.ycombinator.com/item?id="+id};
    postData('/hn',data,()=>{});
}
const addAnnotateButtonClicked = function(){
    const notesContainer = document.getElementById("notesContainer");
    if(notesContainer == null){
        return;
    }
    const id = notesContainer.getAttribute("associatedId") as string;
    const tags = (<HTMLInputElement>document.getElementById("tags")).value;
    const notes = (<HTMLInputElement>document.getElementById("notes")).value;
    const data = {'operation':'annotate' as Operation, 'id':id, 'tags':tags, 'notes':notes};
    postData('/hn',data,()=>{
        notesContainer!.style.display = "none";
        (<HTMLInputElement>document.getElementById("tags")).value = "";
        (<HTMLInputElement>document.getElementById("notes")).value ="";
    });
};
const annotateButtonClicked = function(event: Event){
    const id = getAssociatedId(event);
    fetch(`hn/article?id=${id}`,{
        method: 'GET'
    }).then(function(response){
        return response.json();
    }).then(function(data){
        const notesContainer = document.getElementById("notesContainer");
        if(notesContainer != null){
            notesContainer.style.verticalAlign = "middle";
            notesContainer.style.display = "block";
            notesContainer.setAttribute("associatedId",id);
            (<HTMLInputElement>document.getElementById("tags")).value = data.tags||'';
            (<HTMLInputElement>document.getElementById('notes')).value = data.notes||'';
            document.getElementById("availableTags")!.textContent = document.getElementById("tags")!.getAttribute("data-tags")!.split(" ").join(",");
        }
    }).catch(error=>{
        console.error('Encountered error while getting annotations.', error);
        document.getElementById('errorMessage')!.style.display = "block";
    });
};

const dismissAlert = function dismissAlert(){
    document.getElementById('errorMessage')!.style.display = "none";
};
const dismissNotes = function dismissNotes(){
    document.getElementById('notesContainer')!.style.display = "none";
};

const tagKeyDown = function tagKeyDown(event: KeyboardEvent){
    if( event.isComposing || event.key == 'Process'){
        return;
    }
    const target = event.target as HTMLTextAreaElement;
    const text = target.value as string;
    const tags:string = target.getAttribute("data-tags") as string;
    document.getElementById("availableTags")!.textContent = tags.split(",").filter(x=>x.startsWith(text)).join(",");
}

document.addEventListener("DOMContentLoaded", function(){
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
    document.getElementById("tags")!.addEventListener("keydown",tagKeyDown);
});