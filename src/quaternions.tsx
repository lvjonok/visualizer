import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Matrix3, Vector3 } from "three";
// props
interface QuaternionSceneProps {
    file: File;
    setSimTime: (time: number) => void;
    showMotors: boolean;
}

// parse file
async function parseFile(file: File) {
    // read line by line
    const text = await file.text();

    // parse text as json object
    const parsed = JSON.parse(text);

    return parsed as number[][];
}

function ArrowHelper(props: ThreeElements['arrowHelper']) {
    const ref = useRef<THREE.ArrowHelper>(null!);

    return (
        <arrowHelper
            {...props}
            ref={ref}
        />
    )
}

export default function QuaternionScene(props: QuaternionSceneProps) {

    // on init parse file from props
    const [values, setValues] = useState<number[][]>();

    // on mount run this
    useEffect(() => {
        (async () => {
            setValues(await parseFile(props.file));
        })();
    }, []);

    const [vectors, setVectors] = useState<Vector3[]>([]);

    const [matrix3, setMatrix3] = useState<Matrix3>(new Matrix3());

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

        // set vectors
        setVectors([
            new Vector3(closest[1], closest[2], closest[3]),
            new Vector3(closest[4], closest[5], closest[6]),
            new Vector3(closest[7], closest[8], closest[9]),
        ]);

        // set matrix
        let m = new Matrix3();
        m.elements = closest.slice(1, 10) as any;
        setMatrix3(m);
    });

    return (<>
        <axesHelper args={[1]} />
        {
            vectors.map((vector, index) => {
                return <ArrowHelper args={[vector, new Vector3(0, 0, 0), 1, [0xff0000, 0x00ff00, 0x0000ff][index]]} />
            })
        }
        {
            props.showMotors ?
                // display sphere at [l, 0, 0], [-l, 0, 0], [0, l, 0], [0, -l, 0]
                [
                    new Vector3(1, 0, 0),
                    new Vector3(-1, 0, 0),
                    new Vector3(0, 1, 0),
                    new Vector3(0, -1, 0),
                ].map((position, index) => {
                    return <mesh key={index} position={position.applyMatrix3(matrix3)}>
                        <sphereGeometry args={[0.1, 32, 32]} />
                        <meshBasicMaterial color={0xff0000} />
                    </mesh>
                }) : <></>
        }
    </>
    )
};