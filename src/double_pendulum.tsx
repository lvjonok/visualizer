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

export default function DoublePendulum3Joints(props: DoublePendulumProps) {

    // on init parse file from props
    const [values, setValues] = useState<number[][]>();

    // on mount run this
    useEffect(() => {
        (async () => {
            setValues(await parseFile(props.file));
        })();
    }, []);

    const [state, setState] = useState({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        x3: 0,
        y3: 0,
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
            x1: closest[1],
            y1: closest[2],
            x2: closest[3],
            y2: closest[4],
            x3: closest[5],
            y3: closest[6],
        });
    });

    const parameters = {
        l1: 0.8,
        l2: 1.2,
    }

    return (<>
        <axesHelper args={[1]} />
        {/* first joint */}
        <mesh key="1" position={[
            state.x2,
            state.y2,
            0,
        ]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="red" />
        </mesh>
        {/* second joint */}
        <mesh
            key="2"
            position={[
                state.x3,
                state.y3,
                0,
            ]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="red" />
        </mesh>

        {/* draw arrows between each point */}
        <arrowHelper args={[
            new Vector3(state.x2 - state.x1, state.y2 - state.y1, 0).normalize(),
            new Vector3(state.x1, state.y1, 0),
            parameters.l1,
            0x00ff00,
        ]} />

        <arrowHelper args={[
            new Vector3(state.x3 - state.x2, state.y3 - state.y2, 0).normalize(),
            new Vector3(
                state.x2,
                state.y2,
                0,
            ),
            parameters.l2,
            0x0000ff,
        ]} />
    </>);
}