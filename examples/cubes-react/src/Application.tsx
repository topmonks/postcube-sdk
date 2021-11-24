
import * as React from 'react'

import { Cube, Cubes, useCube } from '../../../lib'

export const Application = ({}) => {
    const [ namePrefix, setNamePrefix ] = React.useState('PostCube')
    const [ selectedCube, setSelectedCube ] = React.useState<Cube>()
    const cube = useCube(selectedCube)

    const handleSelectCube = async() => {
        const cube = await Cubes.requestCube(namePrefix)
        setSelectedCube(cube)
    }

    return (
        <div>
            <h1>Cubes API example</h1>
            Name prefix: <input value={namePrefix} onChange={event => setNamePrefix(event.target.value)} />
            <button
                onClick={handleSelectCube}
            >
                Select cube
            </button>
            {cube && (
                <React.Fragment>
                    <div>
                        Selected cube:
                    </div>
                    <pre>
                        {JSON.stringify(cube, null, 2)}
                    </pre>
                </React.Fragment>
            )}
        </div>
    )
}
