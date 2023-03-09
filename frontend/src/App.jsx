import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'


function Option(props) {
    return <button type="button"
                   onClick={props.onClick}
                   disabled={props.active}
                   className={(props.active ? "bg-green-500 " : "bg-white hover:bg-gray-200") + " box-border hover:box-content py-1,8 px-1,8 h-7 w-9 rounded-lg mx-1 font-semibold"}>
        {props.text}
    </button>;
}

function App() {
    const [status, setStatus] = useState();

    useEffect(() => {
        fetch("http://localhost:5000/statusHistory").then(r => r.json()).then(setStatus)
    }, []);

    const [timespan, setTimespan] = useState("week");

    let filledStatus = Array();
    if (status) {
        for (let i = 0; i < 90-status.length; i++) {
            filledStatus.push(null);
        }
        filledStatus = filledStatus.concat(status);
    }


    return (<div>
        <div className="container mx-auto max-w-3xl bg-white">
            <div className={"pt-10"}>
                <h1 className={"text-8xl font-sans text-center pb-10 font-semibold"}>Uni2Work is <span
                    className="text-green-500 font-semibold">online</span>!</h1>
            </div>
            <div className={" border-solid border-2 rounded-lg p-5"}>
                <div className="flex justify-end">
                    <h3 className={"grow"}> Uptime history</h3>
                    <div className="box-border hover:box-content py-2 px-2 bg-gray-100 rounded-lg">
                        <Option onClick={() => {
                            setTimespan("day")
                        }}
                                text="24h" active={timespan === "day"}/>

                        <Option onClick={() => {
                            setTimespan("week")
                        }}
                                text="7d" active={timespan === "week"}/>

                        <Option onClick={() => {
                            setTimespan("month")
                        }}
                                text="30d" active={timespan === "month"}/>

                        <Option onClick={() => {
                            setTimespan("year")
                        }}
                                text="1y" active={timespan === "year"}/>


                    </div>
                    <div/>
                </div>
                <div className="flex mt-3 justify-end">
                    {filledStatus.map((record, index) => {
                        if(record == null){
                            return <span key={index} className={"w-1 h-10 bg-gray-500 mr-1 rounded"}></span>;
                        }
                        else if (record.status_code == 200) {
                            return <span key={index} className={"w-1 h-10 bg-green-500 mr-1 rounded"}></span>;
                        } else {
                            return <span key={index} className={"w-1 h-10 bg-red-500 mr-1 rounded"}></span>;
                        }
                    })}
                </div>

            </div>
            <div className={"mt-5 border-solid border-2 rounded-lg p-5"}>
                <h3>Response times</h3>
            </div>
        </div>
    </div>)
}

export default App;
