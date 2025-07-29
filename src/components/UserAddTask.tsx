import { useEffect, useState } from "react";
import { tasks } from "../lib/api/api";
import type { Tasks } from "../generated/api";

export function UserAddTask(){
    const [tasksData, setTasksData] = useState<Tasks[]>([]);
    
    useEffect (()=>{
        getTasks()
    }, [])

    const getTasks = async () => {
        try{
            const result = await tasks.getTasks();
            setTasksData(result || []);
        }catch{
            console.error();
        }
    }
    

    return(
        <>
        {tasksData.map((task)=>(
            <p>{task.name}</p>
        ))}
        </>
    )
}