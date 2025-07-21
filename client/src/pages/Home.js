import React from 'react'

function Home() {
    const { backendUrl, setIsLoggedin} = useContext(AppContext);
    const getQuiz = async() =>{
        try {
            const user 
            const quiz = await axios.get(`${backendUrl}/api/quiz`)
        } catch (error) {
            
        }
    }
  return (
    <div>
      Home
    </div>
  )
}

export default Home
