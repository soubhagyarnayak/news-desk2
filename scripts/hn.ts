let removeArticle = function removeArticle(data:any){
    var element = document.getElementById(data.id);
    if(element != null){
        element.parentNode!.removeChild(element);
    }
};

let postData = function postData(url:string, data:any, onSuccess:Function){
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

let readButtonClicked = function(event:any){
    var id = event.target.parentNode.getAttribute('id');
    let data = {'operation':'markRead', 'id':id};
    postData('/hn',data,removeArticle);
};

let removeButtonClicked = function(event:any){
    var id = event.target.parentNode.getAttribute('id');
    let data = {'operation':'remove', 'id':id};
    postData('/hn',data,removeArticle);
};
let archiveButtonClicked = function(event:any){
    var id = event.target.parentNode.getAttribute('id');
    let data = {'operation':'archive', 'id':id, 'url':"https://news.ycombinator.com/item?id="+id};
    postData('/hn',data,()=>{});
}
let addAnnotateButtonClicked = function(event:any){
    var notesContainer = document.getElementById("notesContainer");
    if(notesContainer == null){
        return;
    }
    var id = notesContainer.getAttribute("associatedId");
    var tags = (<HTMLInputElement>document.getElementById("tags")).value;
    var notes = (<HTMLInputElement>document.getElementById("notes")).value;
    let data = {'operation':'annotate', 'id':id, 'tags':tags, 'notes':notes};
    postData('/hn',data,()=>{
        notesContainer!.style.display = "none";
        (<HTMLInputElement>document.getElementById("tags")).value = "";
        (<HTMLInputElement>document.getElementById("notes")).value ="";
    });
};
let annotateButtonClicked = function(event:any){
    var id = event.target.parentNode.getAttribute('id');
    fetch(`hn/article?id=${id}`,{
        method: 'GET'
    }).then(function(response){
        return response.json();
    }).then(function(data){
        var notesContainer = document.getElementById("notesContainer");
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

let dismissAlert = function dismissAlert(){
    document.getElementById('errorMessage')!.style.display = "none";
};
let dismissNotes = function dismissNotes(){
    document.getElementById('notesContainer')!.style.display = "none";
};

let tagKeyDown = function tagKeyDown(event:any){
    if( event.isComposing || event.keyCode == 229){
        return;
    }
    let text = event.target.value;
    let tags:string = event.target.getAttribute("data-tags");
    document.getElementById("availableTags")!.textContent = tags.split(",").filter(x=>x.startsWith(text)).join(",");
}

document.addEventListener("DOMContentLoaded", function(event){
    document.getElementById("addAnnotationButton")!.addEventListener("click",addAnnotateButtonClicked);
    let markReadButtons = document.querySelectorAll("input.readButton");
    markReadButtons.forEach(function(markReadButton:Element){
        markReadButton.addEventListener("click", readButtonClicked);
    });
    let removeButtons = document.querySelectorAll("input.removeButton");
    removeButtons.forEach(function(removeButton:Element){
        removeButton.addEventListener("click", removeButtonClicked);
    });
    let annotateButtons = document.querySelectorAll("input.annotateButton");
    annotateButtons.forEach(function(annotateButton:Element){
        annotateButton.addEventListener("click", annotateButtonClicked);
    });
    let archiveButtons = document.querySelectorAll("input.archiveButton");
    archiveButtons.forEach(function(archiveButton:Element){
        archiveButton.addEventListener("click", archiveButtonClicked);
    });
    document.getElementById("errorMessage")!.addEventListener("click",dismissAlert);
    document.getElementById("notesCloseButton")!.addEventListener("click",dismissNotes);
    document.getElementById("notesCrossButton")!.addEventListener("click",dismissNotes);
    document.getElementById("tags")!.addEventListener("keydown",tagKeyDown);
});