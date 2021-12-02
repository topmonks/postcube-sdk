
import { useState, useEffect } from 'react'

import { PostCubeBLE, PostCube } from './apiBLE'

export const usePostCubeBLE = (
    onCubeDiscovery?: (postCube: PostCube) => any,
): PostCubeBLE => {
    const [ toggle, setToggle ] = useState<boolean>(false)

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

export const usePostCube = (postCube?: PostCube): PostCube => {
    const [ toggle, setToggle ] = useState<boolean>(false)
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
