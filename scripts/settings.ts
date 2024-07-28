const opEdCategoryButtonClicked = function(){
    const categoryContainer = document.getElementById("categoryContainer");
    if(categoryContainer != null){
        categoryContainer.style.verticalAlign = "middle";
        categoryContainer.style.display = "block";
    }
};
const dismissOpEdAlert = function (){
    document.getElementById('errorMessage')!.style.display = "none";
};
const dismissOpEdCategory = function (){
    document.getElementById('categoryContainer')!.style.display = "none";
};
const addOpEdCategoryButtonClicked = function(){
    const link = (<HTMLInputElement>document.getElementById("opedlink"))!.value;
    const title = (<HTMLInputElement>document.getElementById("opedtitle"))!.value;
    const description = (<HTMLInputElement>document.getElementById("opeddescription"))!.value;
    const data = {'operation':'insert','link':link,'title':title,'description':description};
    fetch('/oped/category', {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(function (){
        document.getElementById("categoryContainer")!.style.display = "none";
        (<HTMLInputElement>document.getElementById("opedlink"))!.value = "";
        (<HTMLInputElement>document.getElementById("opedtitle"))!.value = "";
        (<HTMLInputElement>document.getElementById("opeddescription"))!.value = "";
    }).catch(error=>{
        console.log(error);
    });
};
const refreshhn = function(){
    runCommand('hnrefresh');
};
const refreshoped = function(){
    runCommand('opedrefresh');
};
const purgehn = function(){
    runCommand('purgehn');
}
const runCommand = function(command:string){
    const data = {'command':command};
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

document.addEventListener("DOMContentLoaded", function(){
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
