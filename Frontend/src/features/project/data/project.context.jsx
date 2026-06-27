import { createContext, useState } from "react";

export const ProjectContext = createContext() ;

export const ProjectContextProvider = ({children}) => {

  const [loading, setLoading] = useState(false) ;
  const [title, setTitle] = useState("") ;
  const [fileData, setFileData] = useState([]) ;
  const [error, setError] = useState(null)
  const [allProjects, setAllProjects] = useState(null) ;


  return(
    <ProjectContext.Provider value = {{title, setTitle, fileData, setFileData, loading, setLoading, error, setError, allProjects, setAllProjects}} >
      {children}
    </ProjectContext.Provider>
  )

}