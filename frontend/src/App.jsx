import {useEffect, useState} from 'react'
import './App.css'
//import "./styles.css";
import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";
import moment from "moment";

function Option(props) {
    return <button type="button"
                   onClick={props.onClick}
                   disabled={props.active}
                   className={(props.active ? "bg-green-500 " : "bg-white hover:bg-gray-200") + " box-border hover:box-content py-1,8 px-1,8 h-7 w-9 rounded-lg mx-1 font-semibold"}>
        {props.text}
    </button>;
}

function Selector(props) {
    return <div className="box-border hover:box-content py-2 px-2 bg-gray-100 rounded-lg">
        <Option onClick={() => {
            props.onChange("day")
        }}
                text="24h" active={props.selected === "day"}/>

        <Option onClick={() => {
            props.onChange("week")
        }}
                text="7d" active={props.selected === "week"}/>

        <Option onClick={() => {
            props.onChange("month")
        }}
                text="30d" active={props.selected === "month"}/>

        <Option onClick={() => {
            props.onChange("year")
        }}
                text="1y" active={props.selected === "year"}/>


    </div>
}

function calcUptime(status) {
    let total_events = 0;
    let sum_uptime = 0;
    for (const point of status) {
        if (point) {
            sum_uptime += point.uptime * point.datapoints;
            total_events += point.datapoints;
        }
    }
    return Math.round(sum_uptime * 100 * 100 / total_events) / 100;
}


function App() {
    const [status, setStatus] = useState();

    const [timespan, setTimespan] = useState("week");
    const [timingTimespan, setTimingTimespan] = useState("week");

    const [responseTimes, setResponseTimes] = useState();

    const [lastRequest, setLastRequest] = useState();
    useEffect(()=> {
        fetch("http://localhost:5000/responseTimes/" + timingTimespan).then(r => r.json()).then(setResponseTimes);
    }, [timingTimespan]);

    useEffect(() => {
        fetch("http://localhost:5000/statusHistory/" + timespan).then(r => r.json()).then(setStatus);
    }, [timespan]);

    useEffect(()=>{
        fetch("http://localhost:5000/isOnline").then(r => r.json()).then(setLastRequest);
    }, [])

    return (<div>
        {JSON.stringify(lastRequest)}
        <div className="container mx-auto max-w-3xl bg-white">
            <div className={"pt-10"}>
                <h1 className={"text-8xl font-sans text-center pb-10 font-semibold"}>Uni2Work is <span
                    className="text-green-500 font-semibold">online</span>!</h1>
            </div>
            <div className={" border-solid border-2 rounded-lg p-5"}>
                <div className="flex justify-end">
                    <h3 className={"grow"}> Uptime history</h3>

                    <Selector onChange={setTimespan} selected={timespan}/>
                    <div/>
                </div>
                <div className="flex mt-3 justify-end">
                    {status?.map((record, index) => {
                        if (record == null) {
                            return <span key={index} className={"w-1 h-10 bg-gray-300 mr-1 rounded"}></span>;
                        } else if (record.uptime === 1) {
                            return <span key={index} className={"w-1 h-10 bg-green-500 mr-1 rounded"}></span>;
                        } else {
                            return <span key={index} className={"w-1 h-10 bg-red-500 mr-1 rounded"}></span>;
                        }
                    })}
                </div>
                <div className="mt-3 flex items-center">
                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                    <div className="px-4"> {status ? calcUptime(status) : <></>}% uptime</div>
                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                </div>
            </div>
            <div className={"mt-5 border-solid border-2 rounded-lg p-5"}>
                <div className="flex justify-end">
                    <h3 className={"grow"}> Response times</h3>

                    <Selector onChange={setTimingTimespan} selected={timingTimespan}/>
                    <div/>
                </div>
                <LineChart className="mt-3" width={700} height={300} data={responseTimes}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis
                        ticks={(() => {

                            let date = moment();
                            let result = [];
                            if (timingTimespan === "day") {
                                date.minute(0);
                                for (let i = 0; i < 24; i += 3) {
                                    result.push(moment(date).subtract(i, 'hours').unix());
                                }
                            } else if (timingTimespan === "week") {
                                date.minute(0);
                                date.hour(0);
                                for (let i = 0; i < 7; i++) {
                                    result.push(moment(date).subtract(i, "days").unix());
                                }
                            } else if (timingTimespan === "month") {
                                date.minute(0);
                                date.hour(0);
                                for (let i = 0; i < 31; i += 2) {
                                    result.push(moment(date).subtract(i, "days").unix());
                                }
                            } else if (timingTimespan === "year") {
                                date.startOf("month");
                                for (let i = 0; i < 13; i += 2) {
                                    result.push(moment(date).subtract(i, "month").unix());
                                }
                            }

                            return result;
                        })()}
                        tickFormatter={(time) => {
                            const date = moment(time * 1000);
                            if (timingTimespan === "day") {
                                return date.format("hh:mm");
                            } else if (timingTimespan === "week" || timingTimespan === "month") {
                                return date.format("D. MMM");
                            } else if (timingTimespan === "year") {
                                return date.format("D. MMM");
                            }
                        }}
                        type={'number'} domain={['dataMin', 'dataMax']} dataKey="timestamp"
                        padding={{left: 30, right: 30}}/>
                    <YAxis/>
                    <Tooltip formatter={(x) => Math.round(x * 1000) / 1000}
                             labelFormatter={(t) => moment(t * 1000).format("MMM Do YYYY, hh:mm:ss")}/>
                    <Line
                        strokeWidth={2}
                        type="monotone"
                        name="response time"
                        unit={"s"}
                        dot={false}
                        dataKey="response_time"
                        stroke="#8884d8"
                        activeDot={{r: 4}}
                        connectNulls={false}
                    />
                </LineChart>
            </div>
        </div>

    </div>)
}

export default App;
