import api from "./api";


// Get all complaints for admin/officer

export const getAllComplaints = (filters)=>{


return api.get(
"/complaints",
{
params:filters
}
);


};



// Update complaint status

export const updateStatus=(id,status)=>{


return api.patch(

`/complaints/${id}/status`,

{
status
}

);


};