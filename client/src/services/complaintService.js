import api from "./api";


// Create complaint

export const createComplaint = (formData)=>{

return api.post(
"/complaints",
formData,
{
headers:{
"Content-Type":"multipart/form-data"
}
}
);

};



// Citizen complaints

export const getMyComplaints = ()=>{

return api.get(
"/complaints/my"
);

};



// Single complaint

export const getComplaintById = (id)=>{

return api.get(
`/complaints/${id}`
);

};



// Admin/officer complaints

export const getAllComplaints = ()=>{

return api.get(
"/complaints"
);

};



// Update status

export const updateComplaintStatus=(id,status)=>{

return api.patch(
`/complaints/${id}/status`,
{
status
}
);

};