const removeArticle = function removeArticle(data:any){
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

const postData = function postData(url:string, data:any, onSuccess:Function){
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

const readButtonClicked = function(event:any){
    const id = event.target.parentNode.getAttribute('id');
    const data = {'operation':'markRead', 'id':id};
    postData('/hn',data,removeArticle);
};

const removeButtonClicked = function(event:any){
    const id = event.target.parentNode.getAttribute('id');
    const data = {'operation':'remove', 'id':id};
    postData('/hn',data,removeArticle);
};
const archiveButtonClicked = function(event:any){
    const id = event.target.parentNode.getAttribute('id');
    const data = {'operation':'archive', 'id':id, 'url':"https://news.ycombinator.com/item?id="+id};
    postData('/hn',data,()=>{});
}
const addAnnotateButtonClicked = function(event:any){
    const notesContainer = document.getElementById("notesContainer");
    if(notesContainer == null){
        return;
    }
    const id = notesContainer.getAttribute("associatedId");
    const tags = (<HTMLInputElement>document.getElementById("tags")).value;
    const notes = (<HTMLInputElement>document.getElementById("notes")).value;
    const data = {'operation':'annotate', 'id':id, 'tags':tags, 'notes':notes};
    postData('/hn',data,()=>{
        notesContainer!.style.display = "none";
        (<HTMLInputElement>document.getElementById("tags")).value = "";
        (<HTMLInputElement>document.getElementById("notes")).value ="";
    });
};
const annotateButtonClicked = function(event:any){
    const id = event.target.parentNode.getAttribute('id');
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

const tagKeyDown = function tagKeyDown(event:any){
    if( event.isComposing || event.keyCode == 229){
        return;
    }
    const text = event.target.value;
    const tags:string = event.target.getAttribute("data-tags");
    document.getElementById("availableTags")!.textContent = tags.split(",").filter(x=>x.startsWith(text)).join(",");
}

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
    document.getElementById("tags")!.addEventListener("keydown",tagKeyDown);
});