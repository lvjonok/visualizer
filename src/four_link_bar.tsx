import { Camera, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3, Matrix3 } from "three";

// props
interface FourLinkBarProps {
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

export default function FourLinkBar(props: FourLinkBarProps) {

    // on init parse file from props
    const [values, setValues] = useState<number[][]>();

    // on mount run this
    useEffect(() => {
        (async () => {
            setValues(await parseFile(props.file));
        })();
    }, []);

    const [state, setState] = useState({
        base: new Vector3(0, 0, 0),
        // first joint
        joint1: new Vector3(0, 0, 0),
        // second joint
        joint2: new Vector3(0, 0, 0),
        // second base
        base2: new Vector3(0, 0, 0),
    });

    useFrame((state, _delta) => {
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
            base: new Vector3(closest[1], closest[2], 0),
            joint1: new Vector3(closest[3], closest[4], 0),
            joint2: new Vector3(closest[5], closest[6], 0),
            base2: new Vector3(closest[7], closest[8], 0),
        });
    });

    useFrame((state, _delta) => {
        state.camera.position.set(0, 0, 1);
    })

    return (<>
        <axesHelper args={[1]} />

        {/* iterate through each xi, yi */}
        {
            [
                state.base, state.joint1, state.joint2, state.base2
            ].map((v, index) => {
                return <mesh key={`${index}${v.toArray().toString()}`} position={v}>
                    <sphereGeometry args={[0.05, 10, 10]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            })
        }

        {/* draw lines between each point */}
        {
            [
                [state.base, state.joint1],
                [state.joint1, state.joint2],
                [state.joint2, state.base2],
            ].map((v, index) => {
                const [p1, p2] = v;

                return <arrowHelper key={`${index}${p1.toArray().toString()}${p2.toArray().toString()}`} args={[
                    new Vector3(p2.x, p2.y, 0).sub(new Vector3(p1.x, p1.y, 0)).normalize(),
                    p1,
                    p1.distanceTo(p2),
                    0x00ff00,
                ]} />
            })
        }

    </>);
}