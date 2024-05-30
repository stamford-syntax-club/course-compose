"use client";
import React, { useState } from 'react'
import { guideline, aspects, plus, minus } from './data';
interface Aspects {
    title: string;
    info : string;
}
interface Guideline{
    title : string;
    rule1?: string;
    rule2?:string;
    rule3?: string;
    rule4?: string;
}
export default function Guideline() :JSX.Element {
  const [openItem,setOpenItem] = useState<number[]>([]);
  const handleclick = (index : number)=>{
    setOpenItem((previous)=> {
      if(previous.includes(index)){
        return previous.filter((i)=> i!== index);
      }else{
        return [...previous, index]
      }
    })

  }

  
  return (
    <div className=' w-full  text-white h-full'>
        <div className="max-w-4xl mx-auto px-4  ">
        <h1 className="text-3xl font-bold text-center mb-6">Guidelines for Writing Course Reviews</h1>
      <p className="text-gray-400 mb-8">
        While reviews are helpful, always consult with your academic advisors when selecting courses. This platform is intended to supplement their guidance with student experiences. Remember that reading reviews is useful, but you must study according to your curriculum and requirements.
      </p>

      <div className="mb-9">
      <h1 className="text-3xl font-bold text-center mb-8">Consider Key Aspects of the Course</h1>
      {
        aspects?.map((info : Aspects, index)=>(
          <div className="mb-6" key={index}>
          <h2 className="text-xl font-semibold mb-2">{info.title}</h2>
          <p className="text-gray-400">{info.info}</p>
        </div>

        ))
      } 
    </div>

      {
        guideline?.map((list : Guideline, index: number)=>(
          <div className={`mb-8 ${
            openItem.includes(index)?"" : "bg-white text-black"
          }`}  onClick={()=>handleclick(index)} key={index}>
              <div className = {`flex justify-between items-center p-2 shadow-lg ${
                openItem.includes(index)?"bg-blue-600 text-white" : ""
              }`}>
                <h2 className="text-lg font-semibold pl-3">{list.title}</h2>
              {openItem.includes(index)?<span className=' cursor-pointer'>{minus}</span> :<span className=' cursor-pointer'>{plus}</span> }
                
              </div>
            
              {
                openItem.includes(index)&&(<ul className="list-disc pl-6" >
      
                {list.rule1 && <li className="mb-2">{list.rule1}</li> }
                {list.rule2 && <li className="mb-2">{list.rule2}</li>}
                {list.rule3 && <li className="mb-2">{list.rule3}</li> }
                {list.rule4 && <li className="mb-2">{list.rule4}</li> }

              </ul>

                )
      
              }


          
        </div>

        ))
      }

     

     

        </div>
    </div>
    
      
      
    
  )
}

