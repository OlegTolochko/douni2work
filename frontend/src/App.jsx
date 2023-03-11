import {useEffect, useState} from 'react'
import './App.css'
import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import moment from "moment";

import {useWindowSize} from "./hooks.js";
import headlines from "./headlines.json";

import.meta.env.DEV;
const BASE_URL = import.meta.env.DEV ? "http://localhost:5000" : "";

function Option(props) {
    return <button type="button"
                   onClick={props.onClick}
                   disabled={props.active}
                   className={(props.active ? "bg-green-500 " : "hover:bg-gray-200 dark:hover:bg-slate-500") + " box-border py-1 px-1 w-8 sm:w-10 rounded-lg mx-1 font-semibold text-xs sm:text-sm"}>
        {props.text}
    </button>;
}

function Selector(props) {
    return <div className="flex justify-end items-baseline flex-col sm:flex-row">
        <h3 className={"grow pb-3 sm:pb-1 pt-2 align-text-bottom text-xl"}>{props.text}</h3>
        <div
            className="box-border flex justify-around hover:box-content self-end p-1 sm:p-2 bg-gray-100 dark:dark:bg-slate-600 rounded-lg sm:w-auto sm:h-auto w-full h-full">
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
    </div>
}

function reduceNumberOfDatapoints(uptimeHistory) {
    let newHistory = [];
    for (let i = 0; i < uptimeHistory.length; i += 2) {
        const el1 = uptimeHistory[i];
        const el2 = uptimeHistory[i + 1];
        if (el1 === null) {
            newHistory.push(el2);
        } else if (el2 == null) {
            newHistory.push(el1);
        } else {
            newHistory.push({
                "datapoints": el1.datapoints + el2.datapoints,
                "date": el1.date,
                "uptime": (el1.datapoints * el1.uptime + el2.datapoints * el2.uptime) / (el1.datapoints + el2.datapoints)
            });
        }


    }
    return newHistory;
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
    const [uptimeHistory, setUptimeHistory] = useState();

    const [timespan, setTimespan] = useState("week");
    const [timingTimespan, setTimingTimespan] = useState("week");

    const [responseTimes, setResponseTimes] = useState();

    const [lastRequest, setLastRequest] = useState();

    const [headline, setHeadline] = useState();
    const [status, setStatus] = useState();

    useEffect(() => {
        if (!lastRequest)
            return;

        let type;
        if (lastRequest.status_code !== 200) {
            type = "offline";
        } else if (lastRequest.response_time >= 5) {
            type = "slow"
        } else {
            type = "online";
        }
        type = "online";

        const applicable = headlines.filter((headline) => headline.scenarios.includes(type));

        const result = applicable[Math.floor(applicable.length * Math.random())];

        setHeadline(result.text);
        setStatus(type);

    }, [lastRequest]);

    useEffect(() => {
        fetch(BASE_URL + "/responseTimes/" + timingTimespan).then(r => r.json()).then(setResponseTimes);
    }, [timingTimespan]);

    useEffect(() => {
        fetch(BASE_URL + "/statusHistory/" + timespan).then(r => r.json()).then(setUptimeHistory);
    }, [timespan]);

    useEffect(() => {
        fetch(BASE_URL + "/isOnline").then(r => r.json()).then(setLastRequest);
    }, []);

    const windowSize = useWindowSize();
    let correctUptimeHistory = uptimeHistory;
    if (windowSize.width < 640 && correctUptimeHistory) {
        correctUptimeHistory = reduceNumberOfDatapoints(uptimeHistory);
    }
    return (
        <div className={"px-3 h-screen dark:bg-slate-800 dark:text-white"}>
            <div className="container mx-auto max-w-3xl">
                <div className={"pt-20 pb-10 px-4"}>
                    <h1 className={"text-5xl lg:text-6xl font-sans text-center pb-5 font-semibold"}>
                        Uni2Work is
                        <span
                            className={`${status === "online" ? "text-green-500" : (status === "slow" ? "text-amber-400" : "text-red-400")} font-bold`}> {status}</span>!
                    </h1>

                    <h3 className={"text-1xl lg:text-3xl font-sans text-center"}>{headline}</h3>
                </div>
                <div className={" border-solid border-2 rounded-lg p-5 pt-3"}>

                    <Selector  text={"Uptime history"} onChange={setTimespan} selected={timespan}/>

                    <div className="flex mt-3 justify-between">
                        {correctUptimeHistory?.map((record, index) => {
                            if (record == null) {
                                return <span key={index} className={"w-1 h-10 bg-gray-300 rounded"}></span>;
                            } else if (record.uptime === 1) {
                                return <span key={index} className={"w-1 h-10 bg-green-500  rounded"}></span>;
                            } else {
                                return <span key={index} className={"w-1 h-10 bg-red-500  rounded"}></span>;
                            }
                        })}
                    </div>
                    <div className="mt-3 flex items-center">
                        <div className="flex-1 h-0.5 bg-gray-300"></div>
                        <div className="px-4"> {uptimeHistory ? calcUptime(uptimeHistory) : <></>}% uptime</div>
                        <div className="flex-1 h-0.5 bg-gray-300"></div>
                    </div>
                </div>
                <div className={"mt-5 border-solid border-2 rounded-lg p-5 pt-3 text-xs sm:text-base"}>


                    <Selector text={"Response times"} onChange={setTimingTimespan} selected={timingTimespan}/>

                    <ResponsiveContainer className="mt-3 dark:text-black" width={"100%"} aspect={2.5}>
                        <LineChart margin={{left: -20}} data={responseTimes}>
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
                                        return date.format("HH:mm");
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
                                     labelFormatter={(t) => moment(t * 1000).format("MMM Do YYYY, HH:mm:ss")}/>
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
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={"flex justify-center mt-8 mb-10 gap-5"}>
                <a href={"https://github.com/Ballmaid/douni2work"}>Github</a>
            </div>

        </div>)
}

export default App;
