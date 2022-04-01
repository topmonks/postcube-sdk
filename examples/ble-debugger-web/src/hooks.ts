
import { useState, useEffect } from 'react'

import { PostCubeBLE } from '../../../lib'

export const usePostCubeBLE = (onCubeDiscovery = (postCube) => {}) => {
    const [ toggle, setToggle ] = useState(false)

    const handlePostCubeBLEChange = () => {
        setToggle(!toggle)
    }

    useEffect(() => {
        PostCubeBLE.onChange.listen(handlePostCubeBLEChange)
        return () =>
            PostCubeBLE.onChange.unlisten(handlePostCubeBLEChange)
    }, [])

    useEffect(() => {
        if (!onCubeDiscovery) {
            return
        }

        PostCubeBLE.onCubeDiscovered.listen(onCubeDiscovery)
        return () =>
            PostCubeBLE.onCubeDiscovered.unlisten(onCubeDiscovery)
    }, [onCubeDiscovery])

    return PostCubeBLE
}

export const usePostCube = (postCube) => {
    const [ toggle, setToggle ] = useState(false)
    const [ _postCube, setPostCube ] = useState(postCube)

    const handlePostCubeChange = () => {
        setToggle(!toggle)
    }

    useEffect(() => {
        setPostCube(postCube)

        if (!postCube) {
            return
        }

        postCube.addListener('change', handlePostCubeChange)
        return () =>
            postCube.removeListener('change', handlePostCubeChange)
    }, [postCube])

    return _postCube
}
