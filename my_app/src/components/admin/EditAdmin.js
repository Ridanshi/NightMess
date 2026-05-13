import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import axios from "axios";

function EditAdmin()
{
    let h=useNavigate();
    const {id} = useParams();

    const[name, setName]=useState("");
    const[email, setEmail]=useState("");
    const[address, setAdd]=useState("");
    const[contact, setContact]=useState("");
    const[result, setResult] = useState("");

    useEffect(
        ()=>{
            console.log(id);
            displayAdmin();
        },
        []
    );
    const displayAdmin = async() =>{
        let result = await fetch(
            'http://localhost:5000/get_admin',{
                method: "post",
                body: JSON.stringify({id}),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        result = await result.json();
        setName(result.name);
        setEmail(result.email);
        setAdd(result.address);
        setContact(result.contact);
    };

    const handleOnSubmit = async(e)=>{
        e.preventDefault();
        let result = await fetch(
            'http://localhost:5000/update_admin_profile',{
                method: "post",
                body: JSON.stringify({name, address, contact, email}),
                headers: {'Content-Type': 'application/json'}
            }
        );
        result=await result.json();
        console.warn(result);
        if(result.data==='success'){
            setResult("Data saved successfully");
        }
        else{
            setResult(result.msg)
        }
    }

    return(
        <div style={{margin:10}}>
            <h4 className="text-primary">Change and Save</h4>
            <form action="">
                <div className="col-6">
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e)=>setName(e.target.value)}/>
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" readOnly value={email} className="form-control" onChange={(e)=>setEmail(e.target.value)}/>
                </div>
                <div className="form-group mt-2">
                    <button type="submit" onClick={handleOnSubmit} className="btn btn-primary">Save Changes</button>
                </div>
                </div>
            </form>
            <h3 className="text-success">{result}</h3>
        </div>
    );
}
export default EditAdmin;