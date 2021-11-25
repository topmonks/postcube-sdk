
import { useState, useEffect } from 'react'

import { Cubes, Cube } from './cubes'

export const useCubes = (): Cubes => {
    const [ toggle, setToggle ] = useState<boolean>(false)

    const handleCubesChange = () => {
        setToggle(!toggle)
    }

    useEffect(() => {
        Cubes.onChange.listen(handleCubesChange)
        return () =>
            Cubes.onChange.unlisten(handleCubesChange)
    }, [])

    return Cubes
}

export const useCube = (cube?: Cube): Cube => {
    const [ toggle, setToggle ] = useState<boolean>(false)
    const [ _cube, setCube ] = useState(cube)

    const handleCubeChange = () => {
        setToggle(!toggle)
    }

    useEffect(() => {
        setCube(cube)

        if (!cube) {
            return
        }

        cube.onChange.listen(handleCubeChange)
        return () =>
            cube.onChange.unlisten(handleCubeChange)
    }, [cube])

    return _cube
}
