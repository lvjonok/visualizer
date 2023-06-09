import { useState } from "react";

// create props
interface SidebarProps {
    simulationChanged: (simulationType: SimulationType) => void;
    simTime: number;
    fileAdded: (file: File) => void;
}

function Sidebar(props: SidebarProps) {
    const [curSim, setCurSim] = useState(SimulationType.Quaternions);

    return (
        <div className="sidebar">
            <div className="sidebar-items">
                {
                    [
                        SimulationType.Quaternions,
                        SimulationType.Quadcopter,
                        SimulationType.DoublePendulum,
                        SimulationType.DoublePendulum3Joints,
                        SimulationType.FourLinkBar,
                    ].map((simulationType) => {
                        return (
                            <button className={curSim == simulationType ? "sidebar-item-selected" : "sidebar-item"}
                                key={simulationType}
                                onClick={() => { setCurSim(simulationType); props.simulationChanged(simulationType) }}
                            >
                                {simulationType}
                            </button>
                        );
                    })
                }
            </div>

            {/* display sim time */}
            <div className="sim-time">
                Simulation time: {props.simTime.toPrecision(4)}s
            </div>

            {/* display info about simulation */}
            <div className="sim-info">
                {/* <p> */}
                {SimulationInfo[curSim]}
                {/* </p> */}
            </div>

            {/* drop down files area */}
            <div className="drop-down-files" onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                    props.fileAdded(e.dataTransfer.files[0]);
                }
            }} onDragOver={(e) => {
                e.preventDefault();
            }}>
                <p>Drop files here</p>
            </div>
        </div>
    );
}

// create enum
enum SimulationType {
    Quaternions = "Quaternions",
    Quadcopter = "Quadcopter",
    DoublePendulum = "DoublePendulum",
    DoublePendulum3Joints = "DoublePendulum3Joints",
    FourLinkBar = "FourLinkBar"
}

enum SimulationInfo {
    Quaternions = "Input data is a\n\n[ [time, *flat rotation matrix] ]",
    Quadcopter = "Input data is a\n\n[ [time, *flat rotation matrix] ]",
    DoublePendulum = "Input data is a\n\n[ [time, theta1, theta2, x] ]",
    DoublePendulum3Joints = "Input data is [time, x1, y1, x2, y2, x3, y3]",
    FourLinkBar = "Input data is [time, x0, y0, x1, y1, x2, y2, x3, y3]"
}

export { Sidebar };