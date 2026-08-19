import api from "./api";


export const analyzeComplaint=(image)=>{


const formData=new FormData();


formData.append(
"image",
image
);



return api.post(

"/ai/analyze",

formData,

{
headers:{
"Content-Type":"multipart/form-data"
}
}

);


};