let opEdCategoryButtonClicked = function(event:any){
    let categoryContainer = document.getElementById("categoryContainer");
    if(categoryContainer != null){
        categoryContainer.style.verticalAlign = "middle";
        categoryContainer.style.display = "block";
    }
};
let dismissOpEdAlert = function (){
    document.getElementById('errorMessage')!.style.display = "none";
};
let dismissOpEdCategory = function (){
    document.getElementById('categoryContainer')!.style.display = "none";
};
let addOpEdCategoryButtonClicked = function(event:any){
    let categoryContainer = document.getElementById("categoryContainer");
    let link = (<HTMLInputElement>document.getElementById("opedlink"))!.value;
    let title = (<HTMLInputElement>document.getElementById("opedtitle"))!.value;
    let description = (<HTMLInputElement>document.getElementById("opeddescription"))!.value;
    let data = {'operation':'insert','link':link,'title':title,'description':description};
    fetch('/oped/category', {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(function (response){
        document.getElementById("categoryContainer")!.style.display = "none";
        (<HTMLInputElement>document.getElementById("opedlink"))!.value = "";
        (<HTMLInputElement>document.getElementById("opedtitle"))!.value = "";
        (<HTMLInputElement>document.getElementById("opeddescription"))!.value = "";
    }).catch(error=>{
        console.log(error);
    });
};
let refreshhn = function(){
    runCommand('hnrefresh');
};
let refreshoped = function(){
    runCommand('opedrefresh');
};
let purgehn = function(){
    runCommand('purgehn');
}
let runCommand = function(command:any){
    var data = {'command':command};
    fetch('/settings/command', {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(response=>{
        if(!response.ok){
            throw Error(response.statusText)
        }
    })
    .catch(error=>{
        document.getElementById('errorMessage')!.style.display = "block";
        console.log(error);
    });
};

document.addEventListener("DOMContentLoaded", function(event:any){
    console.log("DOMContentLoaded");
    document.getElementById("errorMessage")!.addEventListener("click",dismissOpEdAlert);
    document.getElementById("addoped")!.addEventListener("click",opEdCategoryButtonClicked);
    document.getElementById("addCategoryButton")!.addEventListener("click",addOpEdCategoryButtonClicked);
    document.getElementById("categoryCloseButton")!.addEventListener("click",dismissOpEdCategory);
    document.getElementById("categoryCrossButton")!.addEventListener("click",dismissOpEdCategory);
    document.getElementById("refreshhn")!.addEventListener("click",refreshhn);
    document.getElementById("refreshoped")!.addEventListener("click",refreshoped);
    document.getElementById("purgehn")!.addEventListener("click",purgehn);
});
