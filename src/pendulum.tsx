import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3, Matrix3 } from "three";

// props
interface DoublePendulumProps {
    file: File;
    setSimTime: (time: number) => void;
}


// parse file
async function parseFile(file: File) {
    // read line by line
    const text = await file.text();

    // parse text as json object
    const parsed = JSON.parse(text);

    return parsed as number[][];
}

export default function DoublePendulum(props: DoublePendulumProps) {

    // on init parse file from props
    const [values, setValues] = useState<number[][]>();

    // on mount run this
    useEffect(() => {
        (async () => {
            setValues(await parseFile(props.file));
        })();
    }, []);

    const [state, setState] = useState({
        theta1: 0,
        theta2: 0,
        x: 0,
    });

    useFrame((state, delta) => {
        if (!values) {
            // state.clock.stop();
            return;
        }

        const time = state.clock.getElapsedTime();
        props.setSimTime(time);
        // find closest row by time (first column)
        const closest = values.reduce((prev, curr) => {
            if (Math.abs(curr[0] - time) < Math.abs(prev[0] - time)) {
                return curr;
            }

            return prev;
        });

        if (time > values[values.length - 1][0]) {
            state.clock.stop();
            state.clock.start();
        }

        setState({
            theta1: closest[1],
            theta2: closest[2],
            x: closest[3],
        });
    });

    const parameters = {
        l1: 1.0,
        l2: 0.8,
    }

    return (<>
        <axesHelper args={[1]} />
        {/* first joint */}
        <mesh key="1" position={[
            parameters.l1 * Math.sin(state.theta1),
            -parameters.l1 * Math.cos(state.theta1),
            0,
        ]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="red" />
        </mesh>
        {/* second joint */}
        <mesh
            key="2"
            position={[
                parameters.l1 * Math.sin(state.theta1) + (parameters.l2 + state.x) * Math.sin(state.theta2),
                -parameters.l1 * Math.cos(state.theta1) - (parameters.l2 + state.x) * Math.cos(state.theta2),
                0,
            ]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="red" />
        </mesh>

        {/* draw arrows between each point */}
        <arrowHelper args={[
            new Vector3(Math.sin(state.theta1), -Math.cos(state.theta1), 0),
            new Vector3(0, 0, 0),
            parameters.l1,
            0x00ff00,
        ]} />

        <arrowHelper args={[
            new Vector3(
                Math.sin(state.theta2), // + state.theta1),
                -Math.cos(state.theta2), // + state.theta1),
                0,
            ),
            new Vector3(
                parameters.l1 * Math.sin(state.theta1),
                -parameters.l1 * Math.cos(state.theta1),
                0,
            ),
            parameters.l2,
            0x0000ff,
        ]} />
    </>);
}