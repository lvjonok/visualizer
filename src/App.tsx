import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Sidebar } from './sidebar'
import QuaternionScene from './quaternions'
import DoublePendulum from './pendulum'


function App() {
  const [curSim, setCurSim] = useState('Quaternions' as 'Quaternions' | 'Quadcopter' | 'DoublePendulum')

  const [file, setFile] = useState<File | null>(null);

  const [simTime, setSimTime] = useState(0);

  useEffect(() => {
    if (file) {
      setFile(null);
      setSimTime(0);
    }
  }, [curSim])

  return (
    <div className="App">
      <Sidebar
        fileAdded={(e) => setFile(e)}
        simTime={simTime}
        simulationChanged={(e) => e != curSim ? setCurSim(e) : null}
      />
      <Canvas className='canvas'>
        {
          curSim == 'Quaternions' && file ?
            <>
              <QuaternionScene
                showMotors={false}
                file={file}
                setSimTime={(time) => setSimTime(time)}
              />
              <OrbitControls />
            </> : <></>
        }
        {
          curSim == 'Quadcopter' && file ?
            <>
              <QuaternionScene
                showMotors={true}
                file={file}
                setSimTime={(time) => setSimTime(time)}
              />
              <OrbitControls />
            </> : <></>
        }
        {
          curSim == 'DoublePendulum' && file ?
            <>
              <ambientLight />
              <DoublePendulum
                file={file}
                setSimTime={(time) => setSimTime(time)}
              />
              <OrbitControls />
            </> : <></>
        }
      </Canvas> : <></>
    </div>
  );
}

export default App;
