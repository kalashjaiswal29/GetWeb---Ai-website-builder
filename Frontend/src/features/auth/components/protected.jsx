import useAuth from "../hooks/useAuth"
import {Navigate} from 'react-router'
import PageLoader from "../../shared/components/PageLoader"

const Protected = ({children}) => {
  const {user, loading,initialized} = useAuth() ;

  if(!initialized){
    return <PageLoader /> ;
  }
  if(!user){
    return <Navigate to = {'/login'}/>
  }

  return children
}

export default Protected ;