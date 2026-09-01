export default function AdminComplaintCard({
complaint,
updateStatus
}){


return(

<div className="admin-card">


<img

src={complaint.image}

width="150"

/>


<h3>

{complaint.title}

</h3>


<p>

Category:

{
complaint.category.replace("_"," ")
}

</p>



<p>

Severity:

{complaint.severity}

</p>



<p>

Status:

{complaint.status}

</p>



<select

value={complaint.status}

onChange={
(e)=>
updateStatus(
complaint._id,
e.target.value
)
}

>


<option value="pending">
Pending
</option>


<option value="in_progress">
In Progress
</option>


<option value="resolved">
Resolved
</option>


<option value="rejected">
Rejected
</option>


</select>



</div>


)

}