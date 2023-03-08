import {useState} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {

    return (
        <div className="container mx-auto max-w-3xl">
            <div className={"pt-10"}>
                <h1 className={"text-8xl font-sans text-center pb-10"}>Uni2Work is <span className="text-green-500 font-semibold">online</span>!</h1>
            </div>
            <div className={" border-solid border-2 rounded-lg p-5"}>
                <h3 >Uptime history</h3>
                <div className="flex mt-3">
                    {[...Array(90).keys()].map((index)=>
                        index % 2 == 0 ? <span className={"w-1 h-10 bg-green-500 mr-1 rounded"}></span> :<span className={"w-1 h-10 bg-red-500 mr-1 rounded"}></span>
                    )}
                </div>

           </div>
            <div className={"mt-5 border-solid border-2 rounded-lg p-5"}>
                <h3 >Response times</h3>


           </div>
        </div>
    )
}

export default App
